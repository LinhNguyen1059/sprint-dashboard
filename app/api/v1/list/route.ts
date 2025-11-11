import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from("docs").list(undefined, { limit: 100 }, {});

    if (error) {
      console.error("Error fetching docs from Supabase:", error);
      return NextResponse.json({ docs: [], error: error.message }, { status: 500 });
    }

    // Check if data is null or undefined
    const docsToSend = data || [];

    return NextResponse.json({
      docs: docsToSend,
    });
  } catch (error) {
    console.error("Unexpected error in GET route:", error);
    return NextResponse.json({ docs: [], error: "Internal server error" }, { status: 500 });
  }
}
