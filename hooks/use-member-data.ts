import { useCallback, useMemo } from "react";

import { useDashboardStore } from "@/stores/dashboardStore";
import { exportIssuesToCSV } from "@/lib/utils";
import { isTester } from "@/lib/teams";

/**
 * Fetches a member by slug from the store and derives all overview metrics
 * and the CSV export handler. Subscribes only to the relevant store slice.
 */
export function useMemberData(slug: string) {
  const memberData = useDashboardStore(
    useCallback((s) => s.getMemberBySlug(slug), [slug]),
  );

  const isTesterMember = useMemo(() => {
    return isTester(memberData?.name || "");
  }, [memberData]);

  const handleExport = useCallback(() => {
    if (!memberData) return;

    const overviewRows = [
      { label: "Completion Rate", value: memberData.completion },
      { label: "In Progress Rate", value: memberData.inprogress },
      { label: "Overdue Tasks", value: memberData.overdueTasks },
      ...(isTesterMember
        ? [
            { label: "Total Found Bugs", value: memberData.totalFoundBugs },
            {
              label: "Total Confirmed Bugs",
              value: memberData.totalConfirmedBugs,
            },
          ]
        : [
            {
              label: "Total Created Bugs",
              value: memberData.totalCreatedBugs,
            },
            { label: "Total Fixed Bugs", value: memberData.totalFixedBugs },
          ]),
      { label: "Total Spent Time", value: memberData.totalSpentTime },
    ];

    exportIssuesToCSV(
      memberData.issues,
      `${memberData.name}.csv`,
      overviewRows,
    );
  }, [memberData, isTesterMember]);

  return { memberData, isTesterMember, handleExport };
}
