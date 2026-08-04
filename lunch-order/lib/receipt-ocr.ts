import { fileToReceiptImageDataUrl, RECEIPT_IMAGE_EMBED, RECEIPT_IMAGE_OCR } from "./receipt-image"
import { parseReceiptText, type ParsedReceipt } from "./receipt-parser"

/**
 * 收據は廣東話（繁體中文）表記。
 * ブラウザ側 Tesseract は熱感レシートでほぼ失敗するため、
 * 本番読み取りは /api/receipt-ocr（Vision LLM）を使う。
 */
export const RECEIPT_OCR_LANG = "chi_tra+eng"

export type ReceiptOcrResult = {
  text: string
  parsed: ParsedReceipt
  engine: "vision" | "tesseract-fallback"
  imageDataUrl: string
  warnings: { missingDate: boolean; missingFinalPaid: boolean }
}

/** PDF→画像は receipt-pdf に分離（循環依存回避） */
export { pdfFileToImageBlobs } from "./receipt-pdf"

async function ocrViaVisionApi(imageDataUrl: string): Promise<ReceiptOcrResult> {
  const res = await fetch("/api/receipt-ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl }),
  })
  const data = (await res.json()) as {
    ok?: boolean
    error?: string
    text?: string
    parsed?: ParsedReceipt
    warnings?: { missingDate: boolean; missingFinalPaid: boolean }
  }
  if (!res.ok || !data.parsed) {
    throw new Error(data.error || `Vision OCR HTTP ${res.status}`)
  }
  return {
    text: data.text || data.parsed.rawText || "",
    parsed: data.parsed,
    engine: "vision",
    imageDataUrl,
    warnings: data.warnings ?? {
      missingDate: !data.parsed.dateKey,
      missingFinalPaid: data.parsed.finalPaid == null,
    },
  }
}

/** 最終手段のみ（ローカル／Vision 障害時）。精度は低い。 */
async function ocrViaTesseractFallback(imageDataUrl: string): Promise<ReceiptOcrResult> {
  const Tesseract = (await import("tesseract.js")).default
  const result = await Tesseract.recognize(imageDataUrl, RECEIPT_OCR_LANG, {
    logger: () => {},
  })
  const text = result.data.text ?? ""
  const parsed = parseReceiptText(text)
  return {
    text,
    parsed,
    engine: "tesseract-fallback",
    imageDataUrl,
    warnings: {
      missingDate: !parsed.dateKey,
      missingFinalPaid: parsed.finalPaid == null,
    },
  }
}

/**
 * 收據ファイルを読み取り。優先: Vision（期日・金額）。
 * imageDataUrl も返す（落單表埋め込み用に再利用）。
 */
export async function ocrReceiptFile(file: File): Promise<ReceiptOcrResult> {
  // Vision 用は高解像度、落單表埋め込み用は別途小さめを保持
  const [ocrImage, embedImage] = await Promise.all([
    fileToReceiptImageDataUrl(file, RECEIPT_IMAGE_OCR),
    fileToReceiptImageDataUrl(file, RECEIPT_IMAGE_EMBED),
  ])

  try {
    const result = await ocrViaVisionApi(ocrImage)
    return { ...result, imageDataUrl: embedImage }
  } catch (visionErr) {
    console.warn("[receipt-ocr] vision failed, trying tesseract", visionErr)
    try {
      const fallback = await ocrViaTesseractFallback(ocrImage)
      fallback.imageDataUrl = embedImage
      // Vision 失敗をユーザーが分かるよう rawText に追記
      fallback.text = `[Vision失敗→Tesseract]\n${fallback.text}\n\n(${
        visionErr instanceof Error ? visionErr.message : "vision error"
      })`
      fallback.parsed = { ...fallback.parsed, rawText: fallback.text }
      return fallback
    } catch (tessErr) {
      throw visionErr instanceof Error
        ? visionErr
        : tessErr instanceof Error
          ? tessErr
          : new Error("收據讀取失敗")
    }
  }
}
