"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/lib/types";
import { usePageTitle } from "@/hooks/use-page-title";

interface ProjectWithMetrics extends Project {
  totalFeatures: number;
  averageFeatureProgress: number;
}

export default function Projects() {
  usePageTitle("Projects");
  const { projects } = useDashboard();

  const projectsWithMetrics: ProjectWithMetrics[] = projects.map((project) => {
    const totalFeatures = project.features.length;
    let totalProgress = 0;

    project.features.forEach((feature) => {
      totalProgress += feature.percentDone || 0;
    });

    const averageFeatureProgress =
      totalFeatures > 0 ? Math.round(totalProgress / totalFeatures) : 0;

    return {
      ...project,
      totalFeatures,
      averageFeatureProgress,
    };
  });

  if (projects.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Projects Board</h1>
          <p className="text-muted-foreground">
            You don&apos;t have any projects yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Projects Board</h1>
        <p className="text-muted-foreground">List of your ongoing projects</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projectsWithMetrics.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="block"
          >
            <Card className="h-full shadow-none gap-0 hover:shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <ArrowUpRight />
                </div>
              </CardHeader>
              <CardContent>
                <div className="">
                  <div className="flex justify-between">
                    <span className="">{project.totalFeatures} Features</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Progress
                      value={project.averageFeatureProgress}
                      className="h-2"
                    />
                    <span className="font-medium">
                      {project.averageFeatureProgress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      <Image
                        src="/male.png"
                        alt="Male"
                        width={32}
                        height={32}
                      />
                      <Image
                        src="/female.png"
                        alt="Male"
                        width={32}
                        height={32}
                      />
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs">+{project.totalMembers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
