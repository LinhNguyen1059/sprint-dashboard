"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IssueTable } from "@/components/issue";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  calculateOverviewRate,
  countBugsByPriority,
  exportIssuesToCSV,
} from "@/lib/utils";
import { useDashboardStore } from "@/stores/dashboardStore";
import { FeatureStatus } from "@/lib/types";

export default function MemberPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { members, getMemberBySlug } = useDashboardStore();

  const memberData = useMemo(() => {
    return getMemberBySlug(slug as string);
  }, [members, slug, getMemberBySlug]);

  const overviewData = useMemo(() => {
    if (!memberData?.issues) {
      return {
        completion: 0,
        inprogress: 0,
        overdueTasks: 0,
        totalCreatedBugs: 0,
        totalFixedBugs: 0,
        totalSpentTime: 0,
      };
    }

    const { completion, inprogress } = calculateOverviewRate(
      memberData.issues,
      memberData.name,
    );
    const highBugs = countBugsByPriority({
      member: memberData.name,
      issues: memberData.issues,
      priorities: ["High"],
    });
    const criticalBugs = countBugsByPriority({
      member: memberData.name,
      issues: memberData.issues,
      priorities: ["Urgent", "Immediate"],
    });
    const overdueTaskCount = memberData.issues.filter(
      (item) =>
        (item.tracker === "Tasks" || item.tracker === "Task_Scr") &&
        item.dueStatus === FeatureStatus.LATE,
    ).length;
    const totalSpentTime = memberData.issues.reduce((total, issue) => {
      if ("timeSpent" in issue && typeof issue.timeSpent === "number") {
        return total + issue.timeSpent;
      }
      return total;
    }, 0);
    const totalCreatedBugs = highBugs + criticalBugs;
    const totalFixedBugs = memberData.issues.filter(
      (issue) =>
        issue.tracker === "Bug" &&
        issue.status === "Closed" &&
        (issue.assignee === memberData.name ||
          issue.doneBy.includes(memberData.name)),
    ).length;

    return {
      completion,
      inprogress,
      overdueTasks: overdueTaskCount,
      totalCreatedBugs,
      totalFixedBugs,
      totalSpentTime,
    };
  }, [memberData]);

  usePageTitle(memberData ? memberData.name : "Member");

  if (!memberData?.issues || memberData?.issues?.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Member Board</h1>
          <p className="text-muted-foreground">Not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 w-full justify-between">
          <h1 className="text-2xl font-bold">{memberData?.name}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const overview = [
                { label: "Completion Rate", value: overviewData.completion },
                { label: "In Progress Rate", value: overviewData.inprogress },
                { label: "Overdue Tasks", value: overviewData.overdueTasks },
                {
                  label: "Total Created Bugs",
                  value: overviewData.totalCreatedBugs,
                },
                {
                  label: "Total Fixed Bugs",
                  value: overviewData.totalFixedBugs,
                },
                {
                  label: "Total Spent Time",
                  value: overviewData.totalSpentTime,
                },
              ];
              exportIssuesToCSV(
                memberData.issues,
                `${memberData.name}.csv`,
                overview,
              );
            }}
          >
            <FileDown /> Export CSV
          </Button>
        </div>
      </div>

      <IssueTable
        overview={overviewData}
        issues={memberData?.issues}
        memberName={memberData?.name}
      />
    </div>
  );
}
