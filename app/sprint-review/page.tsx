"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SlideLayout } from "@/components/sprint-review/SlideLayout";
import { SprintHeaderSlide } from "@/components/sprint-review/slides/SprintHeaderSlide";
import { SummarySlide } from "@/components/sprint-review/slides/SummarySlide";
import { CompletedSlide } from "@/components/sprint-review/slides/CompletedSlide";
import { IncompleteSlide } from "@/components/sprint-review/slides/IncompleteSlide";
import { BugSlide } from "@/components/sprint-review/slides/BugSlide";
import { TeamSlide } from "@/components/sprint-review/slides/TeamSlide";
import { VelocitySlide } from "@/components/sprint-review/slides/VelocitySlide";

import { useSprintReview } from "@/hooks/use-sprint-review";
import { useDashboardStore } from "@/stores/dashboardStore";
import { usePageTitle } from "@/hooks/use-page-title";

const SLIDE_TITLES = [
  "Sprint Header",
  "Summary",
  "Completed",
  "Incomplete",
  "Bug Report",
  "Team Performance",
  "Velocity",
];

export default function SprintReviewPage() {
  const router = useRouter();
  const { reports } = useDashboardStore();
  const [current, setCurrent] = useState(0);
  const data = useSprintReview();

  usePageTitle("Sprint Review");

  const total = SLIDE_TITLES.length;
  const onPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const onNext = useCallback(
    () => setCurrent((c) => Math.min(total - 1, c + 1)),
    [total],
  );

  if (!reports.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-muted-foreground text-lg">
          No report data available. Please apply a filter from the sidebar
          first.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Print button — hidden in print */}
      <div className="absolute top-3 right-4 z-20 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.print()}
          title="Print / Save as PDF"
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
      </div>

      <SlideLayout
        current={current}
        total={total}
        onPrev={onPrev}
        onNext={onNext}
        title={SLIDE_TITLES[current]}
      >
        {current === 0 && <SprintHeaderSlide data={data} />}
        {current === 1 && <SummarySlide data={data} />}
        {current === 2 && <CompletedSlide data={data} />}
        {current === 3 && <IncompleteSlide data={data} />}
        {current === 4 && <BugSlide data={data} />}
        {current === 5 && <TeamSlide data={data} />}
        {current === 6 && <VelocitySlide data={data} />}
      </SlideLayout>
    </div>
  );
}
