"use client";

import { useDashboard } from "@/components/DashboardLayout";
import CardOverview from "@/components/CardOverview";
import { FeatureStatus } from "@/lib/types";
import { usePageTitle } from "@/hooks/use-page-title";

export default function Solutions() {
  usePageTitle("Solutions");
  const { solutions } = useDashboard();

  const solutionsWithMetrics = solutions.map((solution) => {
    const totalFeatures = solution.features.length;
    let totalProgress = 0;
    let totalDevelopmentBugs = 0;
    let totalPostReleaseBugs = 0;
    let totalSpentTime = 0;
    let isInprogress = true;
    let countOnTime = 0;
    let totalCriticalBugs = 0;

    solution.features.forEach((feature) => {
      totalProgress += feature.percentDone || 0;
      totalDevelopmentBugs +=
        feature.criticalBugs + feature.highBugs + feature.normalBugs;
      totalPostReleaseBugs += feature.postReleaseBugs;
      totalSpentTime += feature.totalSpentTime;
      if (feature.dueStatus !== FeatureStatus.INPROGRESS) {
        isInprogress = false;
      }
      if (feature.dueStatus === FeatureStatus.ONTIME) {
        countOnTime++;
      }
      totalCriticalBugs += feature.criticalBugs;
    });

    const averageFeatureProgress =
      totalFeatures > 0 ? Math.round(totalProgress / totalFeatures) : 0;
    const percentOnTime = Math.round((countOnTime / totalFeatures) * 100);

    return {
      ...solution,
      totalFeatures,
      averageFeatureProgress,
      totalDevelopmentBugs,
      totalCriticalBugs,
      totalPostReleaseBugs,
      totalSpentTime,
      isInprogress,
      percentOnTime,
    };
  });

  if (solutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium mb-2">Solutions not found</h3>
        <p className="text-muted-foreground">
          You don&apos;t have any solutions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Solutions Board</h1>
        <p className="text-muted-foreground">List of your ongoing solutions</p>
      </div>

      <CardOverview metrics={solutionsWithMetrics} slug="solutions" />
    </div>
  );
}
