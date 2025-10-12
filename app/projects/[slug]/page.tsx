"use client";

import { useParams } from "next/navigation";

import { useDashboard } from "@/components/DashboardLayout";
import { ProjectChart, ProjectTable } from "@/components/Project";

export default function ProjectDetail() {
  const { projects } = useDashboard();
  const params = useParams();
  const { slug } = params;

  // Find the project by slug
  const project = projects.find((p) => p.projectSlug === slug);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium mb-2">Project not found</h3>
        <p className="text-muted-foreground">
          The project you are looking for does not exist or has not been loaded
          yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Features Board</h1>
      </div>
      <div>
        <ProjectChart />
      </div>
      <div>
        <ProjectTable data={project.features} />
      </div>
    </div>
  );
}
