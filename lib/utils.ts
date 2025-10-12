import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FeatureStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValueToSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const isRouteActive = (routeUrl: string, path: string) => {
  if (routeUrl === path) return true;

  if (path.startsWith(routeUrl)) {
    const nextChar = path[routeUrl.length];
    return nextChar === "/" || nextChar === undefined;
  }

  return false;
};

export const getFeatureStatus = (status: number) => {
  switch (status) {
    case FeatureStatus.INPROGRESS:
      return {
        text: "In Progress",
        class: "",
      };
    case FeatureStatus.ONTIME:
      return {
        text: "On Time",
        class: "text-green-500 border-green-100",
      };
    default:
      return {
        text: "Late",
        class: "text-red-500 border-red-100",
      };
  }
};

export const visibleColumns = {
  percentDone: "Progress",
  dueStatus: "Status",
  urgentBugs: "Urgent bugs",
  highBugs: "High bugs",
  normalBugs: "Normal bugs",
  ncrBugs: "NCR bugs",

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
  closed: "Closed",
  lastUpdatedBy: "Last updated by",
  relatedIssues: "Related issues",
  files: "Files",
  tags: "Tags",
  doneBy: "Done by",
  projectName: "Project name",
  position: "Position",
  issueCategories: "Issue categories",
  private: "Private",
  storyPoints: "Story points",
};

// Chart color utilities
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
  "var(--chart-11)",
  "var(--chart-12)",
  "var(--chart-13)",
  "var(--chart-14)",
  "var(--chart-15)",
  "var(--chart-16)",
  "var(--chart-17)",
  "var(--chart-18)",
  "var(--chart-19)",
  "var(--chart-20)",
  "var(--chart-21)",
  "var(--chart-22)",
  "var(--chart-23)",
  "var(--chart-24)",
  "var(--chart-25)",
  "var(--chart-26)",
  "var(--chart-27)",
  "var(--chart-28)",
  "var(--chart-29)",
  "var(--chart-30)",
] as const;

export const getChartColor = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const getChartColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => getChartColor(i));
};
