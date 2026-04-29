import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CombinedIssue,
  Feature,
  FeatureStatus,
  Issue,
  IssueOverviewData,
} from "./types";
import { CircleCheck, Loader, TimerOff } from "lucide-react";
import { getDevelopers, isTester } from "./teams";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const excludedIssueCategories = [
  "Requirement Error",
  "Test Environment Error",
  "External Dependency Error",
  "Not Bug",
  "Post-Release Issue",
];

export function formatValueToSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const getFeatureStatus = (status: number) => {
  switch (status) {
    case FeatureStatus.INPROGRESS:
      return {
        text: "In Progress",
        class: "text-(--chart-16) border-(--chart-16)/10",
        icon: Loader,
      };
    case FeatureStatus.ONTIME:
      return {
        text: "On Time",
        class: "text-(--chart-7) border-(--chart-7)/10",
        icon: CircleCheck,
      };
    default:
      return {
        text: "Late",
        class: "text-(--chart-11) border-(--chart-11)/10",
        icon: TimerOff,
      };
  }
};

export const visibleColumns = {
  id: "#",
  percentDone: "Progress",
  dueStatus: "Due Status",
  criticalBugs: "Critical bugs",
  highBugs: "High bugs",
  normalBugs: "Normal bugs",
  postReleaseBugs: "Post-Release bugs",

  tracker: "Tracker",
  status: "Status",
  subject: "Subject",
  author: "Author",
  assignee: "Assignee",
  priority: "Priority",
  foundVersion: "Found version",
  dueDate: "Due date",
  targetVersion: "Target version",
  relatedAppVersion: "Related app version",
  sprint: "Sprint",
  project: "Project",
  parentTask: "Parent task",
  parentTaskSubject: "Parent task subject",
  updated: "Updated",
  category: "Category",
  startDate: "Start date",
  estimatedTime: "Estimated time",
  totalEstimatedTime: "Total estimated time",
  spentTime: "Time spent",
  totalSpentTime: "Total time spent",
  created: "Created",
  closed: "Closed date",
  lastUpdatedBy: "Last updated by",
  relatedIssues: "Related issues",
  files: "Files",
  tags: "Tags",
  doneBy: "Done by",
  name: "Project name",
  position: "Position",
  issueCategories: "Issue categories",
  private: "Private",
  storyPoints: "Story points",
  ontimePercent: "% Tasks On Time",
  triggeredBy: "Triggered By",
  projectName: "Project name",
};

export const bugTrackerUrl = "https://bugtracker.i3international.com/issues";

export interface OverviewSummary {
  label: string;
  value: string | number;
}

export function exportIssuesToCSV(
  issues: CombinedIssue[],
  filename = "issues.csv",
  overview?: OverviewSummary[],
) {
  if (!issues.length) return;

  const columns: (keyof Issue)[] = [
    "id",
    "tracker",
    "status",
    "subject",
    "author",
    "assignee",
    "priority",
    "project",
    "projectName",
    "sprint",
    "category",
    "issueCategories",
    "parentTask",
    "parentTaskSubject",
    "startDate",
    "dueDate",
    "closed",
    "created",
    "updated",
    "lastUpdatedBy",
    "estimatedTime",
    "totalEstimatedTime",
    "spentTime",
    "totalSpentTime",
    "percentDone",
    "targetVersion",
    "relatedAppVersion",
    "foundVersion",
    "relatedIssues",
    "tags",
    "doneBy",
    "position",
    "storyPoints",
    "triggeredBy",
  ];

  const escape = (val: unknown): string => {
    const str =
      val == null ? "" : Array.isArray(val) ? val.join(", ") : String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const header = columns
    .map((col) => visibleColumns[col as keyof typeof visibleColumns] ?? col)
    .join(",");
  const rows = issues.map((issue) =>
    columns.map((col) => escape(issue[col])).join(","),
  );

  const sections: string[] = [header, ...rows];

  if (overview?.length) {
    sections.push(" "); // blank line separator
    sections.push("Overview");
    sections.push("Metric,Value");
    overview.forEach(({ label, value }) =>
      sections.push(`${escape(label)},${escape(value)}`),
    );
  }

  const csv = sections.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const countBugsByPriority = ({
  member,
  issues,
  priorities,
  isPostRelease = false,
}: {
  member: string;
  issues: Issue[] | CombinedIssue[];
  priorities: string[];
  isPostRelease?: boolean;
}): number => {
  return issues.reduce((count, issue) => {
    if (issue.triggeredBy && !issue.triggeredBy.includes(member)) {
      return count;
    }

    const isTesterMember = isTester(member);

    const categories = issue.issueCategories
      .split("; ")
      .map((category) => category.trim())
      .filter(Boolean);

    if (
      categories.some((category) =>
        excludedIssueCategories.includes(category),
      ) &&
      !isTesterMember
    ) {
      return count;
    }

    if (issue.status === "Rejected" && !isTesterMember) {
      return count;
    }

    const isPriorityMatch = priorities.includes(issue.priority);
    const isBug = issue.tracker === "Bug";

    if (!isBug || !isPriorityMatch) {
      return count;
    }

    const hasPostReleaseCategory = categories.includes("Post-Release Issue");

    if (isPostRelease) {
      return hasPostReleaseCategory ? count + 1 : count;
    } else {
      return !hasPostReleaseCategory ? count + 1 : count;
    }
  }, 0);
};

export const countBugsSupportedByMember = ({
  member,
  issues,
}: {
  member: string;
  issues: Issue[] | CombinedIssue[];
}) => {
  const developers = getDevelopers();

  if (!developers.some((dev) => dev.name === member)) {
    return 0;
  }

  return issues.reduce((count, issue) => {
    if (issue.triggeredBy && issue.triggeredBy.trim() !== "") {
      const triggeredByNames = issue.triggeredBy
        .split(",")
        .map((name) => name.trim());
      if (!triggeredByNames.includes(member)) {
        return count + 1;
      }
    }
    return count;
  }, 0);
};

export const calculateOverviewRate = (data: Issue[], member: string) => {
  const issues = data.filter(
    (issue) =>
      (issue.tracker === "Tasks" ||
        issue.tracker === "Task_Scr" ||
        issue.tracker === "Suggestion" ||
        issue.tracker === "Bug") &&
      issue.user === member,
  );

  const completeIssues = issues.filter(
    (issue) =>
      issue.status === "Closed" ||
      issue.status === "Resolved" ||
      issue.status === "Rejected",
  );
  const inprogressIssues = issues.filter(
    (issue) =>
      issue.status === "Waiting" ||
      issue.status === "Confirmed" ||
      issue.status === "In Progress" ||
      issue.status === "Feedback" ||
      issue.status === "Reopened",
  );

  const total = completeIssues.length + inprogressIssues.length;
  if (total === 0) {
    return { completion: 0, inprogress: 0 };
  }

  const completion = Math.round((completeIssues.length / total) * 100);
  const inprogress = 100 - completion;

  return { completion, inprogress };
};

const EMPTY_OVERVIEW: IssueOverviewData = {
  completion: 0,
  inprogress: 0,
  overdueTasks: 0,
  totalCreatedBugs: 0,
  totalFixedBugs: 0,
  totalSpentTime: 0,
  totalFoundBugs: 0,
  totalConfirmedBugs: 0,
};
export const calculateMemberData = (
  issues: CombinedIssue[],
  member: string,
) => {
  if (!issues?.length) return EMPTY_OVERVIEW;

  const { completion, inprogress } = calculateOverviewRate(issues, member);

  const totalCreatedBugs = countBugsByPriority({
    member,
    issues,
    priorities: ["High", "Urgent", "Immediate"],
  });

  const overdueTasks = issues.filter(
    (item) =>
      (item.tracker === "Tasks" || item.tracker === "Task_Scr") &&
      item.dueStatus === FeatureStatus.LATE,
  ).length;

  const totalFixedBugs = new Set(
    issues
      .filter(
        (issue) =>
          issue.tracker === "Bug" &&
          issue.status === "Closed" &&
          issue.user === member,
      )
      .map((issue) => issue.id),
  ).size;

  const totalSpentTime = issues.reduce((total, issue) => {
    if ("spentTime" in issue && typeof issue.spentTime === "number") {
      // Only count spentTime from rows where this member actually logged the time
      const isInUser = issue.user === member;
      if (!isInUser) {
        return total;
      }
      return total + issue.spentTime;
    }
    return total;
  }, 0);

  const bugFound = issues.filter(
    (issue) => issue.tracker === "Bug" && issue.author === member,
  ).length;

  const bugConfirmed = issues.filter(
    (issue) => issue.tracker === "Bug" && issue.doneBy.includes(member),
  ).length;

  return {
    completion,
    inprogress,
    overdueTasks,
    totalCreatedBugs,
    totalFixedBugs,
    totalSpentTime: parseFloat(totalSpentTime.toFixed(2)),
    totalFoundBugs: bugFound,
    totalConfirmedBugs: bugConfirmed,
  };
};

export const flattenedIssues = (features: Feature[]) => {
  return features.flatMap((feature) => feature.issues);
};
