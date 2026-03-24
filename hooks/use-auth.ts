import { useEffect } from "react";

import { useAppStore } from "@/stores/appStore";
import { handleUnauthorized } from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth";

/**
 * Validates the persisted auth state against the actual cookie on every mount.
 *
 * This reconciles mismatches that occur when the cookie is cleared externally
 * (e.g. browser dev-tools, another tab) while the Zustand persist layer still
 * holds `authenticated: true`.
 *
 * Returns `{ authenticated, isAuthChecking }`:
 *  - `isAuthChecking` is `true` until the verification completes, preventing
 *    a flash of the wrong view.
 */
export function useAuth() {
  const authenticated = useAppStore((state) => state.authenticated);
  const isAuthChecking = useAppStore((state) => state.isAuthChecking);
  const setStates = useAppStore((state) => state.setStates);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      if (authenticated) {
        // Cookie was removed externally while the store still says auth'd.
        // `handleUnauthorized` clears the cookie (no-op here) and resets all
        // stores, which will also set `isAuthChecking: false` via `reset()`.
        handleUnauthorized();
      } else {
        setStates({ isAuthChecking: false });
      }
    } else {
      setStates({ authenticated: true, isAuthChecking: false });
    }
    // Run once on mount only — re-running on dep changes would create loops
    // since setStates itself changes identity across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { authenticated, isAuthChecking };
}
