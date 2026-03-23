"use client";

import { useDashboardStore } from "@/stores/dashboardStore";
import { Button } from "@/components/ui/button";

export function SidebarApply() {
  const { filter, resetFilter } = useDashboardStore();

  const hasProjects = filter.projectIds.length > 0;
  const hasSprints = (filter.sprintIds?.length ?? 0) > 0;
  const hasDateRange = !!(
    filter.startDate &&
    filter.endDate &&
    new Date(filter.startDate) < new Date(filter.endDate)
  );
  const hasPartialDateRange =
    !!(filter.startDate || filter.endDate) && !hasDateRange;
  const hasAnyFilter = hasProjects || hasSprints || hasDateRange;
  const hasFilterToApply =
    hasProjects && (hasSprints || hasDateRange) && !hasPartialDateRange;

  const handleReset = () => {
    resetFilter("projectIds");
    resetFilter("sprintIds");
    resetFilter("startDate");
    resetFilter("endDate");
  };

  const handleApply = () => {
    console.log("🚀 ~ SidebarApply ~ filter:", filter);
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
        disabled={!hasFilterToApply}
        onClick={handleApply}
      >
        Apply
      </Button>
    </div>
  );
}
