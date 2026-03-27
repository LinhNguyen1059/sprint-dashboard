import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("api_key");

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "Missing API key" }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my/account.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ valid: false, error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
