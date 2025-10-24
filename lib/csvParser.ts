import { parse, ParseResult } from "papaparse";
import {
  CombinedIssue,
  Feature,
  FeatureStatus,
  Project,
  Solution,
  Story,
  Team,
  Member
} from "./types";
import { flattenedIssues, formatValueToSlug } from "./utils";
import { getDevelopers, getMemberRole, getMembers } from "./teams";

// Define a type for our CSV row data
type CSVRowData = Record<string, string>;

/**
 * Parse a File object (from browser upload) and extract issues with project info
 * @param file File object from input
 * @returns Promise that resolves to array of issues with project info
 */
export function parseCSVFileObject(file: File): Promise<CombinedIssue[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        if (!fileContent) {
          reject(new Error("Failed to read file content"));
          return;
        }

        // Extract project name from file name
        const projectName = file.name.replace(".csv", "").replace(/%20/g, " ");
        const projectSlug = formatValueToSlug(projectName);

        // Parse CSV data
        const parsedData: ParseResult<CSVRowData> = parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transform: (value, header) => {
            // Transform numeric fields
            if (header === "#" || header === "Parent task") {
              return value ? parseInt(value, 10) : null;
            }
            if (
              header === "Estimated time" ||
              header === "Total estimated time" ||
              header === "Spent time" ||
              header === "Total spent time" ||
              header === "Story points" ||
              header === "% Done"
            ) {
              return value ? parseFloat(value) : 0;
            }
            if (header === "Private") {
              return value === "1";
            }
            return value;
          }
        });

        // Convert parsed data to our CombinedIssue interface
        const issues: CombinedIssue[] = parsedData.data.map((row) => {
          return {
            id: row["#"] ? parseInt(row["#"], 10) : 0,
            tracker: row["Tracker"] || "",
            status: row["Status"] || "",
            subject: row["Subject"] || "",
            author: row["Author"] || "",
            assignee: row["Assignee"] || "",
            priority: row["Priority"] || "",
            foundVersion: row["Found Version"] || "",
            dueDate: row["Due date"] || "",
            targetVersion: row["Target version"] || "",
            relatedAppVersion: row["Related app version"] || "",
            sprint: row["Sprint"] || "",
            project: row["Project"] || "",
            parentTask: row["Parent task"]
              ? parseInt(row["Parent task"], 10)
              : null,
            parentTaskSubject: row["Parent task subject"] || "",
            updated: row["Updated"] || "",
            category: row["Category"] || "",
            startDate: row["Start date"] || "",
            estimatedTime: row["Estimated time"]
              ? parseFloat(row["Estimated time"])
              : 0,
            totalEstimatedTime: row["Total estimated time"]
              ? parseFloat(row["Total estimated time"])
              : 0,
            spentTime: row["Spent time"] ? parseFloat(row["Spent time"]) : 0,
            totalSpentTime: row["Total spent time"]
              ? parseFloat(row["Total spent time"])
              : 0,
            percentDone: row["% Done"] ? parseFloat(row["% Done"]) : 0,
            created: row["Created"] || "",
            closed: row["Closed"] || "",
            lastUpdatedBy: row["Last updated by"] || "",
            relatedIssues: row["Related issues"] || "",
            files: row["Files"] || "",
            tags: row["Tags"]
              ? row["Tags"].split(",").map((tag: string) => tag.trim())
              : [],
            doneBy: row["Done by"] || "",
            projectName: row["Project Name"] || projectName,
            position: row["Position"] || "",
            issueCategories: row["Issue Categories"] || "",
            private: row["Private"] === "1",
            storyPoints: row["Story points"]
              ? parseFloat(row["Story points"])
              : 0,
            projectSlug: projectSlug,
            dueStatus: calculateFeatureStatus({
              closedDate: row["Closed"],
              dueDate: row["Due date"],
              status: row["Status"]
            }),
            triggeredBy: row["Triggered By"]
          };
        });

        const filterIssues = issues.filter(
          (issue) => issue.status !== "Rejected"
        );

        resolve(filterIssues);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse multiple File objects (from browser upload) and combine all data
 * @param files Array of File objects from input
 * @returns Promise that resolves to combined array of issues with project info
 */
export async function parseMultipleCSVFileObjects(
  files: File[]
): Promise<CombinedIssue[]> {
  const allIssues: CombinedIssue[] = [];

  for (const file of files) {
    const issues = await parseCSVFileObject(file);
    allIssues.push(...issues);
  }

  return allIssues;
}

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
  status
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
          status: epic.status
        }),
        slug: formatValueToSlug(epic.subject),
        criticalBugs: 0,
        highBugs: 0,
        postReleaseBugs: 0,
        stories: [],
        others: []
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
        if (
          issue.issueCategories.includes("Requirement Error") ||
          issue.issueCategories.includes("Test Environment Error")
        ) {
          return;
        }

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
        postReleaseBugs: postReleaseCount
      };
    });

  // Identify "other" tasks that belong to epics but are not stories or epics themselves
  const otherTasks: CombinedIssue[] = projectIssues.filter((issue) => {
    return (
      issue.tracker !== "Epic" &&
      issue.tracker !== "Story" &&
      issue.parentTask !== null
    );
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

      if (
        task.issueCategories.includes("Requirement Error") ||
        task.issueCategories.includes("Test Environment Error")
      ) {
        return;
      }

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
      uniqueAssignees.add(issue.assignee.trim());
      uniqueAssignees.add(issue.doneBy.trim());
    }
  });
  const allMembers = getMembers();
  const developers = getDevelopers();
  const members = allMembers.filter((member) =>
    uniqueAssignees.has(member.name)
  );
  const totalMembers = members.length || 0;
  const totalDevs = developers.filter((dev) =>
    uniqueAssignees.has(dev.name)
  ).length;

  return {
    members,
    totalMembers,
    totalDevs
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
      features: features
    };

    projects.push(project);
  }

  return projects;
}

/**
 * Calculate solutions from combined issues data
 * @param issues Array of combined issues with project info
 * @returns Array of solutions grouped by tags
 */
export function calculateSolutions(issues: CombinedIssue[]): Solution[] {
  // Collect all unique tags across all issues
  const allTags = new Set<string>();
  issues.forEach((issue) => {
    issue.tags.forEach((tag) => {
      if (tag.trim() !== "") {
        allTags.add(tag.trim());
      }
    });
  });

  // Process all issues to extract features, stories and other tasks
  const { features: allFeatures } = processProjectIssues(issues);

  // Filter to only include actual features (Epics)
  const epics = allFeatures.filter((feature) => feature.tracker === "Epic");

  // Process each tag as a solution
  const solutions: Solution[] = [];
  allTags.forEach((tagName) => {
    const tagSlug = formatValueToSlug(tagName);

    // Collect all features that have this tag
    const taggedFeatures = epics.filter((feature) =>
      feature.tags.includes(tagName)
    );
    const issues = flattenedIssues(taggedFeatures);

    // Count unique members (assignees) for this solution
    const { totalMembers, totalDevs } = calculateMembersInProject(issues);

    // Create the solution structure
    const solution: Solution = {
      name: tagName,
      slug: tagSlug,
      totalItems: issues.length,
      totalMembers: totalMembers,
      totalDevs: totalDevs,
      features: taggedFeatures
    };

    solutions.push(solution);
  });

  return solutions;
}

/**
 * Calculate members from combined issues data
 * @param issues Array of combined issues with project info
 * @param teams Array of teams with their members
 * @returns Array of members with their stats
 */
export function calculateMembers(
  issues: CombinedIssue[],
  teams: Team[]
): Member[] {
  // Create a set of valid member names from teams for quick lookup
  const validMemberNames = new Set<string>();
  teams.forEach((team) => {
    team.members.forEach((member) => {
      if (member && member.name.trim() !== "") {
        validMemberNames.add(member.name);
      }
    });
  });

  // If no teams are defined, extract member names from the issues data as a fallback
  const useFallback = teams.length === 0;
  if (useFallback) {
    issues.forEach((issue) => {
      if (issue.assignee && issue.assignee.trim() !== "") {
        const assignee = issue.assignee.trim();
        if (validMemberNames.has(assignee) || useFallback) {
          validMemberNames.add(assignee);
        }
      }
      if (issue.doneBy && issue.doneBy.trim() !== "") {
        const doneByNames = issue.doneBy.split(",").map((name) => name.trim());
        doneByNames.forEach((name) => {
          if (name && name.trim() !== "") {
            const doneByName = name.trim();
            if (validMemberNames.has(doneByName) || useFallback) {
              validMemberNames.add(doneByName);
            }
          }
        });
      }
    });
  }

  // Create a map of member names to their stats
  const memberMap: Record<string, Member> = {};

  // Collect all unique member names from assignee and doneBy fields
  issues.forEach((issue) => {
    // Process assignee
    if (issue.assignee && issue.assignee.trim() !== "") {
      const assignee = issue.assignee.trim();

      // Only process if the assignee is in our valid members list (or if using fallback)
      if (validMemberNames.has(assignee) || useFallback) {
        if (!memberMap[assignee]) {
          memberMap[assignee] = {
            slug: formatValueToSlug(assignee),
            name: assignee,
            issues: [],
            projects: [],
            role: getMemberRole(assignee)
          };
        }
        memberMap[assignee].issues.push(issue);
        if (!memberMap[assignee].projects.includes(issue.projectName)) {
          memberMap[assignee].projects.push(issue.projectName);
        }
      }
    }

    // Process doneBy (could be multiple names separated by commas)
    if (issue.doneBy && issue.doneBy.trim() !== "") {
      const doneByNames = issue.doneBy.split(",").map((name) => name.trim());
      doneByNames.forEach((name) => {
        if (name && name.trim() !== "") {
          const doneByName = name.trim();

          // Only process if the doneBy name is in our valid members list (or if using fallback)
          if (validMemberNames.has(doneByName) || useFallback) {
            if (!memberMap[doneByName]) {
              memberMap[doneByName] = {
                slug: formatValueToSlug(doneByName),
                name: doneByName,
                projects: [],
                issues: [],
                role: getMemberRole(doneByName)
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
  });

  // Convert the map to an array
  return Object.values(memberMap);
}
