import { Bug, BugOff, ShieldAlert, PackageCheck } from "lucide-react";

import { StatCard, SlideHeading } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";
import { Progress } from "@/components/ui/progress";

export function BugSlide({
  data,
}: {
  data: Pick<
    SprintReviewData,
    | "criticalBugsCount"
    | "highBugsCount"
    | "fixedBugsCount"
    | "postReleaseBugsCount"
  >;
}) {
  const totalCreated = data.criticalBugsCount + data.highBugsCount;
  const fixRate =
    totalCreated > 0
      ? Math.round((data.fixedBugsCount / totalCreated) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <SlideHeading subtitle="Bug creation and resolution summary for this sprint">
        Bug Report 🐛
      </SlideHeading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Critical / Urgent Bugs"
          value={data.criticalBugsCount}
          className={data.criticalBugsCount > 0 ? "border-red-600/40" : ""}
        />
        <StatCard
          label="High Bugs"
          value={data.highBugsCount}
          className={data.highBugsCount > 0 ? "border-orange-500/40" : ""}
        />
        <StatCard
          label="Bugs Fixed"
          value={data.fixedBugsCount}
          className="border-green-500/30"
        />
        <StatCard
          label="Post-Release Bugs"
          value={data.postReleaseBugsCount}
          className={
            data.postReleaseBugsCount > 0 ? "border-yellow-500/40" : ""
          }
        />
      </div>

      {/* Fix rate bar */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium">
            <BugOff className="h-4 w-4 text-green-500" />
            Bug Fix Rate (High+Critical)
          </span>
          <span className="font-bold text-lg">{fixRate}%</span>
        </div>
        <Progress
          value={fixRate}
          className="h-4 bg-green-500/10"
          progressClassName="bg-green-500"
        />
        <p className="text-xs text-muted-foreground">
          {data.fixedBugsCount} fixed out of {totalCreated} High / Critical bugs
          created
        </p>
      </div>

      {data.postReleaseBugsCount > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          ⚠️ <strong>{data.postReleaseBugsCount} post-release bug(s)</strong>{" "}
          reported this sprint — review root causes in retrospective.
        </div>
      )}
    </div>
  );
}
