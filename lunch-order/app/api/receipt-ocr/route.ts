import { NextResponse } from "next/server"
import { extractReceiptWithVision, visionExtractToParsed } from "@/lib/receipt-vision"

export const runtime = "nodejs"
export const maxDuration = 60

type Body = {
  imageDataUrl?: string
}

/**
 * 熱感收據 Vision OCR（繁體中文／廣東話）
 * - 期日は收據画像から必須で読み取る（今日の日付で埋めない）
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const imageDataUrl = body.imageDataUrl
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json({ error: "imageDataUrl が必要です" }, { status: 400 })
    }
    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "imageDataUrl 形式が不正です" }, { status: 400 })
    }
    // 过大 payload を拒否（約 1.2MB data URL）
    if (imageDataUrl.length > 1_600_000) {
      return NextResponse.json({ error: "圖片過大，請壓縮後再試" }, { status: 413 })
    }

    const extract = await extractReceiptWithVision(imageDataUrl)
    const parsed = visionExtractToParsed(extract)

    return NextResponse.json({
      ok: true,
      engine: "vision",
      text: extract.ocrText,
      parsed,
      warnings: {
        missingDate: !parsed.dateKey,
        missingFinalPaid: parsed.finalPaid == null,
      },
    })
  } catch (err) {
    console.error("[receipt-ocr]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "收據讀取失敗" },
      { status: 500 },
    )
  }
}
