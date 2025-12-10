import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabase, retryWithTokenRefresh } from "@/lib/api-auth";

export async function DELETE(req: NextRequest) {
  try {
    const { supabase, refreshToken, error: authError } = await getAuthenticatedSupabase(req);
    
    if (authError) {
      return authError;
    }

    const fileName = req.nextUrl.searchParams.get("name");

    if (!fileName) {
      return NextResponse.json(
        { error: "Missing file name" },
        { status: 400 }
      );
    }

    // Try to delete with the current token
    const { data, error } = await supabase.storage
      .from("docs")
      .remove([fileName]);

    // If we get an auth error and have a refresh token, try to refresh
    if (error && error.message.includes("exp")) {
      return retryWithTokenRefresh({
        refreshToken,
        operation: (supabase) => supabase.storage
          .from("docs")
          .remove([fileName]),
        successResponse: () => ({
          success: true,
          message: "File deleted successfully",
        }),
        errorMessage: "Error deleting file:",
      });
    }

    if (error) {
      console.error("Error deleting file:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
