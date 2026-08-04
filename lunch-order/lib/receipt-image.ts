import { pdfFileToImageBlobs } from "./receipt-pdf"

export type ReceiptImageOptions = {
  maxWidth: number
  maxHeight: number
  jpegQuality: number
  maxDataUrlChars: number
}

/** 落單表右側埋め込み用（小さめ） */
export const RECEIPT_IMAGE_EMBED: ReceiptImageOptions = {
  maxWidth: 520,
  maxHeight: 1600,
  jpegQuality: 0.72,
  maxDataUrlChars: 900_000,
}

/** Vision OCR 用（期日・金額を落とさないよう解像度を確保） */
export const RECEIPT_IMAGE_OCR: ReceiptImageOptions = {
  maxWidth: 1200,
  maxHeight: 2400,
  jpegQuality: 0.88,
  maxDataUrlChars: 1_400_000,
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("收據圖片載入失敗"))
    }
    img.src = url
  })
}

/** 熱感收據を縦長のまま JPEG data URL に圧縮 */
export async function blobToReceiptImageDataUrl(
  blob: Blob,
  options: ReceiptImageOptions = RECEIPT_IMAGE_EMBED,
): Promise<string> {
  const img = await loadImageFromBlob(blob)
  let w = img.naturalWidth || img.width
  let h = img.naturalHeight || img.height
  if (!w || !h) throw new Error("收據圖片尺寸無效")

  const scale = Math.min(1, options.maxWidth / w, options.maxHeight / h)
  w = Math.max(1, Math.round(w * scale))
  h = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)

  let quality = options.jpegQuality
  let dataUrl = canvas.toDataURL("image/jpeg", quality)
  while (dataUrl.length > options.maxDataUrlChars && quality > 0.45) {
    quality -= 0.08
    dataUrl = canvas.toDataURL("image/jpeg", quality)
  }
  return dataUrl
}

/** 上傳檔（JPEG/PNG/PDF）→ data URL。PDF は第1頁。 */
export async function fileToReceiptImageDataUrl(
  file: File,
  options: ReceiptImageOptions = RECEIPT_IMAGE_EMBED,
): Promise<string> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name)
  if (isPdf) {
    const pages = await pdfFileToImageBlobs(file)
    if (!pages[0]) throw new Error("PDF 沒有可轉換的頁面")
    return blobToReceiptImageDataUrl(pages[0], options)
  }
  return blobToReceiptImageDataUrl(file, options)
}
