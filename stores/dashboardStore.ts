import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ApiProjectResponse, Filter, Sprint } from "@/lib/types";

interface DashboardState {
  projects: ApiProjectResponse[];
  isProjectLoading: boolean;
  filter: Filter;
  sprints: Sprint[];
  isSprintLoading: boolean;
  setStates: (
    partial: Partial<
      Omit<
        DashboardState,
        "setStates" | "reset" | "toggleProjectInFilter" | "toggleSprintInFilter"
      >
    >,
  ) => void;
  reset: () => void;
  toggleProjectInFilter: (projectId: number, value: boolean) => void;
  toggleSprintInFilter: (sprintId: number, value: boolean) => void;
  setFilterStates: (field: keyof Filter, value: any) => void;
  resetFilter: (field: keyof Filter) => void;
}

const initialDashboardState = {
  projects: [] as ApiProjectResponse[],
  isProjectLoading: false,
  filter: {
    projectIds: [],
    sprintIds: undefined,
    startDate: undefined,
    endDate: undefined,
  } as Filter,
  sprints: [] as Sprint[],
  isSprintLoading: false,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialDashboardState,
      setStates: (partial) => set(partial),
      reset: () => set(initialDashboardState),
      toggleProjectInFilter: (projectId, value) =>
        set((state) => {
          const { filter } = state;
          const projectIds = new Set(filter.projectIds);

          if (value) {
            projectIds.add(projectId);
          } else {
            projectIds.delete(projectId);
          }

          const projectIdsArray = Array.from(projectIds);

          return {
            filter: {
              ...filter,
              projectIds: projectIdsArray,
              sprintIds: projectIdsArray.length === 1 ? filter.sprintIds : [],
            },
          };
        }),
      toggleSprintInFilter: (sprintId, value) =>
        set((state) => {
          const { filter } = state;
          const sprintIds = new Set(filter.sprintIds || []);

          if (value) {
            sprintIds.add(sprintId);
          } else {
            sprintIds.delete(sprintId);
          }

          return {
            filter: {
              ...filter,
              sprintIds: Array.from(sprintIds),
            },
          };
        }),
      setFilterStates: (field, value) =>
        set((state) => ({
          filter: {
            ...state.filter,
            [field]: value,
          },
        })),
      resetFilter: (field) =>
        set((state) => ({
          filter: {
            ...state.filter,
            [field]:
              field === "projectIds" || field === "sprintIds" ? [] : undefined,
          },
        })),
    }),
    {
      name: "dashboard-store",
      partialize: (state) => ({
        projects: state.projects,
      }),
    },
  ),
);
