"use client";

import { FeatureStatus } from "@/lib/types";
import { useDashboardStore } from "@/stores/dashboardStore";
import ProjectCard from "./project-card";
import { ProjectSkeleton } from "./project-skeleton";

export function Project() {
  const { projectsData, isLoading } = useDashboardStore();

  const projectsWithMetrics = projectsData.map((project) => {
    const totalFeatures = project.features.length;
    let totalProgress = 0;
    let totalPostReleaseBugs = 0;
    let totalSpentTime = 0;
    let isInprogress = true;
    let countOnTime = 0;
    let totalCriticalBugs = 0;

    project.features.forEach((feature) => {
      totalProgress += feature.percentDone || 0;
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
      ...project,
      totalFeatures,
      averageFeatureProgress,
      totalCriticalBugs,
      totalPostReleaseBugs,
      totalSpentTime,
      isInprogress,
      percentOnTime,
    };
  });

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (projectsData.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Projects Board</h1>
          <p className="text-muted-foreground">
            No results. Please adjust your filters.
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

      <ProjectCard metrics={projectsWithMetrics} slug="project" />
    </div>
  );
}
