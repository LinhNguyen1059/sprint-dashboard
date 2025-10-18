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
import { Member } from "@/lib/types";

export function MembetOverview({ member }: { member: Member }) {
  // Calculate metrics for display
  const metrics = useMemo(() => {
    if (!member) return null;

    const issues = member.issues;
    const totalIssues = issues.length;

    // Count different types of issues
    const bugCount = issues.filter((item) =>
      item.tracker.toLowerCase().includes("bug")
    ).length;

    // Count late/closed issues
    const closedCount = issues.filter(
      (item) => item.status.toLowerCase() === "closed"
    ).length;

    const inProgressCount = issues.filter(
      (item) => item.status.toLowerCase() === "in progress"
    ).length;

    // Find overdue issues (not closed but past due date)
    const today = new Date();
    const overdueCount = issues.filter((item) => {
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
      totalIssues,
      bugCount,
      closedCount,
      inProgressCount,
      overdueCount,
      completionRate,
      // Bug severity metrics from feature data
      urgentBugs: member.urgentBugs || 0,
      highBugs: member.highBugs || 0,
      ncrBugs: member.ncrBugs || 0,
    };
  }, [member]);

  if (!member) return null;

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
