import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { fileName, file } = await request.json();

    // Convert base64 file data to a buffer
    const base64Data = file.replace(/^data:.+;base64,/, ""); // Remove data URL prefix
    const fileBuffer = Buffer.from(base64Data, "base64");

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("frames") // Bucket name
      .upload(`uploads/${fileName}`, fileBuffer, {
        contentType: "image/webp", // Change based on file type
        upsert: true, // Overwrite if exists
      });

    if (error) throw error;

    return NextResponse.json({ success: true, url: data.path });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
  }
}
