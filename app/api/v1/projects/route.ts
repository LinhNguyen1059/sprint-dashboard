import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const apiKey = (await cookieStore).get('access_token')?.value;

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "Missing API key" }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching projects:", errorData);
      return NextResponse.json({ valid: false, error: "Failed to fetch projects" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ valid: true, projects: data.projects });
  } catch (error) {
    return NextResponse.json({ projects: [], error: "Internal server error" }, { status: 500 });
  }
}
