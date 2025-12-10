import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase";
import { refreshAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get the access token and refresh token from cookies
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token provided" },
        { status: 401 }
      );
    }

    // Create an authenticated Supabase client with the user's access token
    let supabase = createAuthenticatedClient(accessToken);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try to upload with the current token
    let { data, error } = await supabase.storage
      .from("docs")
      .upload(fileName, buffer, {
        upsert: true,
      });

    // If we get an auth error and have a refresh token, try to refresh
    if (error && error.message.includes("exp") && refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken);

      if (newAccessToken) {
        // Retry the upload with the new token
        supabase = createAuthenticatedClient(newAccessToken);
        const retryResult = await supabase.storage
          .from("docs")
          .upload(fileName, buffer, {
            upsert: true,
          });

        data = retryResult.data;
        error = retryResult.error;

        // Return the new token in response headers so client can update it
        const response = NextResponse.json(
          error 
            ? { error: error.message }
            : { 
                success: true, 
                path: data?.path || "",
                message: "File uploaded successfully",
                tokenRefreshed: true
              },
          { status: error ? 500 : 200 }
        );

        // Set the new access token in the response
        response.cookies.set("access_token", newAccessToken, {
          path: "/",
          maxAge: 60 * 60, // 1 hour
        });

        return response;
      } else {
        // Refresh token is also expired or invalid
        console.log("Refresh token expired or invalid");
        return NextResponse.json(
          { 
            error: "Session expired. Please log in again.",
            sessionExpired: true 
          },
          { status: 401 }
        );
      }
    }

    if (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      path: data?.path || "",
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
