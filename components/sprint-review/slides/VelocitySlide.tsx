import { BarChart3 } from "lucide-react";

import { SlideHeading } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";
import { cn } from "@/lib/utils";

export function VelocitySlide({
  data,
}: {
  data: Pick<SprintReviewData, "memberStats">;
}) {
  const sorted = [...data.memberStats]
    .filter((m) => m.timeSpent > 0 || m.totalEstimated > 0)
    .sort((a, b) => b.timeSpent - a.timeSpent);

  const maxTime = Math.max(
    ...sorted.flatMap((m) => [m.timeSpent, m.totalEstimated]),
    1,
  );

  return (
    <div className="flex flex-col gap-6">
      <SlideHeading subtitle="Time spent vs estimated per member">
        <span className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Velocity & Time
        </span>
      </SlideHeading>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          Time Spent
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary/25" />
          Estimated
        </span>
      </div>

      {/* Bar chart */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {sorted.map((m) => {
          const spentPct = Math.min((m.timeSpent / maxTime) * 100, 100);
          const estimatedPct = Math.min(
            (m.totalEstimated / maxTime) * 100,
            100,
          );
          const isOverspent =
            m.timeSpent > m.totalEstimated && m.totalEstimated > 0;

          return (
            <div key={m.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{m.name}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    isOverspent ? "text-red-500" : "text-muted-foreground",
                  )}
                >
                  {Math.round(m.timeSpent)}h spent /{" "}
                  {Math.round(m.totalEstimated)}h est
                  {isOverspent && " ⚠️"}
                </span>
              </div>
              <div className="relative h-5 rounded-md bg-muted overflow-hidden">
                {/* Estimated bar (background) */}
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-primary/20"
                  style={{ width: `${estimatedPct}%` }}
                />
                {/* Spent bar (foreground) */}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-md",
                    isOverspent ? "bg-red-500" : "bg-primary",
                  )}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
