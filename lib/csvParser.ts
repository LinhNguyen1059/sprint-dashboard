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

const normalizeProjectName = (name: string) =>
  String(name || "")
    .replace(/^#/, "")
    .trim();

/**
 * Calculate projects from combined issues data
 * @param issues Array of combined issues with project info
 * @returns Array of projects grouped by project name
 */
export function calculateProjects(
  rawIssues: CombinedIssue[],
  selectedProjects: string[],
): Project[] {
  const selectedProjectSet = new Set(
    selectedProjects.map(normalizeProjectName),
  );

  // 1) Merge duplicated rows by issue id and sum spentTime
  const mergedMap: Map<number, CombinedIssue> = new Map();

  for (const issue of rawIssues) {
    if (!issue?.id) continue;

    const issueId = Number(issue.id);
    const spentTime = Number(issue.spentTime || 0);

    if (!mergedMap.has(issueId)) {
      mergedMap.set(issueId, {
        ...issue,
        id: issueId,
        parentTask: issue.parentTask === null ? null : Number(issue.parentTask),
        spentTime,
      });
    } else {
      const existing = mergedMap.get(issueId);
      if (existing) {
        existing.spentTime += spentTime;
      }
    }
  }

  const mergedIssues = [...mergedMap.values()];

  // 2) Filter by selected projects
  const projectIssues = mergedIssues.filter((issue) => {
    const projectName = normalizeProjectName(issue.project);
    return selectedProjectSet.has(projectName);
  });

  // 3) Index issues by parentTask
  const childrenByParent: Map<number, CombinedIssue[]> = new Map();

  for (const issue of projectIssues) {
    if (issue.parentTask == null) continue;

    const bucket = childrenByParent.get(issue.parentTask) ?? [];
    bucket.push(issue);
    childrenByParent.set(issue.parentTask, bucket);
  }

  // 4) Group issues by project
  const issuesByProject: Map<string, CombinedIssue[]> = new Map();

  for (const issue of projectIssues) {
    const projectName = normalizeProjectName(issue.project);

    const bucket = issuesByProject.get(projectName) ?? [];
    bucket.push(issue);
    issuesByProject.set(projectName, bucket);
  }

  // 5) Build project -> features -> all descendant issues
  const result: Project[] = [];

  for (const [projectName, issues] of issuesByProject.entries()) {
    const epics = issues.filter((issue) => issue.tracker === "Epic");

    const features = epics.map((epic) => {
      const collected: CombinedIssue[] = [];
      const visited = new Set<number>();
      const queue = [...(childrenByParent.get(epic.id) ?? [])];

      while (queue.length) {
        const current = queue.shift();
        if (!current || visited.has(current.id)) continue;

        visited.add(current.id);
        collected.push(current);

        const children = childrenByParent.get(current.id) ?? [];
        queue.push(...children);
      }

      const feature: Feature = {
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
        issues: collected,
      };

      collected.forEach((issue) => accumulateIssueMetrics(issue, feature));

      return feature;
    });

    const { totalMembers, totalDevs } = calculateMembersInProject(issues);

    result.push({
      name: projectName,
      slug: formatValueToSlug(projectName),
      totalMembers,
      totalDevs,
      features,
    });
  }

  return result;
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

  const addIssueToMember = (userName: string, issue: CombinedIssue) => {
    if (!validMemberNames.has(userName)) return;
    if (!memberMap[userName]) {
      memberMap[userName] = {
        slug: formatValueToSlug(userName),
        name: userName,
        issues: [],
        projects: [],
        role: getMemberRole(userName),
      };
    }
    if (!memberMap[userName].issues.some((i) => i.id === issue.id)) {
      memberMap[userName].issues.push(issue);
      if (!memberMap[userName].projects.includes(issue.projectName)) {
        memberMap[userName].projects.push(issue.projectName);
      }
    }
  };

  // First pass: add issues by user field so that each member's own time-log rows
  // are always present before any triggeredBy rows for the same issue ID.
  issues.forEach((issue) => {
    if (issue.user && issue.user.trim() !== "") {
      addIssueToMember(issue.user.trim(), issue);
    }
  });

  // Second pass: add issues triggered by member (only if not already added above).
  issues.forEach((issue) => {
    if (issue.triggeredBy && issue.triggeredBy.trim() !== "") {
      addIssueToMember(issue.triggeredBy.trim(), issue);
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
