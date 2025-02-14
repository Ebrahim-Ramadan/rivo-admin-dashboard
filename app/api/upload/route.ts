// app/api/upload/route.ts
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { fileName,  file } = await request.json()

    // Ensure the frames directory exists
    const framesDir = path.join(process.cwd(), "public", "frames")
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true })
    }

    // Decode the base64 file data
    const base64Data = file.replace(/^data:.+;base64,/, "") // Remove the data URL prefix
    const fileBuffer = Buffer.from(base64Data, "base64")

    // Save the file to the frames directory
    fs.writeFileSync(path.join(framesDir, fileName), fileBuffer)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 })
  }
}