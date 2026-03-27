"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { useDashboardStore } from "@/stores/dashboardStore";

export function SidebarApply() {
  const router = useRouter();

  const {
    isLoading,
    resetFilter,
    getReportData,
    checkIsAnyFilterApplied,
    checkIsAllFilterApplied,
  } = useDashboardStore();

  const hasAnyFilter = checkIsAnyFilterApplied();
  const hasFilterToApply = checkIsAllFilterApplied();

  const handleReset = () => {
    resetFilter("projectIds");
    resetFilter("sprintIds");
    resetFilter("startDate");
    resetFilter("endDate");
  };

  const handleApply = () => {
    getReportData();
    router.push("/");
  };

  return (
    <div className="flex gap-2 p-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        disabled={!hasAnyFilter}
        onClick={handleReset}
      >
        Reset
      </Button>
      <Button
        size="sm"
        className="flex-1"
        disabled={!hasFilterToApply || isLoading}
        onClick={handleApply}
      >
        {isLoading && <Spinner data-icon="inline-start" />}
        Apply
      </Button>
    </div>
  );
}
