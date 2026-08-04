import Tesseract from "tesseract.js"
import { parseReceiptText, type ParsedReceipt } from "./receipt-parser"

/**
 * 收據は廣東話（繁體中文）表記。
 * 日本語(jpn)は使わない — 誤読の原因になる。
 * chi_tra = 繁體中文、eng = 金額・Service Fee 等の英数字。
 */
export const RECEIPT_OCR_LANG = "chi_tra+eng"

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Failed to convert canvas to image"))
    }, "image/png")
  })
}

/** PDF 各ページを PNG Blob に変換（ブラウザ専用） */
export async function pdfFileToImageBlobs(file: File): Promise<Blob[]> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

  const doc = await pdfjs.getDocument({ data }).promise
  const blobs: Blob[] = []

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unavailable")
    await page.render({ canvasContext: ctx, viewport }).promise
    blobs.push(await canvasToBlob(canvas))
  }

  return blobs
}

export async function ocrImageSource(source: File | Blob): Promise<string> {
  const result = await Tesseract.recognize(source, RECEIPT_OCR_LANG, {
    // 明示的に繁體中文優先（jpn は含めない）
    logger: () => {},
  })
  return result.data.text ?? ""
}

export async function ocrReceiptFile(file: File): Promise<{ text: string; parsed: ParsedReceipt }> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name)
  let text = ""

  if (isPdf) {
    const pages = await pdfFileToImageBlobs(file)
    const parts: string[] = []
    for (const page of pages) {
      parts.push(await ocrImageSource(page))
    }
    text = parts.join("\n")
  } else {
    text = await ocrImageSource(file)
  }

  return { text, parsed: parseReceiptText(text) }
}
