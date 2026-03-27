import { Target } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { StatCard, SlideHeading } from "../SlideLayout";
import { SprintReviewData } from "@/hooks/use-sprint-review";

export function SprintHeaderSlide({
  data,
}: {
  data: Pick<
    SprintReviewData,
    | "projectNames"
    | "sprintNames"
    | "startDate"
    | "endDate"
    | "totalIssues"
    | "storyPointsDone"
  >;
}) {
  const formatDate = (d?: string) =>
    d ? format(new Date(d), "MMM d, yyyy") : "—";

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 text-center">
      <Target className="h-14 w-14 text-primary opacity-80" />

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Sprint Review
        </h1>
        <p className="text-muted-foreground text-lg">
          {formatDate(data.startDate)} — {formatDate(data.endDate)}
        </p>
      </div>

      {/* Projects */}
      {data.projectNames.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {data.projectNames.map((name) => (
            <Badge key={name} variant="secondary" className="text-sm px-3 py-1">
              {name}
            </Badge>
          ))}
        </div>
      )}

      {/* Sprint names */}
      {data.sprintNames.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {data.sprintNames.map((name) => (
            <Badge key={name} variant="outline" className="text-sm px-3 py-1">
              {name}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <StatCard label="Total Issues" value={data.totalIssues} />
        <StatCard label="Story Points Done" value={data.storyPointsDone} />
      </div>
    </div>
  );
}
