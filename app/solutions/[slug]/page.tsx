"use client";

import { useParams } from "next/navigation";

import { useDashboard } from "@/components/DashboardLayout";
import { FeatureChart, FeatureTable } from "@/components/Feature";
import { usePageTitle } from "@/hooks/use-page-title";

export default function SolutionDetail() {
  const { solutions } = useDashboard();
  const params = useParams();
  const { slug } = params;

  // Find the project by slug
  const solution = solutions.find((p) => p.slug === slug);

  usePageTitle(solution?.name || "Project Detail");

  if (!solution) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium mb-2">Solution not found</h3>
        <p className="text-muted-foreground">
          The solution you are looking for does not exist or has not been loaded
          yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{solution.name}</h1>
      </div>

      <FeatureChart data={solution.features} />
      <FeatureTable
        data={solution.features}
        slug={slug as string}
        route="solutions"
      />
    </div>
  );
}
