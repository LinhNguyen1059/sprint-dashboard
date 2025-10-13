"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { useDashboard } from "@/components/DashboardLayout";
import { Story } from "@/lib/types";
import { FeatureTable } from "@/components/FeatureTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeatureStatus } from "@/lib/utils";

export default function FeatureDetail() {
  const params = useParams();
  const { slug, feature } = params;

  const { projects } = useDashboard();

  const featureData = useMemo(() => {
    if (!slug || !feature || projects.length === 0) {
      return null;
    }
    const project = projects.find((p) => p.projectSlug === slug);
    return project?.features.find((f) => f.slug === feature);
  }, [feature, projects, slug]);

  const flattenedStories = useMemo(() => {
    if (!featureData) {
      return [];
    }

    const allItems: Story[] = [];

    featureData.stories.forEach((story) => {
      allItems.push(story);

      story.issues.forEach((issue) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allItems.push(issue);
      });
    });

    return allItems;
  }, [featureData]);

  // Calculate metrics for display
  const metrics = useMemo(() => {
    if (!featureData) return null;

    const totalStories = featureData.stories.length;
    const totalIssues = flattenedStories.length;

    // Count different types of issues
    const bugCount = flattenedStories.filter((item) =>
      item.tracker.toLowerCase().includes("bug")
    ).length;

    const taskCount = flattenedStories.filter((item) =>
      item.tracker.toLowerCase().includes("task")
    ).length;

    const storyCount = flattenedStories.filter((item) =>
      item.tracker.toLowerCase().includes("story")
    ).length;

    // Count late/closed issues
    const closedCount = flattenedStories.filter(
      (item) => item.status.toLowerCase() === "closed"
    ).length;

    const inProgressCount = flattenedStories.filter(
      (item) => item.status.toLowerCase() === "in progress"
    ).length;

    // Find overdue issues (not closed but past due date)
    const today = new Date();
    const overdueCount = flattenedStories.filter((item) => {
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
      taskCount,
      storyCount,
      closedCount,
      inProgressCount,
      overdueCount,
      completionRate,
      // Bug severity metrics from feature data
      urgentBugs: featureData.urgentBugs || 0,
      highBugs: featureData.highBugs || 0,
      normalBugs: featureData.normalBugs || 0,
      ncrBugs: featureData.ncrBugs || 0,
      // Feature status
      dueStatus: featureData.dueStatus
    };
  }, [featureData, flattenedStories]);

  // Get feature status info
  const featureStatus = useMemo(() => {
    if (!featureData) return null;
    return getFeatureStatus(featureData.dueStatus);
  }, [featureData]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{featureData?.subject}</h1>
          {featureStatus && (
            <Badge className={featureStatus.class}>{featureStatus.text}</Badge>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 md:grid-cols-4 xl:grid-cols-8 gap-4">
          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">
                Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalIssues}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Bugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.bugCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.completionRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.inProgressCount}
              </div>
            </CardContent>
          </Card>

          {/* Bug Severity Cards */}
          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Urgent Bugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {metrics.urgentBugs}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">High Bugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {metrics.highBugs}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Normal Bugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.normalBugs}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">
                Overdue Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {metrics.overdueCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <FeatureTable data={flattenedStories} />
      </div>
    </div>
  );
}
