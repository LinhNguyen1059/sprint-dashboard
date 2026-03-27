import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SlideHeading, StatCard } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";
import { bugTrackerUrl } from "@/lib/utils";

export function IncompleteSlide({
  data,
}: {
  data: Pick<
    SprintReviewData,
    "incompleteByStatus" | "overdueIssues" | "overdueCount"
  >;
}) {
  const totalIncomplete = Object.values(data.incompleteByStatus).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <SlideHeading
        subtitle={`${totalIncomplete} issues not completed — ${data.overdueCount} overdue`}
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          Carried Over / Incomplete
        </span>
      </SlideHeading>

      {/* Status breakdown */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(data.incompleteByStatus)
          .sort(([, a], [, b]) => b - a)
          .map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 text-sm font-medium"
            >
              <span>{status}</span>
              <span className="text-lg font-bold">{count}</span>
            </div>
          ))}
      </div>

      {/* Overdue issues */}
      {data.overdueIssues.length > 0 && (
        <>
          <p className="text-sm font-semibold text-red-500 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Overdue Tasks
          </p>
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_10rem_8rem] bg-muted px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>#</span>
              <span>Subject</span>
              <span>Assignee</span>
              <span>Due Date</span>
            </div>
            <div className="divide-y max-h-[42vh] overflow-y-auto">
              {data.overdueIssues.map((issue) => (
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
                  <span className="text-red-500 text-xs font-medium">
                    {issue.dueDate || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
