import { NextRequest, NextResponse } from "next/server";
import { generateSecretKey, redmineFetch } from "@/lib/api-helpers";
import { parseReportData } from "@/lib/csvParser";

export async function GET(req: NextRequest) {
  const projectIds = req.nextUrl.searchParams.get("project_ids");
  const sprintIds = req.nextUrl.searchParams.get("sprint_ids");
  const startDate = req.nextUrl.searchParams.get("start_date");
  const endDate = req.nextUrl.searchParams.get("end_date");

  try {
    const encrypted = generateSecretKey();

    const params = new URLSearchParams();
    if (projectIds) params.set("projectIDs", projectIds);
    if (sprintIds) params.set("sprintIDs", sprintIds);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const url = `/BugtrackerCustomAPI/GetIssueReportData?${params.toString()}`;

    const response = await redmineFetch({
      path: url,
      apiKey: encrypted,
      useCustomApi: true,
      options: { headers: { "X-API-Key": encrypted } },
    });

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: "Failed to fetch reports" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const reports = parseReportData(data.data);
    return NextResponse.json({ valid: true, reports });
  } catch (error) {
    return NextResponse.json(
      { reports: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}
