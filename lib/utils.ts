import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CombinedIssue, Feature, FeatureStatus, Issue, Story } from "./types";
import { CircleCheck, Loader, TimerOff } from "lucide-react";
import { getDevelopers } from "./teams";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const excludedIssueCategories = [
  "Requirement Error",
  "Test Environment Error",
  "External Dependency Error",
];

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

export const bugTrackerUrl = "https://bugtracker.i3international.com/issues";

export const flattenedIssues = (features: Feature[]) => {
  if (!features || features.length === 0) {
    return [];
  }

  const allItems: Story[] = [];

  features.forEach((feature) => {
    feature.stories.forEach((story) => {
      allItems.push(story);

      story.issues.forEach((issue) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allItems.push(issue);
      });
    });

    feature.others.forEach((issue) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      allItems.push(issue);
    });
  });

  return allItems;
};

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
    if (issue.triggeredBy && issue.triggeredBy !== member) {
      return count;
    }

    const categories = issue.issueCategories
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean);

    if (
      categories.some((category) => excludedIssueCategories.includes(category))
    ) {
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
