import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";

import {
  ApiProjectResponse,
  ApiReportResponse,
  CombinedIssue,
  Filter,
  Member,
  Sprint,
} from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { calculateMembers } from "@/lib/csvParser";
import { TEAMS } from "@/lib/teams";

interface DashboardState {
  _hasHydrated: boolean;
  projects: ApiProjectResponse[];
  isProjectLoading: boolean;
  filter: Filter;
  sprints: Sprint[];
  isSprintLoading: boolean;
  isLoading: boolean;
  reports: CombinedIssue[];
  members: Member[];
  setStates: (
    partial: Partial<
      Omit<
        DashboardState,
        "setStates" | "reset" | "toggleProjectInFilter" | "toggleSprintInFilter"
      >
    >,
  ) => void;
  reset: () => void;
  setHasHydrated: (value: boolean) => void;
  toggleProjectInFilter: (projectId: number, value: boolean) => void;
  toggleSprintInFilter: (sprintId: number, value: boolean) => void;
  setFilterStates: (field: keyof Filter, value: Filter[keyof Filter]) => void;
  resetFilter: (field: keyof Filter) => void;
  getMemberBySlug: (slug: string) => Member | undefined;
  checkIsAnyFilterApplied: () => boolean;
  checkIsAllFilterApplied: () => boolean;
  getReportData: () => void;
}

const initialDashboardState = {
  _hasHydrated: false,
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
  isLoading: false,
  reports: [],
  members: [],
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...initialDashboardState,
      setStates: (partial) => set(partial),
      reset: () => set(initialDashboardState),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
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
            [field]: initialDashboardState.filter[field],
          },
        })),

      getMemberBySlug: (slug) =>
        get().members.find((member) => member.slug === slug),

      checkIsAnyFilterApplied: () => {
        const { filter } = get();
        return (
          filter.projectIds.length > 0 ||
          (filter.sprintIds?.length ?? 0) > 0 ||
          !!(filter.startDate && filter.endDate)
        );
      },

      checkIsAllFilterApplied: () => {
        const { filter } = get();
        const hasProjects = filter.projectIds.length > 0;
        const hasSprints = (filter.sprintIds?.length ?? 0) > 0;
        const hasDateRange = !!(
          filter.startDate &&
          filter.endDate &&
          new Date(filter.startDate) < new Date(filter.endDate)
        );
        const hasPartialDateRange =
          !!(filter.startDate || filter.endDate) && !hasDateRange;
        return (
          hasProjects && (hasSprints || hasDateRange) && !hasPartialDateRange
        );
      },

      getReportData: async () => {
        set({ isLoading: true });
        try {
          const params = new URLSearchParams();
          const { filter } = get();
          if (filter.projectIds.length > 0)
            params.set("project_ids", filter.projectIds.join(","));
          if (filter.sprintIds && filter.sprintIds?.length > 0)
            params.set("sprint_ids", filter.sprintIds.join(","));
          if (filter.startDate)
            params.set(
              "start_date",
              format(new Date(filter.startDate), "yyyy-MM-dd"),
            );
          if (filter.endDate)
            params.set(
              "end_date",
              format(new Date(filter.endDate), "yyyy-MM-dd"),
            );

          const { data } = await apiFetch<{ reports: ApiReportResponse[] }>(
            `/api/v1/reports?${params.toString()}`,
          );
          if (data && Array.isArray(data.reports)) {
            const members = calculateMembers(
              data.reports as unknown as CombinedIssue[],
              TEAMS,
            );
            set({
              reports: data.reports as unknown as CombinedIssue[],
              members,
            });
          }
        } catch (error) {
          console.error("Error fetching report data:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "dashboard-store",
      partialize: (state) => ({
        projects: state.projects,
        filter: state.filter,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const useStoreHydrated = () =>
  useDashboardStore((state) => state._hasHydrated);
