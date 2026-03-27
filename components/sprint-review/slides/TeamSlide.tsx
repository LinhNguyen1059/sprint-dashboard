import { Users } from "lucide-react";

import { SlideHeading } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MEMBER_ROLE } from "@/lib/teams";

const ROLE_COLOR: Record<string, string> = {
  [MEMBER_ROLE.DEV]: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  [MEMBER_ROLE.TESTER]: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  [MEMBER_ROLE.PM]: "bg-green-500/10 text-green-600 border-green-500/20",
  [MEMBER_ROLE.DESIGNER]: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export function TeamSlide({
  data,
}: {
  data: Pick<SprintReviewData, "memberStats">;
}) {
  const sorted = [...data.memberStats].sort(
    (a, b) => b.completion - a.completion,
  );

  return (
    <div className="flex flex-col gap-4">
      <SlideHeading subtitle="Individual completion and bug stats">
        <span className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team Performance
        </span>
      </SlideHeading>

      <div className="rounded-lg border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_12rem_8rem_8rem_8rem_8rem] bg-muted px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Member</span>
          <span>Completion</span>
          <span className="text-right">Issues</span>
          <span className="text-right">Critical</span>
          <span className="text-right">Fixed</span>
          <span className="text-right">Time (hrs)</span>
        </div>
        <div className="divide-y max-h-[60vh] overflow-y-auto">
          {sorted.map((m) => (
            <div
              key={m.name}
              className="grid grid-cols-[1fr_12rem_8rem_8rem_8rem_8rem] items-center px-4 py-3 text-sm hover:bg-muted/50"
            >
              {/* Name + role */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{m.name}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs shrink-0", ROLE_COLOR[m.role] ?? "")}
                >
                  {m.role}
                </Badge>
              </div>

              {/* Completion bar */}
              <div className="flex items-center gap-2 pr-4">
                <Progress
                  value={m.completion}
                  className="h-2 flex-1 bg-green-500/10"
                  progressClassName="bg-green-500"
                />
                <span className="text-xs w-8 text-right font-medium">
                  {m.completion}%
                </span>
              </div>

              <span className="text-right text-muted-foreground">
                {m.issueCount}
              </span>
              <span
                className={cn(
                  "text-right font-medium",
                  m.criticalBugs > 0 ? "text-red-500" : "text-muted-foreground",
                )}
              >
                {m.criticalBugs}
              </span>
              <span
                className={cn(
                  "text-right font-medium",
                  m.fixedBugs > 0 ? "text-green-600" : "text-muted-foreground",
                )}
              >
                {m.fixedBugs}
              </span>
              <span className="text-right text-muted-foreground">
                {Math.round(m.timeSpent)}h
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
