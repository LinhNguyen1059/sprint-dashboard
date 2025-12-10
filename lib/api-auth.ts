import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedClient } from "./supabase";
import { refreshAccessToken } from "./auth";

export interface AuthenticatedSupabaseResult {
  supabase: ReturnType<typeof createAuthenticatedClient>;
  accessToken: string;
  refreshToken?: string;
  error?: NextResponse;
}

/**
 * Get an authenticated Supabase client from request cookies
 * Handles token validation and returns error response if unauthorized
 */
export async function getAuthenticatedSupabase(
  req: NextRequest
): Promise<AuthenticatedSupabaseResult> {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    return {
      supabase: createAuthenticatedClient(""),
      accessToken: "",
      error: NextResponse.json(
        { error: "Unauthorized - No access token provided" },
        { status: 401 }
      ),
    };
  }

  return {
    supabase: createAuthenticatedClient(accessToken),
    accessToken,
    refreshToken,
  };
}

export interface RetryWithRefreshOptions {
  refreshToken?: string;
  operation: (supabase: ReturnType<typeof createAuthenticatedClient>) => Promise<{ data: any; error: any }>;
  successResponse: (data: any) => any;
  errorMessage: string;
}

/**
 * Retry an operation with a refreshed token if the initial attempt fails due to token expiration
 */
export async function retryWithTokenRefresh({
  refreshToken,
  operation,
  successResponse,
  errorMessage,
}: RetryWithRefreshOptions): Promise<NextResponse> {
  if (!refreshToken) {
    return NextResponse.json(
      {
        error: "Session expired. Please log in again.",
        sessionExpired: true,
      },
      { status: 401 }
    );
  }

  const newAccessToken = await refreshAccessToken(refreshToken);

  if (!newAccessToken) {
    console.log("Refresh token expired or invalid");
    return NextResponse.json(
      {
        error: "Session expired. Please log in again.",
        sessionExpired: true,
      },
      { status: 401 }
    );
  }

  // Retry the operation with the new token
  const supabase = createAuthenticatedClient(newAccessToken);
  const { data, error } = await operation(supabase);

  if (error) {
    console.error(errorMessage, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return success with the new token
  const response = NextResponse.json({
    ...successResponse(data),
    tokenRefreshed: true,
  });

  response.cookies.set("access_token", newAccessToken, {
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}
