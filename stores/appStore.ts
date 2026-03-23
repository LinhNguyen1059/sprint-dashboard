import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ApiProjectResponse } from "@/lib/types";

interface AppState {
  authenticated: boolean;
  projects: ApiProjectResponse[];
  setStates: (partial: Partial<Omit<AppState, "setStates">>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      authenticated: false,
      projects: [],
      setStates: (partial) => set(partial),
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        authenticated: state.authenticated,
        projects: state.projects,
      }),
    },
  ),
);
