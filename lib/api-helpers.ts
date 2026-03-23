import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Read the Redmine API key from the `access_token` cookie.
 * Returns `{ apiKey }` on success or `{ error: NextResponse }` when missing.
 */
export async function getApiKey(): Promise<
  { apiKey: string; error?: never } | { apiKey?: never; error: NextResponse }
> {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get("access_token")?.value;

  if (!apiKey) {
    return {
      error: NextResponse.json(
        { valid: false, error: "Missing API key" },
        { status: 400 }
      ),
    };
  }

  return { apiKey };
}

/**
 * Wrapper around fetch for Redmine API calls.
 * Automatically injects the required headers.
 */
export async function redmineFetch(
  path: string,
  apiKey: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  return fetch(url, {
    ...options,
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": apiKey,
      ...options?.headers,
    },
  });
}
