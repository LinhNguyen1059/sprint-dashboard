import { NextRequest, NextResponse } from "next/server";
import { getApiKey, redmineFetch } from "@/lib/api-helpers";

const PAGE_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const result = await getApiKey();
    if (result.error) return result.error;
    const { apiKey } = result;

    const allProjects: unknown[] = [];
    let offset = 0;

    while (true) {
      const response = await redmineFetch({
        path: `/projects.json?limit=${PAGE_LIMIT}&offset=${offset}`,
        apiKey,
      });

      if (!response.ok) {
        return NextResponse.json(
          { valid: false, error: "Failed to fetch projects" },
          { status: response.status },
        );
      }

      const data = await response.json();
      const page: unknown[] = data.projects ?? [];
      allProjects.push(...page);

      if (allProjects.length >= data.total_count || page.length < PAGE_LIMIT) {
        break;
      }

      offset += PAGE_LIMIT;
    }

    return NextResponse.json({ valid: true, projects: allProjects });
  } catch (error) {
    return NextResponse.json(
      { projects: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}
