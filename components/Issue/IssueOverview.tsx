"use client";

import { useMemo } from "react";
import {
  AlertCircle,
  Bug,
  Clock,
  Flag,
  List,
  Play,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feature, Story } from "@/lib/types";

export function IssueOverview({
  feature,
  stories,
}: {
  feature?: Feature;
  stories: Story[];
}) {
  // Calculate metrics for display
  const metrics = useMemo(() => {
    if (!feature) return null;

    const totalStories = feature.stories.length;
    const totalIssues = stories.length;

    // Count different types of issues
    const bugCount = stories.filter((item) =>
      item.tracker.toLowerCase().includes("bug")
    ).length;

    // Count late/closed issues
    const closedCount = stories.filter(
      (item) => item.status.toLowerCase() === "closed"
    ).length;

    const inProgressCount = stories.filter(
      (item) => item.status.toLowerCase() === "in progress"
    ).length;

    // Find overdue issues (not closed but past due date)
    const today = new Date();
    const overdueCount = stories.filter((item) => {
      // Check if item is not closed and has a due date
      if (item.status.toLowerCase() === "closed" || !item.dueDate) {
        return false;
      }

      // Parse the due date and compare with today
      const dueDate = new Date(item.dueDate);
      return !isNaN(dueDate.getTime()) && dueDate < today;
    }).length;

    // Calculate completion rate
    const completionRate =
      totalIssues > 0 ? Math.round((closedCount / totalIssues) * 100) : 0;

    return {
      totalStories,
      totalIssues,
      bugCount,
      closedCount,
      inProgressCount,
      overdueCount,
      completionRate,
      // Bug severity metrics from feature data
      urgentBugs: feature.urgentBugs || 0,
      highBugs: feature.highBugs || 0,
      ncrBugs: feature.ncrBugs || 0,
    };
  }, [feature, stories]);

  if (!feature) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 md:grid-cols-4 xl:grid-cols-8 gap-4">
      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.totalIssues}</div>
        </CardContent>
      </Card>

      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Bugs</CardTitle>
          <Bug className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.bugCount}</div>
        </CardContent>
      </Card>

      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Completion</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.completionRate}%</div>
        </CardContent>
      </Card>

      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.inProgressCount}</div>
        </CardContent>
      </Card>

      {/* Bug Severity Cards */}
      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Urgent Bugs</CardTitle>
          <Zap className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-red-500">
            {metrics?.urgentBugs}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none py-4 gap-4">
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

      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">NCR Bugs</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{metrics?.ncrBugs}</div>
        </CardContent>
      </Card>

      <Card className="shadow-none py-4 gap-4">
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Overdue Issues</CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-red-500">
            {metrics?.overdueCount}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
