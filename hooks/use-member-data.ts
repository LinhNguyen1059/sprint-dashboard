import { useCallback, useMemo, useState } from "react";

import { useDashboardStore } from "@/stores/dashboardStore";
import { exportDevScoreToXLSX } from "@/lib/utils";
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

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!memberData || isExporting) return;
    setIsExporting(true);
    try {
      await exportDevScoreToXLSX(memberData.issues, memberData.name);
    } finally {
      setIsExporting(false);
    }
  }, [memberData, isExporting]);

  return { memberData, isTesterMember, handleExport, isExporting };
}
