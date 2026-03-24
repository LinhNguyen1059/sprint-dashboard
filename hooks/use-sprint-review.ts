import { useMemo } from "react";

import { useDashboardStore } from "@/stores/dashboardStore";
import {
  calculateOverviewRate,
  countBugsByPriority,
  countBugsSupportedByMember,
} from "@/lib/utils";
import { FeatureStatus } from "@/lib/types";

export interface MemberStat {
  name: string;
  role: string;
  completion: number;
  inprogress: number;
  criticalBugs: number;
  highBugs: number;
  fixedBugs: number;
  supportedBugs: number;
  timeSpent: number;
  totalEstimated: number;
  issueCount: number;
}

export interface SprintReviewData {
  // Slide 1 — Header
  projectNames: string[];
  sprintNames: string[];
  startDate: string | undefined;
  endDate: string | undefined;
  totalIssues: number;

  // Slide 2 — Summary
  completion: number;
  inprogress: number;
  overdueCount: number;
  totalEstimated: number;
  totalSpent: number;
  storyPointsDone: number;

  // Slide 3 — Completed
  completedByTracker: Record<string, number>;
  completedIssues: {
    id: number;
    subject: string;
    assignee: string;
    tracker: string;
  }[];

  // Slide 4 — Incomplete
  incompleteByStatus: Record<string, number>;
  overdueIssues: {
    id: number;
    subject: string;
    assignee: string;
    dueDate: string;
  }[];

  // Slide 5 — Bugs
  criticalBugsCount: number;
  highBugsCount: number;
  fixedBugsCount: number;
  postReleaseBugsCount: number;

  // Slide 6 & 7 — Team
  memberStats: MemberStat[];
}

export function useSprintReview(): SprintReviewData {
  const { reports, members, filter, projects, sprints } = useDashboardStore();

  return useMemo(() => {
    // ── Header ──────────────────────────────────────────────────────────────
    const projectNames = projects
      .filter((p) => filter.projectIds.includes(p.id))
      .map((p) => p.name);

    const sprintNames = sprints
      .filter((s) => filter.sprintIds?.includes(s.id))
      .map((s) => s.name);

    // ── Issue buckets ────────────────────────────────────────────────────────
    const completed = reports.filter((i) => i.status === "Closed");
    const incomplete = reports.filter((i) => i.status !== "Closed");
    const overdue = reports.filter(
      (i) => i.dueStatus === FeatureStatus.LATE && i.status !== "Closed",
    );

    // ── Summary ──────────────────────────────────────────────────────────────
    // Use a synthetic "team" view — all issues across all members
    const allMemberNames = members.map((m) => m.name);
    let totalCompletion = 0;
    let totalInprogress = 0;
    if (allMemberNames.length > 0) {
      allMemberNames.forEach((name) => {
        const { completion, inprogress } = calculateOverviewRate(reports, name);
        totalCompletion += completion;
        totalInprogress += inprogress;
      });
      totalCompletion = Math.round(totalCompletion / allMemberNames.length);
      totalInprogress = Math.round(totalInprogress / allMemberNames.length);
    }

    const totalEstimated = reports.reduce(
      (sum, i) => sum + (i.totalEstimatedTime ?? 0),
      0,
    );
    const totalSpent = reports.reduce(
      (sum, i) => sum + (i.totalSpentTime ?? 0),
      0,
    );
    const storyPointsDone = completed.reduce(
      (sum, i) => sum + (Number(i.storyPoints) || 0),
      0,
    );

    // ── Completed by tracker ─────────────────────────────────────────────────
    const completedByTracker: Record<string, number> = {};
    completed.forEach((i) => {
      completedByTracker[i.tracker] = (completedByTracker[i.tracker] ?? 0) + 1;
    });

    // ── Incomplete by status ─────────────────────────────────────────────────
    const incompleteByStatus: Record<string, number> = {};
    incomplete.forEach((i) => {
      incompleteByStatus[i.status] = (incompleteByStatus[i.status] ?? 0) + 1;
    });

    // ── Bugs ─────────────────────────────────────────────────────────────────
    // Count across all issues (not per-member) for a sprint-wide view
    const criticalBugsCount = reports.filter(
      (i) =>
        i.tracker === "Bug" &&
        (i.priority === "Urgent" || i.priority === "Immediate"),
    ).length;
    const highBugsCount = reports.filter(
      (i) => i.tracker === "Bug" && i.priority === "High",
    ).length;
    const fixedBugsCount = reports.filter(
      (i) => i.tracker === "Bug" && i.status === "Closed",
    ).length;
    const postReleaseBugsCount = reports.filter(
      (i) =>
        i.tracker === "Bug" &&
        i.issueCategories
          ?.split(",")
          .map((c) => c.trim())
          .includes("Post-Release Issue"),
    ).length;

    // ── Member stats ──────────────────────────────────────────────────────────
    const memberStats: MemberStat[] = members.map((member) => {
      const { completion, inprogress } = calculateOverviewRate(
        member.issues,
        member.name,
      );
      const criticalBugs = countBugsByPriority({
        member: member.name,
        issues: member.issues,
        priorities: ["Urgent", "Immediate"],
      });
      const highBugs = countBugsByPriority({
        member: member.name,
        issues: member.issues,
        priorities: ["High"],
      });
      const fixedBugs = member.issues.filter(
        (i) =>
          i.tracker === "Bug" &&
          i.status === "Closed" &&
          (i.assignee === member.name || i.doneBy?.includes(member.name)),
      ).length;
      const supportedBugs = countBugsSupportedByMember({
        member: member.name,
        issues: member.issues,
      });
      const timeSpent = member.issues.reduce(
        (sum, i) => sum + (i.spentTime ?? 0),
        0,
      );
      const totalEstimatedMember = member.issues.reduce(
        (sum, i) => sum + (i.estimatedTime ?? 0),
        0,
      );

      return {
        name: member.name,
        role: member.role,
        completion,
        inprogress,
        criticalBugs,
        highBugs,
        fixedBugs,
        supportedBugs,
        timeSpent,
        totalEstimated: totalEstimatedMember,
        issueCount: member.issues.length,
      };
    });

    return {
      projectNames,
      sprintNames,
      startDate: filter.startDate,
      endDate: filter.endDate,
      totalIssues: reports.length,
      completion: totalCompletion,
      inprogress: totalInprogress,
      overdueCount: overdue.length,
      totalEstimated,
      totalSpent,
      storyPointsDone,
      completedByTracker,
      completedIssues: completed.slice(0, 50).map((i) => ({
        id: i.id,
        subject: i.subject,
        assignee: i.assignee,
        tracker: i.tracker,
      })),
      incompleteByStatus,
      overdueIssues: overdue.slice(0, 30).map((i) => ({
        id: i.id,
        subject: i.subject,
        assignee: i.assignee,
        dueDate: i.dueDate,
      })),
      criticalBugsCount,
      highBugsCount,
      fixedBugsCount,
      postReleaseBugsCount,
      memberStats,
    };
  }, [reports, members, filter, projects, sprints]);
}
