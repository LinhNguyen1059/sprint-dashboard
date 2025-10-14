"use client";

import Link from "next/link";
import Image from "next/image";
import { Bug, Clock, Loader } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { FeatureStatus } from "@/lib/types";
import { usePageTitle } from "@/hooks/use-page-title";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

    solution.features.forEach((feature) => {
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
      ...solution,
      totalFeatures,
      averageFeatureProgress,
      totalDevelopmentBugs,
      totalPostReleaseBugs,
      totalSpentTime,
      isInprogress,
      percentOnTime
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {solutionsWithMetrics.map((solution) => (
          <Link
            key={solution.slug}
            href={`/solutions/${solution.slug}`}
            className="block"
          >
            <Card className="h-full shadow-none gap-0 hover:shadow-sm py-4">
              <CardHeader className="pb-2 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{solution.name}</CardTitle>
                  {solution.isInprogress ? (
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
                        solution.percentOnTime >= 90
                          ? "text-green-500 border-green-100"
                          : "text-orange-500 border-orange-100"
                      )}
                    >
                      {solution.percentOnTime}% Features On Time
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="font-medium">
                      {solution.totalFeatures} Features
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress
                        value={solution.averageFeatureProgress}
                        className="h-2"
                      />
                      <span className="font-medium text-sm">
                        {solution.averageFeatureProgress}%
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
                        {solution.totalDevelopmentBugs}
                        <span>Development</span>
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[var(--chart-5)] bg-[var(--chart-5)]/10"
                      >
                        <Bug className="h-4 w-4" />
                        {solution.totalPostReleaseBugs}
                        <span>Post-Release</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Spent time</div>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-4 w-4" />
                      {solution.totalSpentTime} hrs
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
                        <span className="text-xs">
                          +{solution.totalMembers}
                        </span>
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
