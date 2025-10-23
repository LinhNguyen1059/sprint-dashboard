"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { IssueTable } from "@/components/Issue";
import { useDashboard } from "@/components/DashboardLayout";
import { Feature } from "@/lib/types";
import { flattenedIssues, getFeatureStatus } from "@/lib/utils";
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

    return flattenedIssues([featureData]);
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

      <IssueTable data={featureData as Feature} issues={flattenedStories} />
    </div>
  );
}
