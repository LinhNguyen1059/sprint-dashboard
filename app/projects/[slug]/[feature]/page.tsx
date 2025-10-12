"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { useDashboard } from "@/components/DashboardLayout";
import { Story } from "@/lib/types";
import { FeatureTable } from "@/components/FeatureTable";

export default function FeatureDetail() {
  const params = useParams();
  const { slug, feature } = params;

  const { projects } = useDashboard();

  const flattenedStories = useMemo(() => {
    if (!slug || !feature || projects.length === 0) {
      return [];
    }

    const project = projects.find((p) => p.projectSlug === slug);
    const featureData = project?.features.find((f) => f.slug === feature);

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
  }, [feature, projects, slug]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Issues Board</h1>
      </div>
      <div>
        <FeatureTable data={flattenedStories} />
      </div>
    </div>
  );
}
