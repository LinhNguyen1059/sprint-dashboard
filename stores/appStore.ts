import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  authenticated: boolean;
  setStates: (partial: Partial<Omit<AppState, "setStates" | "reset">>) => void;
  reset: () => void;
}

const initialAppState = {
  authenticated: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialAppState,
      setStates: (partial) => set(partial),
      reset: () => set(initialAppState),
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        authenticated: state.authenticated,
      }),
    },
  ),
);
