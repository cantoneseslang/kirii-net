import { NextResponse } from "next/server"

export async function GET() {
  // サーバーサイドでのみAPIキーにアクセス
  // 注意: 実際のAPIキーは返さず、マップが利用可能かどうかの情報のみを返す
  const hasApiKey = !!process.env.GOOGLE_MAPS_API_KEY

  return NextResponse.json({
    isAvailable: hasApiKey,
    // APIキー自体は返さない
  })
}
