"use client";

import { useAppStore } from "@/stores/appStore";
import { useDashboardStore } from "@/stores/dashboardStore";

function clearAuthCookie() {
  document.cookie = "access_token=; path=/; max-age=0";
}

function resetAllStores() {
  useAppStore.getState().reset();
  useDashboardStore.getState().reset();
}

export function handleUnauthorized() {
  clearAuthCookie();
  resetAllStores();
}

type FetchOptions = RequestInit & {
  /** Skip the 401 global handler for this specific call */
  skipUnauthorizedHandler?: boolean;
};

/**
 * Client-side fetch wrapper for internal API routes.
 * Automatically handles 401 responses by clearing auth state and resetting stores.
 */
export async function apiFetch<T = unknown>(
  input: RequestInfo | URL,
  options: FetchOptions = {},
): Promise<{ data: T | null; response: Response; ok: boolean }> {
  const { skipUnauthorizedHandler = false, ...fetchOptions } = options;

  const response = await fetch(input, fetchOptions);

  if (response.status === 401 && !skipUnauthorizedHandler) {
    handleUnauthorized();
    return { data: null, response, ok: false };
  }

  if (!response.ok) {
    return { data: null, response, ok: false };
  }

  const data = (await response.json()) as T;
  return { data, response, ok: true };
}
