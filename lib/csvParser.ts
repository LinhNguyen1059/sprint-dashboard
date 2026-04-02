import {
  CombinedIssue,
  FeatureStatus,
  Team,
  Member,
  ApiReportResponse,
  MemberWithOverview,
  Project,
  Story,
  Feature,
} from "./types";
import { calculateMemberData, formatValueToSlug } from "./utils";
import {
  getDevelopers,
  getMemberRole,
  getMembers,
  getTestersNames,
} from "./teams";
import { isValid } from "date-fns";

/**
 * Calculate feature status based on due date, closed date and status
 * @param dueDate Due date of the feature
 * @param closedDate Closed date of the feature
 * @param status Status of the feature
 * @returns Feature status
 */
function calculateFeatureStatus({
  dueDate,
  closedDate,
  status,
}: {
  dueDate: string;
  closedDate: string;
  status: string;
}) {
  if (status === "Closed") {
    return FeatureStatus.ONTIME;
  }
  if (dueDate && closedDate) {
    const due = new Date(dueDate);
    const closed = new Date(closedDate);
    // Normalize dates to compare only date parts (ignore time)
    due.setHours(0, 0, 0, 0);
    closed.setHours(0, 0, 0, 0);
    return closed > due ? FeatureStatus.LATE : FeatureStatus.ONTIME;
  }
  if (dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    // Normalize dates to compare only date parts (ignore time)
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (today > due) {
      return FeatureStatus.LATE;
    }
  }
  return FeatureStatus.INPROGRESS;
}

/**
 * Process issues within a project and calculate feature metrics
 * @param projectIssues Array of issues within a project
 * @returns Processed issues with feature metrics
 */
function processProjectIssues(projectIssues: CombinedIssue[]) {
  // Group issues by parent task within this project
  const issuesByParent: Record<number, CombinedIssue[]> = {};
  projectIssues.forEach((issue) => {
    const parentId = issue.parentTask;
    if (parentId) {
      if (!issuesByParent[parentId]) {
        issuesByParent[parentId] = [];
      }
      issuesByParent[parentId].push(issue);
    }
  });

  // Identify features (Epics) within this project
  const features: Feature[] = projectIssues
    .filter((issue) => issue.tracker === "Epic")
    .map((epic) => {
      return {
        ...epic,
        dueStatus: calculateFeatureStatus({
          closedDate: epic.closed,
          dueDate: epic.dueDate,
          status: epic.status,
        }),
        slug: formatValueToSlug(epic.subject),
        criticalBugs: 0,
        highBugs: 0,
        postReleaseBugs: 0,
        stories: [],
        others: [],
      };
    });

  // Identify stories and other issues within this project
  const stories: Story[] = projectIssues
    .filter((issue) => issue.tracker === "Story")
    .map((story) => {
      // Get child issues for this story
      const childIssues = issuesByParent[story.id] || [];

      let criticalCount = 0;
      let highCount = 0;
      let postReleaseCount = 0;

      // Check if the issue is a bug with priority "Urgent" or "High"
      childIssues.forEach((issue) => {
        if (issue.tracker === "Bug") {
          // Check if the issue has category "Post-Release Issue"
          if (issue.issueCategories.includes("Post-Release Issue")) {
            if (issue.priority === "Urgent") {
              postReleaseCount += 1;
            } else if (issue.priority === "Immediate") {
              postReleaseCount += 1;
            }
            return;
          }

          if (issue.priority === "Urgent") {
            criticalCount += 1;
          } else if (issue.priority === "Immediate") {
            criticalCount += 1;
          } else if (issue.priority === "High") {
            highCount += 1;
          }
        }
      });

      return {
        ...story,
        name: story.subject,
        timeSpent: story.totalSpentTime,
        parent: story.parentTask || 0,
        issues: childIssues,
        criticalBugs: criticalCount,
        highBugs: highCount,
        postReleaseBugs: postReleaseCount,
      };
    });

  // Identify "other" tasks that belong to epics but are not stories or epics themselves
  const otherTasks: CombinedIssue[] = projectIssues.filter((issue) => {
    return issue.tracker !== "Epic" && issue.tracker !== "Story";
  });

  // Associate stories with their features and aggregate counts
  stories.forEach((story) => {
    const feature = features.find((f) => f.id === story.parent);
    if (feature) {
      // Add the story to the feature
      feature.stories.push(story);

      // Aggregate bug counts from the story to the feature
      feature.criticalBugs += story.criticalBugs || 0;
      feature.highBugs += story.highBugs || 0;
      feature.postReleaseBugs += story.postReleaseBugs || 0;
    }
  });

  // Associate "other" tasks with their features
  otherTasks.forEach((task) => {
    const feature = features.find((f) => f.id === task.parentTask);
    if (feature) {
      feature.others.push(task);

      if (task.tracker === "Bug") {
        // Check if the issue has category "Post-Release Issue"
        if (task.issueCategories.includes("Post-Release Issue")) {
          if (task.priority === "Urgent") {
            feature.postReleaseBugs += 1;
          } else if (task.priority === "Immediate") {
            feature.postReleaseBugs += 1;
          }
          return;
        }

        if (task.priority === "Urgent") {
          feature.criticalBugs += 1;
        } else if (task.priority === "Immediate") {
          feature.criticalBugs += 1;
        } else if (task.priority === "High") {
          feature.highBugs += 1;
        }
      }
    }
  });

  return { features, stories, otherTasks };
}

/**
 * Calculate members in a project
 * @param issues Array of issues within a project
 * @returns Members in the project
 */
/**
 * Calculate members in a project based on issue assignees
 * @param issues Array of issues within a project
 * @returns Object containing members and their counts
 */
function calculateMembersInProject(issues: CombinedIssue[]) {
  const uniqueAssignees = new Set<string>();
  issues.forEach((issue) => {
    if (
      (issue.assignee && issue.assignee.trim() !== "") ||
      (issue.doneBy && issue.doneBy.trim() !== "")
    ) {
      const assigneeNames = issue.assignee
        .split(",")
        .map((name) => name.trim());
      assigneeNames.forEach((name) => {
        if (name && name.trim() !== "") {
          uniqueAssignees.add(name);
        }
      });

      const doneByNames = issue.doneBy.split("; ").map((name) => name.trim());
      doneByNames.forEach((name) => {
        if (name && name.trim() !== "") {
          uniqueAssignees.add(name);
        }
      });
    }
  });
  const allMembers = getMembers();
  const developers = getDevelopers();
  const members = allMembers.filter((member) =>
    uniqueAssignees.has(member.name),
  );
  const totalMembers = members.length || 0;
  const totalDevs = developers.filter((dev) =>
    uniqueAssignees.has(dev.name),
  ).length;

  return {
    members,
    totalMembers,
    totalDevs,
  };
}

/**
 * Calculate projects from combined issues data
 * @param issues Array of combined issues with project info
 * @returns Array of projects grouped by project name
 */
export function calculateProjects(issues: CombinedIssue[]): Project[] {
  // Group issues by project
  const issuesByProject: Record<string, CombinedIssue[]> = {};
  issues.forEach((issue) => {
    const projectName = issue.projectName;
    if (!issuesByProject[projectName]) {
      issuesByProject[projectName] = [];
    }
    issuesByProject[projectName].push(issue);
  });

  // Process each project
  const projects: Project[] = [];
  for (const projectName in issuesByProject) {
    const projectIssues = issuesByProject[projectName];
    const projectSlug = formatValueToSlug(projectName);

    // Count unique members (assignees) in this project
    const { totalMembers, totalDevs } =
      calculateMembersInProject(projectIssues);

    // Process issues to extract features, stories and other tasks
    const { features } = processProjectIssues(projectIssues);

    // Create the project structure
    const project: Project = {
      name: projectName,
      slug: projectSlug,
      totalItems: projectIssues.length,
      totalMembers: totalMembers,
      totalDevs: totalDevs,
      features: features,
    };

    projects.push(project);
  }

  return projects;
}

/**
 * Calculate members from combined issues data
 * @param issues Array of combined issues with project info
 * @param teams Array of teams with their members
 * @returns Array of members with their stats
 */
export function calculateMembers(
  issues: CombinedIssue[],
  teams: Team[],
): MemberWithOverview[] {
  // Create a set of valid member names from teams for quick lookup
  const validMemberNames = new Set<string>();
  teams.forEach((team) => {
    team.members.forEach((member) => {
      if (member && member.name.trim() !== "") {
        validMemberNames.add(member.name);
      }
    });
  });

  validMemberNames.delete("Dung Tran");

  // Create a map of member names to their stats
  const memberMap: Record<string, Member> = {};

  // Collect all unique member names from assignee and doneBy fields
  issues.forEach((issue) => {
    // Process assignee
    if (issue.assignee && issue.assignee.trim() !== "") {
      const assigneeNames = issue.assignee
        .split(",")
        .map((name) => name.trim());

      assigneeNames.forEach((name) => {
        if (name && name.trim() !== "") {
          const assigneeName = name.trim();

          if (assigneeName === "Dung Tran") {
            return;
          }

          // Only process if the assignee is in our valid members list (or if using fallback)
          if (validMemberNames.has(assigneeName)) {
            if (!memberMap[assigneeName]) {
              memberMap[assigneeName] = {
                slug: formatValueToSlug(assigneeName),
                name: assigneeName,
                issues: [],
                projects: [],
                role: getMemberRole(assigneeName),
              };
            }
            memberMap[assigneeName].issues.push(issue);
            if (!memberMap[assigneeName].projects.includes(issue.projectName)) {
              memberMap[assigneeName].projects.push(issue.projectName);
            }
          }
        }
      });
    }

    // Process doneBy (could be multiple names separated by semicolons)
    if (issue.doneBy && issue.doneBy.trim() !== "") {
      const doneByNames = issue.doneBy.split("; ").map((name) => name.trim());

      doneByNames.forEach((name) => {
        if (name && name.trim() !== "") {
          const doneByName = name.trim();

          if (doneByName === "Dung Tran") {
            return;
          }

          // Only process if the doneBy name is in our valid members list (or if using fallback)
          if (validMemberNames.has(doneByName)) {
            if (!memberMap[doneByName]) {
              memberMap[doneByName] = {
                slug: formatValueToSlug(doneByName),
                name: doneByName,
                projects: [],
                issues: [],
                role: getMemberRole(doneByName),
              };
            }
            // Only add the issue if it's not already in the array
            if (!memberMap[doneByName].issues.includes(issue)) {
              memberMap[doneByName].issues.push(issue);
              if (!memberMap[doneByName].projects.includes(issue.projectName)) {
                memberMap[doneByName].projects.push(issue.projectName);
              }
            }
          }
        }
      });
    }

    // Process triggeredBy (could be multiple names separated by commas)
    if (issue.triggeredBy && issue.triggeredBy.trim() !== "") {
      const triggeredByNames = issue.triggeredBy
        .split(",")
        .map((name) => name.trim());
      triggeredByNames.forEach((name) => {
        if (name && name.trim() !== "") {
          const triggeredByName = name.trim();

          if (triggeredByName === "Dung Tran") {
            return;
          }

          // Only process if the doneBy name is in our valid members list (or if using fallback)
          if (validMemberNames.has(triggeredByName)) {
            if (!memberMap[triggeredByName]) {
              memberMap[triggeredByName] = {
                slug: formatValueToSlug(triggeredByName),
                name: triggeredByName,
                projects: [],
                issues: [],
                role: getMemberRole(triggeredByName),
              };
            }
            // Only add the issue if it's not already in the array
            if (!memberMap[triggeredByName].issues.includes(issue)) {
              memberMap[triggeredByName].issues.push(issue);
              if (
                !memberMap[triggeredByName].projects.includes(issue.projectName)
              ) {
                memberMap[triggeredByName].projects.push(issue.projectName);
              }
            }
          }
        }
      });
    }

    // Process author & author must be a tester
    if (issue.author && issue.author.trim() !== "") {
      const authorName = issue.author.trim();

      if (authorName === "Dung Tran") {
        return;
      }

      const testersNames = getTestersNames();
      if (testersNames.includes(authorName)) {
        if (!memberMap[authorName]) {
          memberMap[authorName] = {
            slug: formatValueToSlug(authorName),
            name: authorName,
            projects: [],
            issues: [],
            role: getMemberRole(authorName),
          };
        }
        // Only add the issue if it's not already in the array
        if (!memberMap[authorName].issues.includes(issue)) {
          memberMap[authorName].issues.push(issue);
          if (!memberMap[authorName].projects.includes(issue.projectName)) {
            memberMap[authorName].projects.push(issue.projectName);
          }
        }
      }
    }
  });

  const memberData = Object.values(memberMap);
  const overviewData = memberData.map((member) => {
    return {
      ...member,
      ...calculateMemberData(member.issues, member.name),
    };
  });

  return overviewData;
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return isValid(date) && date.getFullYear() >= 1900;
}

export function parseReportData(data: ApiReportResponse[]): CombinedIssue[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Convert parsed data to our CombinedIssue interface
  const issues: CombinedIssue[] = data.map((row) => {
    return {
      id: row["issueID"] || 0,
      tracker: row["tracker"] || "",
      status: row["status"] || "",
      subject: row["subject"] || "",
      author: row["author"] || "",
      assignee: row["assignee"] || "",
      priority: row["priority"] || "",
      foundVersion: row["foundVersion"] || "",
      dueDate: isValidDate(row["dueDate"]) ? row["dueDate"] : "",
      targetVersion: row["targetVersion"] || "",
      relatedAppVersion: row["relatedAppVersion"] || "",
      sprint: row["sprint"] || "",
      project: row["project"] || "",
      parentTask: row["parentTask"] ? parseInt(row["parentTask"], 10) : null,
      parentTaskSubject: row["parentTaskSubject"] || "",
      updated: isValidDate(row["updated"]) ? row["updated"] : "",
      category: row["category"] || "",
      startDate: isValidDate(row["startDate"]) ? row["startDate"] : "",
      estimatedTime: row["estimatedTime"] || 0,
      totalEstimatedTime: row["totalEstimatedTime"] || 0,
      spentTime: row["spentTime"] || 0,
      totalSpentTime:
        row["totalSpentTime"] && typeof row["totalSpentTime"] === "number"
          ? row["totalSpentTime"] / 100
          : 0,
      percentDone: row["percentDone"] || 0,
      created: isValidDate(row["created"]) ? row["created"] : "",
      closed: isValidDate(row["closed"]) ? row["closed"] : "",
      lastUpdatedBy: row["lastUpdatedBy"] || "",
      relatedIssues: row["relatedIssues"] || "",
      tags: row["tags"]
        ? row["tags"].split(",").map((tag: string) => tag.trim())
        : [],
      doneBy: row["doneBy"] || "",
      projectName: row["projectName"] || row["project"] || "",
      position: row["position"] || "",
      issueCategories: row["issueCategories"] || "",
      private: row["private"] === "1",
      storyPoints: row["storyPoints"] ? parseInt(row["storyPoints"], 10) : 0,
      dueStatus: calculateFeatureStatus({
        closedDate: row["closed"],
        dueDate: row["dueDate"],
        status: row["status"],
      }),
      triggeredBy: row["triggeredBy"],
      isWithoutSubtasks: true, // Default to true, will be calculated later
      projectSlug: "",
    };
  });

  // Calculate isWithoutSubtasks: an issue has no subtasks if no other issue has it as parentTask
  const issueWithSubtasks = new Set<number>();
  issues.forEach((issue) => {
    if (issue.parentTask) {
      issueWithSubtasks.add(issue.parentTask);
    }
  });

  issues.forEach((issue) => {
    issue.isWithoutSubtasks = !issueWithSubtasks.has(issue.id);
  });

  return issues;
}
