import { useEffect } from "react";

import { useDashboardStore } from "@/stores/dashboardStore";
import { apiFetch } from "@/lib/api-client";
import { ApiProjectResponse } from "@/lib/types";

export function SidebarLogic() {
  const { setStates, checkIsAllFilterApplied, getReportData } =
    useDashboardStore();

  const hasFilterToApply = checkIsAllFilterApplied();

  const getProjects = async () => {
    setStates({ isProjectLoading: true });
    try {
      const { data } = await apiFetch<{ projects: ApiProjectResponse[] }>(
        "/api/v1/projects",
      );
      if (data) {
        setStates({ projects: data.projects });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setStates({ isProjectLoading: false });
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  useEffect(() => {
    if (hasFilterToApply) {
      getReportData();
    }
  }, []);

  return null;
}
