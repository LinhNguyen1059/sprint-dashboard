"use client";

import { useMemo } from "react";
import { AlertCircle, Clock, Flag, Play, TrendingUp, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CombinedIssue, FeatureStatus, Story } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isTester } from "@/lib/teams";

export interface IssueOverviewData {
  criticalBugs: number;
  highBugs: number;
  postReleaseBugs: number;
  bugFound: number;
}

export interface IssueOverviewActions {
  completionRateClick?: () => void;
  inProgressClick?: () => void;
  overdueClick?: () => void;
  criticalBugsClick?: () => void;
  highBugsClick?: () => void;
  postReleaseBugsClick?: () => void;
  bugsFoundClick?: () => void;
}

interface IssueOverviewProps {
  data: IssueOverviewData;
  issues: Story[] | CombinedIssue[];
  memberName?: string;
  actions: IssueOverviewActions;
}

export function IssueOverview({
  data,
  issues,
  memberName,
  actions,
}: IssueOverviewProps) {
  // Calculate metrics for display
  const metrics = useMemo(() => {
    if (!data) return null;

    const totalIssues = issues.length;

    // Count late/closed issues
    const ontimeCount = issues.filter(
      (issue) => issue.dueStatus === FeatureStatus.ONTIME
    ).length;

    const inProgressCount = issues.filter(
      (issue) => issue.dueStatus === FeatureStatus.INPROGRESS
    ).length;

    // Find overdue issues (not closed but past due date)
    const overdueCount = issues.filter(
      (item) => item.dueStatus === FeatureStatus.LATE
    ).length;

    // Calculate completion rate
    const completionRate =
      totalIssues > 0 ? Math.round((ontimeCount / totalIssues) * 100) : 0;

    return {
      inProgressCount,
      overdueCount,
      completionRate,
      // Bug severity metrics from data data
      criticalBugs: data.criticalBugs || 0,
      highBugs: data.highBugs || 0,
      postReleaseBugs: data.postReleaseBugs || 0,
      bugFound: data.bugFound || 0,
    };
  }, [data, issues]);

  const isTesterMember = useMemo(() => {
    return isTester(memberName || "");
  }, [memberName]);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.completionRateClick && "hover:cursor-pointer"
        )}
        onClick={actions?.completionRateClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Completion</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.completionRate}%</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.inProgressClick && "hover:cursor-pointer"
        )}
        onClick={actions?.inProgressClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.inProgressCount}</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.overdueClick && "hover:cursor-pointer"
        )}
        onClick={actions?.overdueClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Total Overdue Issues
          </CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-red-500">
            {metrics?.overdueCount}
          </div>
        </CardContent>
      </Card>

      {/* Bug Severity Cards */}
      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.criticalBugsClick && "hover:cursor-pointer"
        )}
        onClick={actions?.criticalBugsClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Critical Bugs</CardTitle>
          <Zap className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-red-500">
            {metrics?.criticalBugs}
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.highBugsClick && "hover:cursor-pointer"
        )}
        onClick={actions?.highBugsClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">High Bugs</CardTitle>
          <Flag className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-orange-500">
            {metrics?.highBugs}
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.postReleaseBugsClick && "hover:cursor-pointer"
        )}
        onClick={actions?.postReleaseBugsClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Post-Release Bugs
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.postReleaseBugs}</div>
        </CardContent>
      </Card>

      {isTesterMember && (
        <Card
          className={cn(
            "shadow-none py-4 gap-4",
            !!actions?.bugsFoundClick && "hover:cursor-pointer"
          )}
          onClick={actions?.bugsFoundClick}
        >
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">{metrics?.bugFound}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
