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
  aiAssistance: "AI Assistance",
};

export const bugTrackerUrl = "https://bugtracker.i3international.com/issues";

export interface OverviewSummary {
  label: string;
  value: string | number;
}

export const pointEntryTrackers = [
  "Task",
  "Tasks",
  "Task_Src",
  "Task_Scr",
  "Suggestion",
] as const;

export const isPointEntryTracker = (tracker: string) => {
  return pointEntryTrackers.includes(
    tracker as (typeof pointEntryTrackers)[number],
  );
};

export interface DevScoreOverview {
  totalEarnedPoint: number;
  criticalBugs: number;
  highBugs: number;
  bugDensity: number;
  qualityScore: number;
  maxTeamPoint: number;
  deliveryScore: number;
  contributionEffortScore: number;
  finalDeliveryScore: number;
  totalScore: number;
}

const roundTo2 = (value: number) => Number(value.toFixed(2));

const calculateQualityScore = (bugDensity: number): number => {
  if (bugDensity <= 0.2) return 100;
  if (bugDensity <= 0.4) return 90;
  if (bugDensity <= 0.7) return 80;
  if (bugDensity <= 1) return 70;
  if (bugDensity <= 1.5) return 60;
  return 50;
};

export function calculateDevScoreOverview({
  issues,
  member,
  committedPointsByIssueUuid = {},
  contributionEffortScore = 0,
}: {
  issues: CombinedIssue[];
  member: string;
  committedPointsByIssueUuid?: Record<string, number | undefined>;
  contributionEffortScore?: number;
}): DevScoreOverview {
  const taskIssues = issues.filter((issue) =>
    isPointEntryTracker(issue.tracker),
  );

  const totalEarnedPointRaw = taskIssues.reduce((total, issue) => {
    const committedPoint = committedPointsByIssueUuid[issue.uuid];
    if (!Number.isFinite(committedPoint) || (committedPoint ?? 0) < 0) {
      return total;
    }
    return total + (committedPoint as number) * calculateOnTimeFactor(issue);
  }, 0);

  const criticalBugs = countBugsByPriority({
    member,
    issues,
    priorities: ["Urgent", "Immediate"],
  });
  const highBugs = countBugsByPriority({
    member,
    issues,
    priorities: ["High"],
  });

  const totalEarnedPoint = roundTo2(totalEarnedPointRaw);
  const maxTeamPoint = totalEarnedPoint;
  const bugDensityRaw =
    totalEarnedPointRaw > 0
      ? (criticalBugs * 3 + highBugs) / totalEarnedPointRaw
      : 0;
  const qualityScore = calculateQualityScore(bugDensityRaw);
  const deliveryScoreRaw =
    maxTeamPoint > 0 ? (totalEarnedPointRaw / maxTeamPoint) * 100 : 0;
  const totalScoreRaw =
    qualityScore * 0.4 + deliveryScoreRaw * 0.4 + contributionEffortScore * 0.2;

  return {
    totalEarnedPoint,
    criticalBugs,
    highBugs,
    bugDensity: roundTo2(bugDensityRaw),
    qualityScore: roundTo2(qualityScore),
    maxTeamPoint: roundTo2(maxTeamPoint),
    deliveryScore: roundTo2(deliveryScoreRaw),
    contributionEffortScore: roundTo2(contributionEffortScore),
    finalDeliveryScore: roundTo2(deliveryScoreRaw),
    totalScore: roundTo2(totalScoreRaw),
  };
}

export function calculateOnTimeFactor(
  issue: Pick<Issue, "dueDate" | "closed">,
) {
  if (!issue.dueDate) return 1;
  const due = new Date(issue.dueDate);
  const close = issue.closed ? new Date(issue.closed) : new Date();
  due.setHours(0, 0, 0, 0);
  close.setHours(0, 0, 0, 0);
  const daysLate = Math.ceil(
    (close.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysLate <= 0) return 1;
  if (daysLate <= 2) return 0.8;
  if (daysLate <= 4) return 0.5;
  if (daysLate <= 7) return 0.3;
  return 0;
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
    "aiAssistance",
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

/**
 * Exports dev score data to an Excel (.xlsx) file matching the Dev Team Score template.
 *
 * Left section (columns A–C, rows 1–9): scoring summary with auto-calculated formulas.
 * Right section (columns E–O, from row 3): issue data. Columns M (Committed Point)
 * and N (On-Time) are left blank for manual input; column O (Earned Point = M × N)
 * is pre-filled with a formula.
 *
 * @param issues  Issues to display in the data section (pre-filtered to the member).
 * @param member  Developer name used to count critical/high bugs triggered by them.
 * @param filename  Output filename (defaults to `dev-score-<member>.xlsx`).
 */
export async function exportDevScoreToXLSX(
  issues: CombinedIssue[],
  member: string,
  committedPointsByIssueUuid: Record<string, number | undefined> = {},
  filename = `dev-score-${member}.xlsx`,
) {
  if (!issues.length) return;

  const XLSX = await import("xlsx");

  const criticalBugs = countBugsByPriority({
    member,
    issues,
    priorities: ["Urgent", "Immediate"],
  });
  const highBugs = countBugsByPriority({
    member,
    issues,
    priorities: ["High"],
  });

  const taskIssues = issues.filter((issue) =>
    isPointEntryTracker(issue.tracker),
  );

  // At least 9 rows to cover the scoring section; otherwise fit exactly to the data
  const totalRows = Math.max(9, taskIssues.length + 2);

  const formatHrs = (val: number): string => `${val} hrs`;

  // Scoring section: rows 1–9, columns A–C
  // null in column B means the cell will be replaced with a formula
  const scoringRows: (string | number | null)[][] = [
    ["Total Earned Point", null, ""],
    ["Critical Bugs", criticalBugs, ""],
    ["High Bugs", highBugs, ""],
    ["Bug Density", null, ""],
    ["Quality Score", null, ""],
    ["Max Team Point", null, ""],
    ["Delivery Score", null, ""],
    ["Contribution/Effort Score\n(from PM/Leader)", 0, ""],
    ["Total Score", null, ""],
  ];

  // Build array-of-arrays: 15 columns (A–O), totalRows rows
  const aoa: (string | number | null)[][] = [];

  for (let r = 1; r <= totalRows; r++) {
    const sc = r <= 9 ? scoringRows[r - 1] : ["", "", ""];
    const issueIdx = r - 3; // issues[0] starts at Excel row 3
    const iss =
      issueIdx >= 0 && issueIdx < taskIssues.length
        ? taskIssues[issueIdx]
        : null;

    // Row 2 is the header row for the right section
    const isHeaderRow = r === 2;

    aoa.push([
      sc[0] ?? "", // A – scoring label
      sc[1] as string | number | null, // B – scoring value (formulas patched below)
      sc[2] ?? "", // C – source indicator
      "", // D – spacer
      isHeaderRow ? "" : (iss?.id ?? ""), // E – issue id
      isHeaderRow ? "Subject" : (iss?.subject ?? ""), // F
      isHeaderRow ? "Parent task subject" : (iss?.parentTaskSubject ?? ""), // G
      isHeaderRow ? "Tracker" : (iss?.tracker ?? ""), // H
      isHeaderRow ? "Ai Assistance" : (iss?.aiAssistance ?? ""), // I
      isHeaderRow
        ? "Total time spent"
        : iss
          ? formatHrs(iss.totalSpentTime)
          : "", // J
      isHeaderRow ? "Due date" : (iss?.dueDate ?? ""), // K – due date
      isHeaderRow ? "Close date" : (iss?.closed ?? ""), // L – close date
      isHeaderRow
        ? "Committed Point"
        : (committedPointsByIssueUuid[iss?.uuid ?? ""] ?? 0), // M – user fills in
      isHeaderRow ? "On-Time" : iss ? calculateOnTimeFactor(iss) : "", // N – auto-calculated
      isHeaderRow ? "Earned Point" : "", // O – formula patched below
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!ref"] = `A1:O${totalRows}`;

  // ── Scoring formulas ──────────────────────────────────────────────────────
  ws["B1"] = { t: "n", f: `SUM(O3:O${totalRows})`, v: 0 };
  ws["B4"] = { t: "n", f: "IF(B1=0,0,((B2*3)+(B3*1))/B1)", v: 0 };
  // _xlfn. prefix required by Excel for newer functions
  ws["B5"] = {
    t: "n",
    f: "_xlfn.IFS(B4<=0.2,100,B4<=0.4,90,B4<=0.7,80,B4<=1,70,B4<=1.5,60,B4>1.5,50)",
    v: 0,
  };
  ws["B6"] = { t: "n", f: "B1", v: 0 };
  ws["B7"] = { t: "n", f: "IF(B6=0,0,(B1/B6)*100)", v: 0 };
  ws["B9"] = { t: "n", f: "B5*0.4+B7*0.4+B8*0.2", v: 0 };

  // ── Earned Point formula for every data row ───────────────────────────────
  for (let r = 3; r <= totalRows; r++) {
    ws[`O${r}`] = { t: "n", f: `N${r}*M${r}`, v: 0 };
  }

  // ── Column widths ─────────────────────────────────────────────────────────
  ws["!cols"] = [
    { wch: 40 }, // A
    { wch: 14 }, // B
    { wch: 14 }, // C
    { wch: 5 }, // D
    { wch: 10 }, // E – id
    { wch: 55 }, // F – subject
    { wch: 40 }, // G – parent task subject
    { wch: 12 }, // H – tracker
    { wch: 14 }, // I – ai assistance
    { wch: 14 }, // J – total time spent
    { wch: 12 }, // K – due date
    { wch: 12 }, // L – close date
    { wch: 16 }, // M – committed point
    { wch: 10 }, // N – on-time
    { wch: 14 }, // O – earned point
  ];

  // ── Add "Team Input" label above M column (Committed Point) ───────────────
  ws["M1"] = { t: "s", v: "Team Input" };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "A");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
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
      item.dueStatus === FeatureStatus.LATE &&
      item.user === member,
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
