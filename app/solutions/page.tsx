"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboard } from "@/components/DashboardLayout";
import { usePageTitle } from "@/hooks/use-page-title";

export default function Solutions() {
  usePageTitle("Solutions");
  const { solutions } = useDashboard();

  const solutionsWithMetrics = solutions.map((solution) => {
    const totalFeatures = solution.features.length;

    return {
      ...solution,
      totalFeatures,
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {solutionsWithMetrics.map((solution) => (
          <Link
            key={solution.slug}
            href={`/solutions/${solution.slug}`}
            className="block"
          >
            <Card className="h-full shadow-none gap-0 hover:shadow-sm">
              <CardHeader className="gap-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{solution.name}</CardTitle>
                    <CardDescription>
                      {solution.totalFeatures} Features
                    </CardDescription>
                  </div>
                  <ArrowUpRight />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
