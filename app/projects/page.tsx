"use client";

import { useDashboard } from "@/components/DashboardLayout";
import CardOverview from "@/components/CardOverview";
import { FeatureStatus } from "@/lib/types";
import { usePageTitle } from "@/hooks/use-page-title";

export default function Projects() {
  usePageTitle("Projects");
  const { projects } = useDashboard();

  const projectsWithMetrics = projects.map((project) => {
    const totalFeatures = project.features.length;
    let totalProgress = 0;
    let totalDevelopmentBugs = 0;
    let totalPostReleaseBugs = 0;
    let totalSpentTime = 0;
    let isInprogress = true;
    let countOnTime = 0;

    project.features.forEach((feature) => {
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
    });

    const averageFeatureProgress =
      totalFeatures > 0 ? Math.round(totalProgress / totalFeatures) : 0;
    const percentOnTime = Math.round((countOnTime / totalFeatures) * 100);

    return {
      name: project.name,
      slug: project.slug,
      totalFeatures,
      averageFeatureProgress,
      totalDevelopmentBugs,
      totalPostReleaseBugs,
      totalSpentTime,
      isInprogress,
      percentOnTime,
      totalMembers: project.totalMembers,
    };
  });

  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Projects Board</h1>
          <p className="text-muted-foreground">
            You don&apos;t have any projects yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Projects Board</h1>
        <p className="text-muted-foreground">List of your ongoing projects</p>
      </div>

      <CardOverview metrics={projectsWithMetrics} slug="projects" />
    </div>
  );
}
