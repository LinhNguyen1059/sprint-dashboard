/**
 * Cookie-based auth token utilities.
 * Centralise all cookie access here so it is easy to migrate to httpOnly
 * cookies or another storage strategy in the future.
 */

/** Returns the raw access-token value, or `null` if absent / server-side. */
export function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match?.[1] ?? null;
}

/** Persists the access token in a long-lived cookie. */
export function setAccessToken(token: string): void {
  document.cookie = `access_token=${token}; path=/; max-age=31536000; SameSite=Strict`;
}

/** Removes the access-token cookie immediately. */
export function clearAccessToken(): void {
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
}
