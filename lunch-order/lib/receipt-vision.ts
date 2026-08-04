import type { ParsedReceipt, ReceiptPlatform } from "./receipt-parser"
import {
  correctReceiptDateYear,
  normalizeReceiptItemName,
  parseReceiptText,
} from "./receipt-parser"
import { getHongKongDateKey } from "./hong-kong-calendar"

export type VisionReceiptExtract = {
  dateKey: string | null
  platform: ReceiptPlatform
  restaurant: string | null
  finalPaid: number | null
  foodSubtotal: number | null
  deliveryFee: number | null
  serviceFee: number | null
  items: string[]
  discounts: string[]
  ocrText: string
}

type VisionJson = {
  dateKey?: string | null
  platform?: string | null
  restaurant?: string | null
  finalPaid?: number | null
  foodSubtotal?: number | null
  deliveryFee?: number | null
  serviceFee?: number | null
  items?: string[] | null
  discounts?: string[] | null
  visibleText?: string | null
}

async function getGatewayToken(): Promise<string> {
  if (process.env.AI_GATEWAY_API_KEY) return process.env.AI_GATEWAY_API_KEY
  try {
    const { getVercelOidcToken } = await import("@vercel/oidc")
    const token = await getVercelOidcToken()
    if (token) return token
  } catch {
    /* local may use env pull token */
  }
  if (process.env.VERCEL_OIDC_TOKEN) return process.env.VERCEL_OIDC_TOKEN
  throw new Error(
    "AI Gateway 認証がありません。Vercel デプロイ上で実行するか AI_GATEWAY_API_KEY を設定してください。",
  )
}

function normalizeDateKey(raw: string | null | undefined): string | null {
  if (!raw) return null
  const t = raw.trim()
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    const y = Number(iso[1])
    const m = Number(iso[2])
    const d = Number(iso[3])
    if (y >= 2020 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    }
  }
  // DD/MM/YYYY or DD.MM.YYYY
  const dmy = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (dmy) {
    const d = Number(dmy[1])
    const m = Number(dmy[2])
    const y = Number(dmy[3])
    if (y >= 2020 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    }
  }
  return null
}

function asMoney(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v * 100) / 100
  if (typeof v === "string") {
    const n = Number(v.replace(/[,，\s$HK]/gi, ""))
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
  }
  return null
}

function asPlatform(v: unknown): ReceiptPlatform {
  if (v === "keeta" || v === "foodpanda" || v === "unknown") return v
  return "unknown"
}

/** Vision LLM で熱感收據（繁中／廣東話）から期日・金額を抽出 */
export async function extractReceiptWithVision(imageDataUrl: string): Promise<VisionReceiptExtract> {
  if (!imageDataUrl.startsWith("data:image/")) {
    throw new Error("imageDataUrl 必須是 data:image/... 格式")
  }

  const token = await getGatewayToken()
  const hkToday = getHongKongDateKey()
  const prompt = [
    "你是香港外送收據（KeeTa / foodpanda）讀取專員。收據為繁體中文（廣東話）。",
    `今天（香港）是 ${hkToday}。收據幾乎都是近幾個月（2025–2026），年份不要讀成 2020。`,
    "【最重要】dateKey 必須是收據上清楚可見的落單／訂單日期，轉成 YYYY-MM-DD。",
    "常見格式：落單時間、DD/MM/YYYY、DD.MM.YYYY（例 02.07.2026 = 2026-07-02）、YYYY年M月D日。",
    "熱感紙常把 2026 的 6 讀成 0（變成 2020）— 請特別小心年份。",
    "看不清日期就回 dateKey: null。不要用無關的舊年份。",
    "金額看不清也回 null，不要編造。",
    "金額欄位：",
    "- finalPaid = 顧客實付（KeeTa）或 總計／總計（含增值稅）（foodpanda）",
    "- foodSubtotal = 餐點總價 或 小計",
    "- deliveryFee = 運費 / Delivery Fee",
    "- serviceFee = 平台服務費 / Service Fee",
    "platform: keeta | foodpanda | unknown",
    "items: 只列收據上可見的餐點名稱（不要亂填 餐點1）",
    "visibleText: 逐字抄錄收據上的日期行與金額行原文（含年份數字）",
  ].join("\n")

  const body = {
    model: "openai/gpt-4o-mini",
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "hk_delivery_receipt",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            dateKey: {
              type: ["string", "null"],
              description: "Order date YYYY-MM-DD from receipt only",
            },
            platform: { type: "string", enum: ["keeta", "foodpanda", "unknown"] },
            restaurant: { type: ["string", "null"] },
            finalPaid: { type: ["number", "null"] },
            foodSubtotal: { type: ["number", "null"] },
            deliveryFee: { type: ["number", "null"] },
            serviceFee: { type: ["number", "null"] },
            items: { type: "array", items: { type: "string" } },
            discounts: { type: "array", items: { type: "string" } },
            visibleText: { type: "string" },
          },
          required: [
            "dateKey",
            "platform",
            "restaurant",
            "finalPaid",
            "foodSubtotal",
            "deliveryFee",
            "serviceFee",
            "items",
            "discounts",
            "visibleText",
          ],
        },
      },
    },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
  }

  const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const raw = await res.text()
  if (!res.ok) {
    throw new Error(`Vision OCR 失敗 (${res.status}): ${raw.slice(0, 280)}`)
  }

  let content = ""
  try {
    const json = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    content = json.choices?.[0]?.message?.content ?? ""
  } catch {
    throw new Error("Vision OCR 回應格式錯誤")
  }

  let parsedJson: VisionJson
  try {
    parsedJson = JSON.parse(content) as VisionJson
  } catch {
    throw new Error(`Vision OCR JSON 解析失敗: ${content.slice(0, 200)}`)
  }

  const visibleText = String(parsedJson.visibleText ?? "")
  // 日付は Vision を優先。取れなければ visibleText / 正規表現パーサーで補完
  const fromVision = normalizeDateKey(parsedJson.dateKey ?? null)
  const fromText = parseReceiptText(visibleText)
  const rawDate = fromVision ?? fromText.dateKey
  const dateKey = correctReceiptDateYear(rawDate, hkToday)

  return {
    dateKey,
    platform: asPlatform(parsedJson.platform) !== "unknown"
      ? asPlatform(parsedJson.platform)
      : fromText.platform,
    restaurant: parsedJson.restaurant ?? fromText.restaurant,
    finalPaid: asMoney(parsedJson.finalPaid) ?? fromText.finalPaid,
    foodSubtotal: asMoney(parsedJson.foodSubtotal) ?? fromText.foodSubtotal,
    deliveryFee: asMoney(parsedJson.deliveryFee) ?? fromText.deliveryFee,
    serviceFee: asMoney(parsedJson.serviceFee) ?? fromText.serviceFee,
    items: Array.isArray(parsedJson.items) ? parsedJson.items.filter(Boolean) : [],
    discounts: Array.isArray(parsedJson.discounts) ? parsedJson.discounts.filter(Boolean) : [],
    ocrText: visibleText || content,
  }
}

export function visionExtractToParsed(extract: VisionReceiptExtract): ParsedReceipt {
  const foodSubtotal = extract.foodSubtotal
  const deliveryFee = extract.deliveryFee
  const serviceFee = extract.serviceFee
  let originalBeforeDiscount: number | null = null
  if (foodSubtotal != null) {
    originalBeforeDiscount =
      Math.round((foodSubtotal + (deliveryFee ?? 0) + (serviceFee ?? 0)) * 100) / 100
  }

  return {
    dateKey: extract.dateKey,
    platform: extract.platform,
    restaurant: extract.restaurant,
    items: extract.items.map((name) => ({
      name,
      normalizedName: normalizeReceiptItemName(name),
      price: null,
    })),
    foodSubtotal,
    deliveryFee,
    serviceFee,
    originalBeforeDiscount,
    discounts: extract.discounts.map((label) => {
      const m = label.match(/(-?\d+(?:\.\d+)?)\s*$/)
      return { label, amount: m ? -Math.abs(Number(m[1])) : 0 }
    }),
    finalPaid: extract.finalPaid,
    rawText: extract.ocrText,
  }
}
