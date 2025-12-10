import { supabase } from "./supabase";

/**
 * Refresh the access token using the refresh token
 * Returns the new access token or null if refresh fails
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.error("Error refreshing token:", error);
      return null;
    }

    return data.session.access_token;
  } catch (error) {
    console.error("Unexpected error refreshing token:", error);
    return null;
  }
}

/**
 * Get a valid access token from cookies, refreshing if necessary
 * Returns { token, isRefreshed } or { token: null, isRefreshed: false } if unable to get valid token
 */
export async function getValidAccessToken(
  accessToken?: string,
  refreshToken?: string
): Promise<{ token: string | null; isRefreshed: boolean }> {
  // If no access token provided, nothing we can do
  if (!accessToken) {
    return { token: null, isRefreshed: false };
  }

  // Try to use the access token first
  // If it's valid, it will work. If expired, we'll get an error and refresh
  // For simplicity, we can try to refresh if we have a refresh token
  if (refreshToken) {
    try {
      // Verify the current token by making a test request
      const { data, error } = await supabase.auth.getUser(accessToken);
      
      if (!error && data.user) {
        // Token is still valid
        return { token: accessToken, isRefreshed: false };
      }
      
      // Token is invalid or expired, try to refresh
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        return { token: newToken, isRefreshed: true };
      }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  }

  // If we get here, we couldn't get a valid token
  return { token: null, isRefreshed: false };
}
