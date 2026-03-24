import { CheckCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SlideHeading } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";
import { bugTrackerUrl } from "@/lib/utils";

const TRACKER_COLORS: Record<string, string> = {
  Bug: "bg-red-500/10 text-red-600 border-red-500/20",
  Tasks: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Task_Scr: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Story: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Suggestion: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export function CompletedSlide({
  data,
}: {
  data: Pick<SprintReviewData, "completedByTracker" | "completedIssues">;
}) {
  const total = Object.values(data.completedByTracker).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <SlideHeading subtitle={`${total} issues closed this sprint`}>
        <span className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          Completed Items
        </span>
      </SlideHeading>

      {/* Tracker breakdown */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(data.completedByTracker)
          .sort(([, a], [, b]) => b - a)
          .map(([tracker, count]) => (
            <div
              key={tracker}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${TRACKER_COLORS[tracker] ?? "bg-muted text-muted-foreground"}`}
            >
              <span>{tracker}</span>
              <span className="text-lg font-bold">{count}</span>
            </div>
          ))}
      </div>

      {/* Issue list */}
      {data.completedIssues.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_10rem_8rem] bg-muted px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>#</span>
            <span>Subject</span>
            <span>Assignee</span>
            <span>Tracker</span>
          </div>
          <div className="divide-y max-h-[42vh] overflow-y-auto">
            {data.completedIssues.map((issue) => (
              <div
                key={issue.id}
                className="grid grid-cols-[3rem_1fr_10rem_8rem] items-center px-4 py-2 text-sm hover:bg-muted/50"
              >
                <Link
                  href={`${bugTrackerUrl}/${issue.id}`}
                  target="_blank"
                  className="text-primary hover:underline font-mono text-xs"
                >
                  {issue.id}
                </Link>
                <span className="truncate pr-4">{issue.subject}</span>
                <span className="text-muted-foreground truncate">
                  {issue.assignee}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs w-fit ${TRACKER_COLORS[issue.tracker] ?? ""}`}
                >
                  {issue.tracker}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
