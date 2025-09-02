import { LucideIcon } from "lucide-react";

// Basic CSV data structure
export interface CSVRow {
  "#": string | number;
  Subject: string;
  Status: string;
  Priority: string;
  Tracker: string;
  Author: string;
  Assignee: string;
  "Created": string | Date;
  "Updated": string | Date;
  "Closed": string | Date | null;
  "Spent time": string | number;
  "Total spent time": string | number;
  "Estimated time": string | number;
  "Total estimated time": string | number;
  "Parent task": string | number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow for additional fields from CSV
}

// Processed data interfaces
export interface ProcessedCSVRow extends Omit<CSVRow, "Spent time" | "Total spent time" | "Estimated time" | "Total estimated time" | "Created" | "Updated" | "Closed"> {
  "Spent time": number;
  "Total spent time": number;
  "Estimated time": number;
  "Total estimated time": number;
  "Created": Date;
  "Updated": Date;
  "Closed": Date | null;
}

// Chart data interfaces
export interface ChartData {
  status: Record<string, number>;
  priority: Record<string, number>;
  tracker: Record<string, number>;
  modules: Record<string, number>;
}

// Metrics interfaces
export interface SprintMetrics {
  total: number;
  closed: number;
  inProgress: ProcessedCSVRow[];
  inProgressCount: number;
  pending: ProcessedCSVRow[];
  pendingCount: number;
  completionRate: string;
  totalSpentTime: string;
  totalEstimatedTime: string;
  timeEfficiency: string;
  bugCount: number;
  taskCount: number;
  storyCount: number;
  highPriorityCount: number;
  urgentPriorityCount: number;
}

// Team member metrics
export interface TeamMember {
  name: string;
  total: number;
  closed: number;
  inProgress: number;
  totalSpentTime: number;
  totalEstimatedTime: number;
  completionRate: string;
  efficiency: string;
}

// Story metrics
export interface StoryBreakdown {
  bugs: number;
  tasks: number;
  suggestions: number;
  other: number;
}

export interface StoryStatusBreakdown {
  closed: number;
  inProgress: number;
  resolved: number;
  pending: number;
}

export interface StoryTimeMetrics {
  totalSpentTime: string;
  totalEstimatedTime: string;
  efficiency: string;
}

export interface Story {
  id: string | number;
  subject: string;
  status: string;
  assignee: string;
  created: Date;
  closed: Date | null;
  totalRelated: number;
  breakdown: StoryBreakdown;
  statusBreakdown: StoryStatusBreakdown;
  timeMetrics: StoryTimeMetrics;
  completionRate: number;
  relatedIssues: ProcessedCSVRow[];
}

// Timeline data
export interface TimelineData {
  date: string;
  count: number;
}

// Main sprint data interface
export interface SprintData {
  raw: ProcessedCSVRow[];
  metrics: SprintMetrics;
  charts: ChartData;
  team: TeamMember[];
  timeline: TimelineData[];
  stories: Story[];
}

// Component prop interfaces
export interface DashboardLayoutProps {
  children: React.ReactNode;
  sprintData?: SprintData | null;
  projectName?: string;
}

export interface CSVUploadProps {
  onFileUpload: (file: File | null) => void;
}

export interface ChartsProps {
  sprintData: SprintData;
}

export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface StatusChartProps {
  data: Record<string, number>;
}

export interface PriorityChartProps {
  data: Record<string, number>;
}

export interface TrackerChartProps {
  data: Record<string, number>;
}

export interface ModuleProgressChartProps {
  data: Record<string, number>;
}

// MetricsCards interfaces
export type MetricCardColor = "blue" | "green" | "orange" | "red" | "purple" | "gray";
export type MetricCardTrend = "up" | "down";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: MetricCardColor;
  trend?: MetricCardTrend;
  trendValue?: string;
  dataTable?: ProcessedCSVRow[];
}

export interface MetricsCardsProps {
  sprintData: SprintData;
}

// StoryTable interfaces
export interface StatusBadgeProps {
  status: string;
}

export interface StoryRowProps {
  story: Story;
}

export interface StoryTableProps {
  sprintData: SprintData;
}

// TeamPerformance interfaces
export interface TeamMemberCardProps {
  member: TeamMember;
  rank: number | null;
}

export interface TeamSummaryProps {
  teamData: TeamMember[];
}

export interface TeamPerformanceProps {
  sprintData: SprintData;
}

// Chart.js related types
export interface ChartTooltipContext {
  label: string;
  parsed: number;
  dataset: {
    data: number[];
  };
}

export interface BarChartTooltipContext {
  label: string;
  parsed: {
    x: number;
    y: number;
  };
}

// File upload types
export interface FileUploadState {
  isDragOver: boolean;
  uploadedFile: File | null;
}

// Error types
export interface CSVParseError {
  message: string;
  row?: number;
  code?: string;
}

// Sorting and filtering types
export type SortOption = "totalRelated" | "completionRate" | "bugs" | "created";
export type FilterOption = "all" | "active" | "completed" | "has-bugs";
export type TeamSortOption = "closed" | "completionRate" | "totalSpentTime";

// Utility types
export type ColorMapping = Record<string, string>;

// Progress types
export interface ProgressProps {
  value: number;
  className?: string;
  progressClassName?: string;
}