import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabase, retryWithTokenRefresh } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const { supabase, refreshToken, error: authError } = await getAuthenticatedSupabase(req);
    
    if (authError) {
      return authError;
    }

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
    const { data, error } = await supabase.storage
      .from("docs")
      .upload(fileName, buffer, {
        upsert: true,
      });

    // If we get an auth error and have a refresh token, try to refresh
    if (error && error.message.includes("exp")) {
      return retryWithTokenRefresh({
        refreshToken,
        operation: (supabase) => supabase.storage
          .from("docs")
          .upload(fileName, buffer, { upsert: true }),
        successResponse: (data: unknown) => ({
          success: true,
          path: (data as { path: string } | null)?.path || "",
          message: "File uploaded successfully",
        }),
        errorMessage: "Error uploading file:",
      });
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
