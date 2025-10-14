"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { IssueOverview, IssueTable } from "@/components/Issue";
import { useDashboard } from "@/components/DashboardLayout";
import { Story } from "@/lib/types";
import { getFeatureStatus } from "@/lib/utils";
import { usePageTitle } from "@/hooks/use-page-title";

export default function FeatureDetail() {
  const params = useParams();
  const { slug, feature } = params;

  const { projects } = useDashboard();

  const featureData = useMemo(() => {
    if (!slug || !feature || projects.length === 0) {
      return undefined;
    }
    const project = projects.find((p) => p.slug === slug);
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

    featureData.others.forEach((issue) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      allItems.push(issue);
    });

    return allItems;
  }, [featureData]);

  const featureStatus = useMemo(() => {
    if (!featureData) return null;
    return getFeatureStatus(featureData.dueStatus);
  }, [featureData]);

  usePageTitle(featureData ? featureData.subject : "Feature Detail");

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{featureData?.subject}</h1>
          {featureStatus && (
            <Badge variant="outline" className={featureStatus.class}>
              {featureStatus.icon && <featureStatus.icon />}
              {featureStatus.text}
            </Badge>
          )}
        </div>
      </div>

      <IssueOverview feature={featureData} stories={flattenedStories} />
      <IssueTable data={flattenedStories} />
    </div>
  );
}
