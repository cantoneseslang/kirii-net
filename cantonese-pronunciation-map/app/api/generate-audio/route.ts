import { type NextRequest, NextResponse } from "next/server"
import { generateAudioFile } from "@/lib/text-to-speech"

export async function POST(request: NextRequest) {
  try {
    const { text, fileName } = await request.json()

    if (!text || !fileName) {
      return NextResponse.json({ error: "Text and fileName are required" }, { status: 400 })
    }

    const audioPath = await generateAudioFile(text, fileName)

    return NextResponse.json({ success: true, audioPath })
  } catch (error) {
    console.error("Error in generate-audio API route:", error)
    return NextResponse.json({ error: "Failed to generate audio file" }, { status: 500 })
  }
}
