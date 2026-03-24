import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  authenticated: boolean;
  /**
   * `true` while the client-side cookie check hasn't completed yet.
   * Use this to avoid flashing the wrong view before auth is confirmed.
   * Not persisted — always starts as `true` on a fresh page load.
   */
  isAuthChecking: boolean;
  setStates: (partial: Partial<Omit<AppState, "setStates" | "reset">>) => void;
  reset: () => void;
}

const initialAppState = {
  authenticated: false,
  isAuthChecking: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialAppState,
      setStates: (partial) => set(partial),
      // On explicit logout we already know auth is gone — skip the check.
      reset: () => set({ ...initialAppState, isAuthChecking: false }),
    }),
    {
      name: "app-store",
      // isAuthChecking is transient UI state — never persist it.
      partialize: (state) => ({
        authenticated: state.authenticated,
      }),
    },
  ),
);
