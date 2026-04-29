import { v4 as uuidv4 } from "uuid";
import { isValid } from "date-fns";

import {
  CombinedIssue,
  FeatureStatus,
  Team,
  Member,
  ApiReportResponse,
  MemberWithOverview,
  Project,
  Feature,
} from "./types";
import { calculateMemberData, formatValueToSlug } from "./utils";
import { getDevelopers, getMemberRole, getMembers } from "./teams";

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
 * Count bug severity metrics for a single issue.
 * Returns zeros for non-bug trackers.
 */
function countBugs(issue: CombinedIssue): {
  critical: number;
  high: number;
  postRelease: number;
} {
  if (issue.tracker !== "Bug") return { critical: 0, high: 0, postRelease: 0 };

  const isUrgentOrImmediate =
    issue.priority === "Urgent" || issue.priority === "Immediate";

  if (issue.issueCategories.includes("Post-Release Issue")) {
    return { critical: 0, high: 0, postRelease: isUrgentOrImmediate ? 1 : 0 };
  }

  if (isUrgentOrImmediate) return { critical: 1, high: 0, postRelease: 0 };
  if (issue.priority === "High")
    return { critical: 0, high: 1, postRelease: 0 };

  return { critical: 0, high: 0, postRelease: 0 };
}

/**
 * Accumulate metrics from a single leaf issue into its parent Feature.
 */
function accumulateIssueMetrics(issue: CombinedIssue, feature: Feature) {
  const { critical, high, postRelease } = countBugs(issue);
  feature.criticalBugs += critical;
  feature.highBugs += high;
  feature.postReleaseBugs += postRelease;

  if (
    (issue.tracker === "Tasks" || issue.tracker === "Task_Scr") &&
    issue.dueStatus === FeatureStatus.LATE
  ) {
    feature.overdueTasks += 1;
  }

  if (
    issue.status === "Closed" ||
    issue.status === "Resolved" ||
    issue.status === "Rejected"
  ) {
    feature.completion += 1;
  }

  if (
    issue.status === "Waiting" ||
    issue.status === "Confirmed" ||
    issue.status === "In Progress" ||
    issue.status === "Feedback" ||
    issue.status === "Reopened"
  ) {
    feature.inProgress += 1;
  }
}

/**
 * Recursively walk the subtree rooted at `nodeId`, adding every non-Epic
 * descendant to `feature.issues` so the issue table shows all branches and
 * leaves. Metrics (bug counts, completion, etc.) are accumulated only on
 * true leaf nodes (no children) to avoid double-counting.
 *
 * Cross-project children are included automatically because `childrenByParent`
 * is built from the full dataset — no project filter is applied here.
 *
 * Handles any depth: Epic → Story → Suggestion → Task → …
 */
function collectLeafIssues(
  nodeId: number,
  childrenByParent: Map<number, CombinedIssue[]>,
  feature: Feature,
) {
  const children = childrenByParent.get(nodeId);
  if (!children || children.length === 0) return;

  children.forEach((child) => {
    if (child.tracker === "Epic") return; // Epics are always roots, never leaves

    // Always add every non-Epic descendant so the issue table shows branches too
    feature.issues.push(child);
    // Accumulate metrics for every node so the counter matches the table row count
    accumulateIssueMetrics(child, feature);

    const grandchildren = childrenByParent.get(child.id);
    if (grandchildren && grandchildren.length > 0) {
      // Intermediate node — recurse deeper
      collectLeafIssues(child.id, childrenByParent, feature);
    }
  });
}

/**
 * Process issues within a project and produce a feature-centric data model.
 *
 * The hierarchy is fully recursive and not limited to depth:
 *   Epic → Story → Task/Bug/Suggestion
 *   Epic → Bug/Task/Suggestion
 *   Epic → Suggestion → Task
 *   Epic → Story → Suggestion → Task → …
 *
 * Only leaf nodes (issues with no children in the dataset) are added to
 * `feature.issues`. Intermediate nodes (Stories, Suggestions with children,
 * etc.) are traversal-only and do not appear in the output.
 *
 * Child issues from other projects are included if their parent chain leads
 * back to an Epic in this project.
 *
 * @param projectName Scope: only Epics belonging to this project are returned
 * @param allIssues   Full issue set used for cross-project parent resolution
 */
function processProjectIssues(projectName: string, allIssues: CombinedIssue[]) {
  // Build parent → direct children map from the full dataset (O(n))
  const childrenByParent = new Map<number, CombinedIssue[]>();
  allIssues.forEach((issue) => {
    if (issue.parentTask === null) return;
    const siblings = childrenByParent.get(issue.parentTask) ?? [];
    siblings.push(issue);
    childrenByParent.set(issue.parentTask, siblings);
  });

  // Build Feature objects for every Epic that belongs to this project
  const featureById = new Map<number, Feature>();
  allIssues
    .filter(
      (issue) => issue.tracker === "Epic" && issue.projectName === projectName,
    )
    .forEach((epic) => {
      featureById.set(epic.id, {
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
        completion: 0,
        inProgress: 0,
        overdueTasks: 0,
        issues: [],
      });
    });

  // For each Feature, recursively collect all leaf descendants
  featureById.forEach((feature, epicId) => {
    collectLeafIssues(epicId, childrenByParent, feature);
  });

  return {
    features: Array.from(featureById.values()).filter(
      (f) => f.issues.length > 0,
    ),
  };
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

    // Process issues to extract features, stories and other tasks.
    // Pass projectName so features are scoped to their Epic's project.
    // allIssues is passed so cross-project child issues are also routed.
    const { features } = processProjectIssues(projectName, issues);

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

  // Create a map of member names to their stats
  const memberMap: Record<string, Member> = {};

  // Collect all unique member names from assignee and doneBy fields
  issues.forEach((issue) => {
    if (issue.user && issue.user.trim() !== "") {
      const userNames = issue.user.split(",").map((name) => name.trim());

      userNames.forEach((name) => {
        if (name && name.trim() !== "") {
          const userName = name.trim();

          // Only process if the user is in our valid members list (or if using fallback)
          if (validMemberNames.has(userName)) {
            if (!memberMap[userName]) {
              memberMap[userName] = {
                slug: formatValueToSlug(userName),
                name: userName,
                issues: [],
                projects: [],
                role: getMemberRole(userName),
              };
            }
            if (!memberMap[userName].issues.includes(issue)) {
              memberMap[userName].issues.push(issue);
              if (!memberMap[userName].projects.includes(issue.projectName)) {
                memberMap[userName].projects.push(issue.projectName);
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
      uuid: uuidv4(),
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
      totalSpentTime: row["spentTime"] || 0,
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
      user: row["user"] || "",
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
