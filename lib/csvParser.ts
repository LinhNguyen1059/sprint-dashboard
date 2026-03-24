import {
  CombinedIssue,
  FeatureStatus,
  Team,
  Member,
  ApiReportResponse,
} from "./types";
import { formatValueToSlug } from "./utils";
import { getMemberRole, getTestersNames } from "./teams";

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
  tracker,
}: {
  dueDate: string;
  closedDate: string;
  status: string;
  tracker: string;
}) {
  if (tracker !== "Tasks" && tracker !== "Task_Scr") {
    return FeatureStatus.NONE;
  }
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
 * Calculate members from combined issues data
 * @param issues Array of combined issues with project info
 * @param teams Array of teams with their members
 * @returns Array of members with their stats
 */
export function calculateMembers(
  issues: CombinedIssue[],
  teams: Team[],
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

    // Process doneBy (could be multiple names separated by commas)
    if (issue.doneBy && issue.doneBy.trim() !== "") {
      const doneByNames = issue.doneBy.split(",").map((name) => name.trim());

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

  // Convert the map to an array
  return Object.values(memberMap);
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
      dueDate: row["dueDate"] || "",
      targetVersion: row["targetVersion"] || "",
      relatedAppVersion: row["relatedAppVersion"] || "",
      sprint: row["sprint"] || "",
      project: row["project"] || "",
      parentTask: row["parentTask"] ? parseInt(row["parentTask"], 10) : null,
      parentTaskSubject: row["parentTaskSubject"] || "",
      updated: row["updated"] || "",
      category: row["category"] || "",
      startDate: row["startDate"] || "",
      estimatedTime: row["estimatedTime"] || 0,
      totalEstimatedTime: row["totalEstimatedTime"] || 0,
      spentTime: row["spentTime"] || 0,
      totalSpentTime: row["totalSpentTime"] || 0,
      percentDone: row["percentDone"] || 0,
      created: row["created"] || "",
      closed: row["closed"] || "",
      lastUpdatedBy: row["lastUpdatedBy"] || "",
      relatedIssues: row["relatedIssues"] || "",
      tags: row["tags"]
        ? row["tags"].split(",").map((tag: string) => tag.trim())
        : [],
      doneBy: row["doneBy"] || "",
      projectName: row["projectName"] || "",
      position: row["position"] || "",
      issueCategories: row["issueCategories"] || "",
      private: row["private"] === "1",
      storyPoints: row["storyPoints"] ? parseInt(row["storyPoints"], 10) : 0,
      dueStatus: calculateFeatureStatus({
        closedDate: row["closed"],
        dueDate: row["dueDate"],
        status: row["status"],
        tracker: row["tracker"],
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
