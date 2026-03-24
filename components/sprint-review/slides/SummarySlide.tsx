import { Clock, TrendingUp, Play, AlertTriangle } from "lucide-react";

import { StatCard, SlideHeading } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";
import { Progress } from "@/components/ui/progress";

export function SummarySlide({
  data,
}: {
  data: Pick<
    SprintReviewData,
    | "completion"
    | "inprogress"
    | "overdueCount"
    | "totalEstimated"
    | "totalSpent"
    | "totalIssues"
  >;
}) {
  const timeEfficiency =
    data.totalEstimated > 0
      ? Math.round((data.totalSpent / data.totalEstimated) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <SlideHeading subtitle="High-level sprint health metrics">
        Sprint Summary
      </SlideHeading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Avg Completion"
          value={`${data.completion}%`}
          className="border-green-500/30"
        />
        <StatCard
          label="Avg In Progress"
          value={`${data.inprogress}%`}
          className="border-blue-500/30"
        />
        <StatCard
          label="Overdue Tasks"
          value={data.overdueCount}
          className={data.overdueCount > 0 ? "border-red-500/30" : ""}
        />
        <StatCard
          label="Time Efficiency"
          value={`${timeEfficiency}%`}
          sub={`${Math.round(data.totalSpent)}h spent / ${Math.round(data.totalEstimated)}h estimated`}
        />
      </div>

      {/* Visual progress bars */}
      <div className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Completion Rate
            </span>
            <span className="font-medium">{data.completion}%</span>
          </div>
          <Progress
            value={data.completion}
            className="h-3 bg-green-500/10"
            progressClassName="bg-green-500"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Play className="h-4 w-4 text-blue-500" />
              In Progress Rate
            </span>
            <span className="font-medium">{data.inprogress}%</span>
          </div>
          <Progress
            value={data.inprogress}
            className="h-3 bg-blue-500/10"
            progressClassName="bg-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Time Spent vs Estimated
            </span>
            <span className="font-medium">
              {Math.round(data.totalSpent)}h / {Math.round(data.totalEstimated)}
              h
            </span>
          </div>
          <Progress
            value={Math.min(timeEfficiency, 100)}
            className="h-3 bg-primary/10"
            progressClassName="bg-primary"
          />
        </div>
      </div>
    </div>
  );
}
