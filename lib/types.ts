// CSV Parser interfaces
export interface Issue {
  id: number;
  tracker: string;
  status: string;
  subject: string;
  author: string;
  assignee: string;
  priority: string;
  foundVersion: string;
  dueDate: string;
  targetVersion: string;
  relatedAppVersion: string;
  sprint: string;
  project: string;
  parentTask: number | null;
  parentTaskSubject: string;
  updated: string;
  category: string;
  startDate: string;
  estimatedTime: number;
  totalEstimatedTime: number;
  spentTime: number;
  totalSpentTime: number;
  percentDone: number;
  created: string;
  closed: string;
  lastUpdatedBy: string;
  relatedIssues: string;
  files: string;
  tags: string[];
  doneBy: string;
  projectName: string;
  position: string;
  issueCategories: string;
  private: boolean;
  storyPoints: number;
}

export interface CombinedIssue extends Issue {
  projectName: string;
  projectSlug: string;
}

// Story now extends Issue, adding story-specific properties
export interface Story extends CombinedIssue {
  timeSpent: number;
  parent: number;
  issues: Issue[];
  urgentBugs: number;
  highBugs: number;
  normalBugs: number;
  ncrBugs: number;
}

export interface Feature extends CombinedIssue {
  dueStatus: number;
  projectSlug: string;
  slug: string;
  urgentBugs: number;
  highBugs: number;
  ncrBugs: number;
  normalBugs: number;
  stories: Story[];
}

export interface Project {
  projectName: string;
  projectSlug: string;
  totalItems: number;
  totalMembers: number;
  features: Feature[];
}

export interface Solution {
  tagName: string;
  tagSlug: string;
  totalItems: number;
  totalMembers: number;
  features: Feature[];
}

export enum FeatureStatus {
  INPROGRESS = 0,
  ONTIME = 1,
  LATE = 2,
}

// Component prop interfaces
export interface DashboardLayoutProps {
  children: React.ReactNode;
}

// CSV Parser function types
export interface CSVParser {
  parseCSVFileObject: (file: File) => Promise<Project[]>;
  parseMultipleCSVFileObjects: (files: File[]) => Promise<Project[]>;
}

// Chart color types
export type ChartColor =
  | "var(--chart-1)"
  | "var(--chart-2)"
  | "var(--chart-3)"
  | "var(--chart-4)"
  | "var(--chart-5)"
  | "var(--chart-6)"
  | "var(--chart-7)"
  | "var(--chart-8)"
  | "var(--chart-9)"
  | "var(--chart-10)"
  | "var(--chart-11)"
  | "var(--chart-12)"
  | "var(--chart-13)"
  | "var(--chart-14)"
  | "var(--chart-15)"
  | "var(--chart-16)"
  | "var(--chart-17)"
  | "var(--chart-18)"
  | "var(--chart-19)"
  | "var(--chart-20)"
  | "var(--chart-21)"
  | "var(--chart-22)"
  | "var(--chart-23)"
  | "var(--chart-24)"
  | "var(--chart-25)"
  | "var(--chart-26)"
  | "var(--chart-27)"
  | "var(--chart-28)"
  | "var(--chart-29)"
  | "var(--chart-30)";

export const CHART_COLOR_VALUES: ChartColor[] = [
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
];

export type ChartColorIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29;
