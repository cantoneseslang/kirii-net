import { NextResponse } from "next/server"
import { getMemberTodayOrder } from "@/lib/member-today-order"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = String(searchParams.get("member_id") || "").trim()
    if (!memberId) {
      return NextResponse.json(
        { success: false, message: "member_id is required" },
        { status: 400, headers: CORS_HEADERS },
      )
    }

    const data = await getMemberTodayOrder(memberId)
    return NextResponse.json({ success: true, data }, { headers: CORS_HEADERS })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load today order",
      },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}
