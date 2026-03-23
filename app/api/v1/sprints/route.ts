import { NextRequest, NextResponse } from "next/server";
import { getApiKey, redmineFetch } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("project_id");

  try {
    const result = await getApiKey();
    if (result.error) return result.error;
    const { apiKey } = result;

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

    // const response = await redmineFetch("/projects.json", apiKey);

    // if (!response.ok) {
    //   return NextResponse.json(
    //     { valid: false, error: "Failed to fetch projects" },
    //     { status: response.status }
    //   );
    // }

    const data = {
      sprints: [
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 17 - 20250306",
          id: "178",
          status: "Active",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 2 - 20250124",
          id: "59",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 3 - 20250228",
          id: "73",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 4 - 20250331",
          id: "84",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 8 - 20250613",
          id: "106",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 9 - 20250731",
          id: "110",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 5 - 20250425",
          id: "87",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 6 - 20250509",
          id: "96",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 7 - 20250530",
          id: "103",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 11 - 20250919",
          id: "132",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 10 - 20250830",
          id: "121",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 13 - 20250114",
          id: "146",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 12 - 20250920",
          id: "141",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 14 - 20251128",
          id: "153",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 15 - 20251226",
          id: "169",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 1 - 20241231",
          id: "58",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 16 - 20250130",
          id: "174",
          status: "Open",
        },
        {
          name: "#2272: CMS Mobile 3.9 - Sprint 18 - 20250331",
          id: "184",
          status: "Open",
        },
      ],
    };

    const sprints = data.sprints
      .map((sprint) => ({
        id: sprint.id,
        name: sprint.name.split(" - ")[1] || sprint.name,
        status: sprint.status,
      }))
      .sort((a, b) => parseInt(b.id) - parseInt(a.id));

    // const data = await response.json();
    return NextResponse.json({ valid: true, sprints: sprints });
  } catch (error) {
    return NextResponse.json(
      { sprints: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}
