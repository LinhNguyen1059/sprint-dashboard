"use client";

import { Bug, Clock, Play, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Feature } from "@/lib/types";

export interface ProjectIssueOverviewActions {
  completionRateClick?: () => void;
  inProgressClick?: () => void;
  overdueClick?: () => void;
  criticalBugsClick?: () => void;
  highBugsClick?: () => void;
  postReleaseBugsClick?: () => void;
}

interface ProjectIssueOverviewProps {
  feature?: Feature;
  actions: ProjectIssueOverviewActions;
}

export function ProjectIssueOverview({
  feature,
  actions,
}: ProjectIssueOverviewProps) {
  const completionRate = useMemo(() => {
    if (!feature) return 0;
    const totalIssues = feature.issues.length;
    if (totalIssues === 0) return 0;
    return Math.min(Math.round((feature.completion / totalIssues) * 100), 100);
  }, [feature]);

  const inProgressRate = useMemo(() => {
    if (!feature) return 0;
    const totalIssues = feature.issues.length;
    if (totalIssues === 0) return 0;
    return Math.min(Math.round((feature.inProgress / totalIssues) * 100), 100);
  }, [feature]);

  if (!feature) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.completionRateClick && "hover:cursor-pointer",
        )}
        onClick={actions?.completionRateClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{completionRate}%</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.inProgressClick && "hover:cursor-pointer",
        )}
        onClick={actions?.inProgressClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            In Progress Rate
          </CardTitle>
          <Play className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{inProgressRate}%</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.overdueClick && "hover:cursor-pointer",
        )}
        onClick={actions?.overdueClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Total Overdue Tasks
          </CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-red-500">
            {feature.overdueTasks}
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.criticalBugsClick && "hover:cursor-pointer",
        )}
        onClick={actions?.criticalBugsClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Total Critical Bugs
          </CardTitle>
          <Bug className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{feature.criticalBugs}</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.highBugsClick && "hover:cursor-pointer",
        )}
        onClick={actions?.highBugsClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total High Bugs</CardTitle>
          <Bug className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{feature.highBugs}</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.postReleaseBugsClick && "hover:cursor-pointer",
        )}
        onClick={actions?.postReleaseBugsClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Total Post-release Bugs
          </CardTitle>
          <Bug className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{feature.postReleaseBugs}</div>
        </CardContent>
      </Card>
    </div>
  );
}
