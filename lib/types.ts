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
  tags: string[];
  doneBy: string;
  projectName: string;
  position: string;
  issueCategories: string;
  private: boolean;
  storyPoints: number;
  triggeredBy: string;
  isWithoutSubtasks: boolean;
  user: string;
}

export interface CombinedIssue extends Issue {
  projectName: string;
  projectSlug: string;
  dueStatus: number;
}

export interface Feature extends CombinedIssue {
  slug: string;
  criticalBugs: number;
  highBugs: number;
  postReleaseBugs: number;
  completion: number;
  inProgress: number;
  overdueTasks: number;
  issues: CombinedIssue[];
}

export interface Project {
  name: string;
  slug: string;
  totalItems: number;
  totalMembers: number;
  totalDevs: number;
  features: Feature[];
}

export type Solution = Project;

export interface Team {
  name: string;
  members: Array<{ name: string; role: string }>;
}

export interface Member {
  slug: string;
  name: string;
  issues: CombinedIssue[];
  role: string;
  projects: string[];
}

export type MemberWithOverview = Member & IssueOverviewData;

export enum FeatureStatus {
  NONE = 0,
  INPROGRESS = 1,
  ONTIME = 2,
  LATE = 3,
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

export interface Doc {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface DocFile extends Doc {
  file: File;
}

export interface ApiProjectResponse {
  id: number;
  name: string;
  identifier: string;
  description: string;
  status: number;
  is_public: boolean;
  inherit_members: boolean;
  created_on: string;
  updated_on: string;
}

export interface Filter {
  projectIds: number[];
  sprintIds: number[] | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
}

export interface Sprint {
  id: number;
  name: string;
}

export interface ApiReportResponse {
  issueID: number;
  project: string;
  tracker: string;
  parentTask: string;
  parentTaskSubject: string;
  status: string;
  priority: string;
  subject: string;
  author: string;
  assignee: string;
  user: string;
  created: string;
  updated: string;
  category: string;
  targetVersion: string;
  startDate: string;
  dueDate: string;
  closed: string;
  estimatedTime: number;
  totalEstimatedTime: number;
  spentTime: number;
  percentDone: number;
  lastUpdatedBy: string;
  relatedIssues: string;
  tags: string;
  foundVersion: string;
  relatedAppVersion: string;
  doneBy: string;
  projectName: string;
  position: string;
  issueCategories: string;
  triggeredBy: string;
  private: string;
  storyPoints: string;
  sprint: string;
}
export interface IssueOverviewData {
  completion: number;
  inprogress: number;
  overdueTasks: number;
  totalCreatedBugs: number;
  totalFixedBugs: number;
  totalSpentTime: number;
  totalFoundBugs: number;
  totalConfirmedBugs: number;
}
