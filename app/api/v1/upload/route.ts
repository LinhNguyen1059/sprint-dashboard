import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabase.storage
      .from("docs")
      .upload(fileName, buffer, {
        upsert: true,
        headers: {
          "Authorization": `${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

    if (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      path: data.path,
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
