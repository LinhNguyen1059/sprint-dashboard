import { NextRequest, NextResponse } from "next/server";
import { getApiKey, redmineFetch } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const result = await getApiKey();
    if (result.error) return result.error;
    const { apiKey } = result;

    const response = await redmineFetch({
      path: "/projects.json",
      apiKey,
    });

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: "Failed to fetch projects" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ valid: true, projects: data.projects });
  } catch (error) {
    return NextResponse.json(
      { projects: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}
