import { pdfFileToImageBlobs } from "./receipt-pdf"

const MAX_WIDTH = 520
const MAX_HEIGHT = 1600
const JPEG_QUALITY = 0.72
const MAX_DATA_URL_CHARS = 900_000

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

/** 熱感收據を縦長のまま JPEG data URL に圧縮（落單表埋め込み用） */
export async function blobToReceiptImageDataUrl(blob: Blob): Promise<string> {
  const img = await loadImageFromBlob(blob)
  let w = img.naturalWidth || img.width
  let h = img.naturalHeight || img.height
  if (!w || !h) throw new Error("收據圖片尺寸無效")

  const scale = Math.min(1, MAX_WIDTH / w, MAX_HEIGHT / h)
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

  let quality = JPEG_QUALITY
  let dataUrl = canvas.toDataURL("image/jpeg", quality)
  while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.35) {
    quality -= 0.1
    dataUrl = canvas.toDataURL("image/jpeg", quality)
  }
  return dataUrl
}

/** 上傳檔（JPEG/PNG/PDF）→ 落單表用 data URL。PDF は第1頁。 */
export async function fileToReceiptImageDataUrl(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name)
  if (isPdf) {
    const pages = await pdfFileToImageBlobs(file)
    if (!pages[0]) throw new Error("PDF 沒有可轉換的頁面")
    return blobToReceiptImageDataUrl(pages[0])
  }
  return blobToReceiptImageDataUrl(file)
}
