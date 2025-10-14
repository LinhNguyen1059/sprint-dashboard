"use client";

import Link from "next/link";
import Image from "next/image";
import { Bug, Clock, Loader } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { FeatureStatus, Project } from "@/lib/types";
import { usePageTitle } from "@/hooks/use-page-title";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectWithMetrics extends Project {
  totalFeatures: number;
  averageFeatureProgress: number;
  totalDevelopmentBugs: number;
  totalPostReleaseBugs: number;
  totalSpentTime: number;
  isInprogress: boolean;
  percentOnTime: number;
}

export default function Projects() {
  usePageTitle("Projects");
  const { projects } = useDashboard();

  const projectsWithMetrics: ProjectWithMetrics[] = projects.map((project) => {
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
        feature.urgentBugs + feature.highBugs + feature.normalBugs;
      totalPostReleaseBugs += feature.ncrBugs;
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
      ...project,
      totalFeatures,
      averageFeatureProgress,
      totalDevelopmentBugs,
      totalPostReleaseBugs,
      totalSpentTime,
      isInprogress,
      percentOnTime
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projectsWithMetrics.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="block"
          >
            <Card className="h-full shadow-none gap-0 hover:shadow-sm py-4">
              <CardHeader className="pb-2 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {project.isInprogress ? (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground px-1.5"
                    >
                      <Loader />
                      In Progress
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5",
                        project.percentOnTime >= 90
                          ? "text-green-500 border-green-100"
                          : "text-orange-500 border-orange-100"
                      )}
                    >
                      {project.percentOnTime}% Features On Time
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="font-medium">
                      {project.totalFeatures} Features
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress
                        value={project.averageFeatureProgress}
                        className="h-2"
                      />
                      <span className="font-medium text-sm">
                        {project.averageFeatureProgress}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Bugs</div>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant="secondary"
                        className="text-[var(--chart-1)] bg-[var(--chart-1)]/10"
                      >
                        <Bug className="h-4 w-4" />
                        {project.totalDevelopmentBugs}
                        <span>Development</span>
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[var(--chart-5)] bg-[var(--chart-5)]/10"
                      >
                        <Bug className="h-4 w-4" />
                        {project.totalPostReleaseBugs}
                        <span>Post-Release</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Spent time</div>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-4 w-4" />
                      {project.totalSpentTime} hrs
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      <Image
                        src="/male.png"
                        alt="Male"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/female.png"
                        alt="Male"
                        width={32}
                        height={32}
                      />
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs">+{project.totalMembers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
