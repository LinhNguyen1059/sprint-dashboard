import { NextRequest, NextResponse } from "next/server";
import { generateSecretKey, redmineFetch } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("project_id");

  try {
    const encrypted = generateSecretKey();

    const response = await redmineFetch({
      path: `/BugtrackerCustomAPI/GetSprints?projectID=${projectId}`,
      apiKey: encrypted,
      useCustomApi: true,
      options: { headers: { "X-API-Key": encrypted } },
    });

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: "Failed to fetch sprints" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ valid: true, sprints: data.data });
  } catch (error) {
    return NextResponse.json(
      { sprints: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}
