"use client";

import { useRouter } from "next/navigation";
import { PresentationIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardStore } from "@/stores/dashboardStore";

export function SidebarSprintReview() {
  const router = useRouter();
  const { reports, isLoading, checkIsAllFilterApplied } = useDashboardStore();

  const hasData = reports.length > 0;
  const canNavigate = hasData && !isLoading;

  return (
    <div className="px-2 pt-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={!canNavigate}
            onClick={() => router.push("/sprint-review")}
          >
            <PresentationIcon className="h-4 w-4 mr-1.5" />
            Sprint Review
          </Button>
        </TooltipTrigger>
        {!hasData && (
          <TooltipContent side="top">
            Apply a filter first to enable Sprint Review
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
}
