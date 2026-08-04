export type ReceiptPlatform = "keeta" | "foodpanda" | "unknown"

export type ReceiptDiscountLine = {
  label: string
  amount: number
}

export type ReceiptParsedItem = {
  name: string
  normalizedName: string
  price: number | null
}

export type ParsedReceipt = {
  dateKey: string | null
  platform: ReceiptPlatform
  restaurant: string | null
  items: ReceiptParsedItem[]
  foodSubtotal: number | null
  deliveryFee: number | null
  serviceFee: number | null
  discounts: ReceiptDiscountLine[]
  finalPaid: number | null
  rawText: string
}

export type FoodpandaReceiptRecord = {
  dateKey: string
  platform: ReceiptPlatform
  finalPaid: number
  foodSubtotal: number | null
  deliveryFee: number | null
  serviceFee: number | null
  discounts: ReceiptDiscountLine[]
  items: ReceiptParsedItem[]
  sourceFileName: string
  updatedAt: string
}

export const META_FP_RECEIPT_PREFIX = "meta-fp-receipt-"
export const META_FP_RECEIPT_DRINK = "__meta_fp_receipt__"

export function receiptMemberId(dateKey: string): string {
  return `${META_FP_RECEIPT_PREFIX}${dateKey}`
}

export function isFpReceiptRow(row: { member_id: string; drink?: string }): boolean {
  return row.drink === META_FP_RECEIPT_DRINK || row.member_id.startsWith(META_FP_RECEIPT_PREFIX)
}

/** 套餐・括弧などを落として照合用キーにする */
export function normalizeReceiptItemName(name: string): string {
  return name
    .replace(/\s+/g, "")
    .replace(/[-－—]/g, "")
    .replace(/套餐/g, "")
    .replace(/[（(].*?[）)]/g, "")
    .replace(/配煎蛋/g, "")
    .trim()
}

function parseMoneyToken(raw: string): number | null {
  const cleaned = raw.replace(/[,，\s]/g, "").replace(/HK\$/gi, "").replace(/\$/g, "")
  if (!cleaned || cleaned === "-" || cleaned === "--" || cleaned === "—") return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function findLabeledAmount(text: string, labels: RegExp[]): number | null {
  for (const label of labels) {
    const re = new RegExp(
      `${label.source}\\s*[:：]?\\s*(?:HK\\s*)?\\$?\\s*(-?[\\d,]+(?:\\.\\d+)?)`,
      "i",
    )
    const m = text.match(re)
    if (m) {
      const value = parseMoneyToken(m[1])
      if (value != null) return value
    }
  }
  return null
}

function detectPlatform(text: string): ReceiptPlatform {
  const lower = text.toLowerCase()
  if (/keeta|kee\s*ta|顧客實付|餐點總價|平台服務費/.test(text) || /keeta/.test(lower)) {
    if (/foodpanda|熊貓/.test(text) || /foodpanda/.test(lower)) {
      // both keywords rare; prefer keeta markers for 顧客實付
      if (/顧客實付/.test(text)) return "keeta"
    } else {
      return "keeta"
    }
  }
  if (/foodpanda|熊貓|總計（含增值稅）|與最低消費|service fee|delivery fee/i.test(text)) {
    return "foodpanda"
  }
  if (/總計/.test(text) && /小計/.test(text)) return "foodpanda"
  if (/顧客實付/.test(text)) return "keeta"
  return "unknown"
}

function extractDateKey(text: string): string | null {
  const patterns: Array<{ re: RegExp; y: number; m: number; d: number }> = [
    { re: /(\d{4})[年/.\\-](\d{1,2})[月/.\\-](\d{1,2})/, y: 1, m: 2, d: 3 },
    { re: /(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})/, y: 3, m: 2, d: 1 }, // DD/MM/YYYY (HK)
    { re: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, y: 3, m: 2, d: 1 },
    { re: /落單時間\s*(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})/, y: 3, m: 2, d: 1 },
  ]

  for (const p of patterns) {
    const m = text.match(p.re)
    if (!m) continue
    const year = Number(m[p.y])
    const month = Number(m[p.m])
    const day = Number(m[p.d])
    if (year < 2020 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) continue
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  // MM.DD.YYYY ambiguous already covered; try YYYY-MM-DD ISO
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return null
}

function extractRestaurant(text: string): string | null {
  const m = text.match(/味千拉麵[^\n]{0,40}/)
  return m ? m[0].trim() : null
}

function extractDiscounts(text: string): ReceiptDiscountLine[] {
  const lines = text.split(/\r?\n/)
  const discounts: ReceiptDiscountLine[] = []
  for (const line of lines) {
    if (!/(折|減運費|優惠|discount|coupon|減\$)/i.test(line)) continue
    if (/顧客實付|總計|餐點總價|小計|運費|服務費|平台/.test(line) && !/(折|減運費|優惠)/.test(line)) continue
    const amountMatch = line.match(/-?\s*\$?\s*([\d,]+(?:\.\d+)?)\s*$/)
    const inline = line.match(/(-)\s*\$?\s*([\d,]+(?:\.\d+)?)/)
    let amount: number | null = null
    if (inline) {
      amount = parseMoneyToken(inline[2])
      if (amount != null) amount = -Math.abs(amount)
    } else if (amountMatch) {
      amount = parseMoneyToken(amountMatch[1])
      if (amount != null && /(折|減|優惠|discount|coupon)/i.test(line)) {
        amount = -Math.abs(amount)
      }
    }
    if (amount == null || amount >= 0) continue
    discounts.push({ label: line.replace(/\s+/g, " ").trim(), amount })
  }
  return discounts
}

function extractItems(text: string): ReceiptParsedItem[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const items: ReceiptParsedItem[] = []
  const skip =
    /^(數量|商品|原價|小計|餐點|運費|平台|服務|顧客|總計|折扣|優惠|訂單|落單|謝謝|外送|預計|Delivery|Service|VAT|評分|付款|已付款)/i

  for (const line of lines) {
    if (skip.test(line)) continue
    if (/無需餐具|不用加配|需要餐具/.test(line)) continue

    // 1x 關東煮-套餐 40.00  /  1 x 關東煮 $40.00
    const m = line.match(/^(?:\d+\s*[xX×]\s*)?(.+?)\s+(?:HK\$|\$)?\s*([\d,]+(?:\.\d+)?)\s*$/)
    if (!m) continue
    const name = m[1]
      .replace(/^[\d.]+\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
    if (name.length < 2 || name.length > 60) continue
    if (/^(運費|平台|服務|小計|總計|顧客)/.test(name)) continue
    const price = parseMoneyToken(m[2])
    // skip tiny modifier-only lines that look like drinks alone if needed — keep drinks as items for matching soft
    items.push({
      name,
      normalizedName: normalizeReceiptItemName(name),
      price,
    })
  }
  return items
}

function extractFinalPaid(text: string, platform: ReceiptPlatform): number | null {
  const keeta = findLabeledAmount(text, [/顧客實付/, /顧客實付金額/])
  if (keeta != null) return keeta

  const fpVat = findLabeledAmount(text, [/總計（含增值稅）/, /總計\(含增值稅\)/, /總計\s*\(含稅\)/])
  if (fpVat != null) return fpVat

  // Prefer last "總計" that isn't a subtotal line
  const totals = [
    ...text.matchAll(/總計(?:（含增值稅）)?\s*[:：]?\s*(?:HK\s*)?\$?\s*([\d,]+(?:\.\d+)?)/gi),
  ]
  if (totals.length > 0) {
    const value = parseMoneyToken(totals[totals.length - 1][1])
    if (value != null) return value
  }

  // Same-line or next-token patterns after OCR noise
  const looseKeeta = text.match(/顧客實付[^\d-]{0,12}([\d,]+(?:\.\d+)?)/)
  if (looseKeeta) {
    const value = parseMoneyToken(looseKeeta[1])
    if (value != null) return value
  }

  const paid = findLabeledAmount(text, [/合計付款/, /實付金額/, /Paid\s*Amount/i])
  if (paid != null) return paid
  if (platform === "foodpanda") {
    return findLabeledAmount(text, [/\bTotal\b/i])
  }
  return null
}

export function parseReceiptText(rawText: string): ParsedReceipt {
  const text = rawText.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ")
  const platform = detectPlatform(text)
  const dateKey = extractDateKey(text)
  const restaurant = extractRestaurant(text)
  const foodSubtotal = findLabeledAmount(text, [/餐點總價/, /小計金額/, /小計(?!金額的)/])
  const deliveryFee = findLabeledAmount(text, [/運費/, /Delivery\s*Fee/i])
  const serviceFee = findLabeledAmount(text, [/平台服務費/, /平台費/, /Service\s*Fee/i])
  const discounts = extractDiscounts(text)
  const items = extractItems(text)
  const finalPaid = extractFinalPaid(text, platform)

  return {
    dateKey,
    platform,
    restaurant,
    items,
    foodSubtotal,
    deliveryFee,
    serviceFee,
    discounts,
    finalPaid,
    rawText: text,
  }
}

export type ReceiptMatchResult = {
  matched: string[]
  missingInReceipt: string[]
  extraInReceipt: string[]
  orderCount: number
  receiptMealCount: number
}

/** 当日 foodpanda 注文の dish 名とレシート品目を突合 */
export function matchReceiptToOrders(
  receiptItems: ReceiptParsedItem[],
  orderDishes: string[],
): ReceiptMatchResult {
  const drinkLike = /可樂|雪碧|檸|奶茶|果汁|提子|薑茶|茉莉|蘇打|忌廉|零系|蘋果|烏冬|拉麵|加配|迷你|丹麥/
  const receiptMeals = receiptItems
    .map((i) => i.normalizedName)
    .filter((n) => n && !drinkLike.test(n) && n !== "無需餐具")

  const orderNorms = orderDishes.map(normalizeReceiptItemName).filter(Boolean)

  const receiptBag = new Map<string, number>()
  for (const n of receiptMeals) receiptBag.set(n, (receiptBag.get(n) ?? 0) + 1)
  const orderBag = new Map<string, number>()
  for (const n of orderNorms) orderBag.set(n, (orderBag.get(n) ?? 0) + 1)

  const matched: string[] = []
  const missingInReceipt: string[] = []
  const extraInReceipt: string[] = []

  const keys = new Set([...receiptBag.keys(), ...orderBag.keys()])
  for (const key of keys) {
    const r = receiptBag.get(key) ?? 0
    const o = orderBag.get(key) ?? 0
    const common = Math.min(r, o)
    for (let i = 0; i < common; i++) matched.push(key)
    for (let i = 0; i < o - r; i++) missingInReceipt.push(key)
    for (let i = 0; i < r - o; i++) extraInReceipt.push(key)
  }

  return {
    matched,
    missingInReceipt,
    extraInReceipt,
    orderCount: orderNorms.length,
    receiptMealCount: receiptMeals.length,
  }
}

export function parseFpReceiptRecord(dishJson: string): FoodpandaReceiptRecord | null {
  try {
    const parsed = JSON.parse(dishJson) as FoodpandaReceiptRecord
    if (!parsed?.dateKey || typeof parsed.finalPaid !== "number") return null
    return parsed
  } catch {
    return null
  }
}
