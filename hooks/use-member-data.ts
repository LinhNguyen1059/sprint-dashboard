import { useCallback, useMemo } from "react";

import { useDashboardStore } from "@/stores/dashboardStore";
import {
  calculateOverviewRate,
  countBugsByPriority,
  exportIssuesToCSV,
} from "@/lib/utils";
import { FeatureStatus } from "@/lib/types";
import type { IssueOverviewData } from "@/components/issue/issue-overview";

const EMPTY_OVERVIEW: IssueOverviewData = {
  completion: 0,
  inprogress: 0,
  overdueTasks: 0,
  totalCreatedBugs: 0,
  totalFixedBugs: 0,
  totalSpentTime: 0,
};

/**
 * Fetches a member by slug from the store and derives all overview metrics
 * and the CSV export handler. Subscribes only to the relevant store slice.
 */
export function useMemberData(slug: string) {
  const memberData = useDashboardStore(
    useCallback((s) => s.getMemberBySlug(slug), [slug]),
  );

  const overviewData = useMemo<IssueOverviewData>(() => {
    if (!memberData?.issues?.length) return EMPTY_OVERVIEW;

    const { name, issues } = memberData;

    const { completion, inprogress } = calculateOverviewRate(issues, name);

    const totalCreatedBugs =
      countBugsByPriority({ member: name, issues, priorities: ["High"] }) +
      countBugsByPriority({
        member: name,
        issues,
        priorities: ["Urgent", "Immediate"],
      });

    const overdueTasks = issues.filter(
      (item) =>
        (item.tracker === "Tasks" || item.tracker === "Task_Scr") &&
        item.dueStatus === FeatureStatus.LATE,
    ).length;

    const totalFixedBugs = issues.filter(
      (issue) =>
        issue.tracker === "Bug" &&
        issue.status === "Closed" &&
        (issue.assignee === name || issue.doneBy.includes(name)),
    ).length;

    const totalSpentTime = issues.reduce((total, issue) => {
      if ("timeSpent" in issue && typeof issue.timeSpent === "number") {
        return total + issue.timeSpent;
      }
      return total;
    }, 0);

    return {
      completion,
      inprogress,
      overdueTasks,
      totalCreatedBugs,
      totalFixedBugs,
      totalSpentTime,
    };
  }, [memberData]);

  const handleExport = useCallback(() => {
    if (!memberData) return;

    const overviewRows = [
      { label: "Completion Rate", value: overviewData.completion },
      { label: "In Progress Rate", value: overviewData.inprogress },
      { label: "Overdue Tasks", value: overviewData.overdueTasks },
      { label: "Total Created Bugs", value: overviewData.totalCreatedBugs },
      { label: "Total Fixed Bugs", value: overviewData.totalFixedBugs },
      { label: "Total Spent Time", value: overviewData.totalSpentTime },
    ];

    exportIssuesToCSV(
      memberData.issues,
      `${memberData.name}.csv`,
      overviewRows,
    );
  }, [memberData, overviewData]);

  return { memberData, overviewData, handleExport };
}
