import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("name");

  if (!fileName) {
    return NextResponse.json({ docs: [], error: "Missing file name" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.storage
      .from("docs").download(fileName);

    if (error) {
      return NextResponse.json({ file: null, error: error.message }, { status: 500 });
    }

    // Return the blob directly instead of wrapping in JSON
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ docs: [], error: "Internal server error" }, { status: 500 });
  }
}