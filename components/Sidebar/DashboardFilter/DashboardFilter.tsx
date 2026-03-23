import { useEffect } from "react";

import { useAppStore } from "@/stores/appStore";
import { SelectProject } from "./SelectProject";
import { SelectSprint } from "./SelectSprint";
import { SelectDateRange } from "./SelectDateRange";

export function DashboardFilter() {
  const { setStates } = useAppStore();

  const getProjects = async () => {
    try {
      const response = await fetch("/api/v1/projects");
      if (response.ok) {
        const data = await response.json();
        setStates({ projects: data.projects });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    // getProjects();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <SelectProject />
      <SelectSprint />
      <SelectDateRange />
    </div>
  );
}
