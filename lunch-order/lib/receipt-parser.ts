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
  /** 元の金額（餐點總價 / 小計） */
  foodSubtotal: number | null
  deliveryFee: number | null
  serviceFee: number | null
  /** 割引前の合計（餐點+運費+服務費） */
  originalBeforeDiscount: number | null
  discounts: ReceiptDiscountLine[]
  /** 割引後の最終支払額（顧客實付 / 總計） */
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
  originalBeforeDiscount?: number | null
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

/** Apple Vision / 熱感レシートの誤字を補正 */
export function normalizeOcrNoise(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/顧客[竇实実實]付/g, "顧客實付")
    .replace(/餐點[矮縂經总總]價/g, "餐點總價")
    .replace(/餐點[矮縂經总總]价/g, "餐點總價")
    .replace(/Service\s*[Ff]ee/g, "Service Fee")
    .replace(/Delivery\s*[Ff]ee/g, "Delivery Fee")
    .replace(/平台[股股服]務費/g, "平台服務費")
    .replace(/運[登費费]/g, "運費")
    .replace(/洛[审審]時間/g, "落單時間")
    .replace(/落[审審]時間/g, "落單時間")
    .replace(/減建費/g, "減運費")
    .replace(/總計\s*[（(]含增值稅[）)]/g, "總計（含增值稅）")
    .replace(/小計金額/g, "小計金額")
    .replace(/合計付款/g, "合計付款")
}

function parseMoneyToken(raw: string): number | null {
  const cleaned = raw.replace(/[,，\s]/g, "").replace(/HK\$/gi, "").replace(/\$/g, "")
  if (!cleaned || cleaned === "-" || cleaned === "--" || cleaned === "—") return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

/**
 * ラベル行の直後の行に金額がある Vision OCR パターンにも対応
 * e.g. "顧客實付\n$178.50" / "餐點總價\n214.00"
 */
function findLabeledAmount(text: string, labels: RegExp[]): number | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const label of labels) {
      if (!label.test(line)) continue
      const same = line.match(
        new RegExp(`${label.source}\\s*[:：]?\\s*(?:HK\\s*)?\\$?\\s*(-?[\\d,]+(?:\\.\\d+)?)`, "i"),
      )
      if (same) {
        const v = parseMoneyToken(same[1])
        if (v != null) return v
      }
      // next non-empty line
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const next = lines[j]
        if (!next) continue
        const m = next.match(/^(?:HK\s*)?\$?\s*(-?[\d,]+(?:\.\d+)?)\s*$/i)
        if (m) {
          const v = parseMoneyToken(m[1])
          if (v != null) return v
        }
        break
      }
    }
  }

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
  if (/顧客實付|餐點總價|平台服務費/.test(text) || /keeta|kee\s*ta/.test(lower)) {
    if (/顧客實付/.test(text) || /keeta|kee\s*ta/.test(lower)) return "keeta"
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
    { re: /(\d{4})[年/.\-](\d{1,2})[月/.\-](\d{1,2})/, y: 1, m: 2, d: 3 },
    { re: /落單時間\s*(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})/, y: 3, m: 2, d: 1 },
    { re: /(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})\s*\d{1,2}[:：]\d{2}/, y: 3, m: 2, d: 1 },
    { re: /(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})/, y: 3, m: 2, d: 1 },
    { re: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, y: 3, m: 2, d: 1 },
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

  // glued: 02/07/202610.35
  const glued = text.match(/(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})(\d{2})[.：:]\d{2}/)
  if (glued) {
    const year = Number(glued[3])
    const month = Number(glued[2])
    const day = Number(glued[1])
    if (year >= 2020 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }
  }

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
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!/(折|減運費|優惠|discount|coupon|減\$)/i.test(line)) continue
    if (/顧客實付|總計|餐點總價|小計|運費|服務費|平台/.test(line) && !/(折|減運費|優惠)/.test(line)) {
      continue
    }
    let amount: number | null = null
    const inline = line.match(/(-)\s*\$?\s*([\d,]+(?:\.\d+)?)/) || line.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*$/)
    if (inline) {
      amount = parseMoneyToken(inline[inline.length - 1])
      if (amount != null) amount = -Math.abs(amount)
    }
    if (amount == null || amount === 0) {
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const m = lines[j].match(/^(?:-)?\s*\$?\s*([\d,]+(?:\.\d+)?)\s*$/)
        if (m) {
          amount = -Math.abs(parseMoneyToken(m[1]) ?? 0)
          break
        }
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
    /^(數量|商品|原價|小計|餐點|運費|平台|服務|顧客|總計|折扣|優惠|訂單|落單|謝謝|外送|預計|Delivery|Service|VAT|評分|付款|已付款|滿\$)/i

  for (const line of lines) {
    if (skip.test(line)) continue
    if (/無需餐具|不用加配|需要餐具/.test(line) && !/\$?\d/.test(line)) continue

    const m = line.match(/^(?:\d+\s*[xX×]\s*)?(.+?)\s+(?:HK\$|\$)?\s*([\d,]+(?:\.\d+)?)\s*$/)
    if (!m) continue
    const name = m[1]
      .replace(/^[\d.]+\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
    if (name.length < 2 || name.length > 60) continue
    if (/^(運費|平台|服務|小計|總計|顧客|滿)/.test(name)) continue
    const price = parseMoneyToken(m[2])
    items.push({
      name,
      normalizedName: normalizeReceiptItemName(name),
      price,
    })
  }
  return items
}

/** 領収書の支払額として妥当か（注文番号の誤検出を除外） */
function isPlausiblePaidAmount(value: number): boolean {
  return value >= 20 && value <= 800
}

/**
 * ラベル行の後続に並ぶ金額から最終支払額を選ぶ。
 * 割引行（負数）や運費単独を避け、20〜800 の最後の正数を優先。
 */
function amountAfterLabelBlock(text: string, label: RegExp): number | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  for (let i = 0; i < lines.length; i++) {
    if (!label.test(lines[i])) continue
    const sameLine = lines[i].match(/(?:HK\s*)?\$?\s*(-?[\d,]+(?:\.\d+)?)\s*$/i)
    const candidates: number[] = []
    if (sameLine) {
      const v = parseMoneyToken(sameLine[1])
      if (v != null && v > 0 && isPlausiblePaidAmount(v)) candidates.push(v)
    }
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
      const line = lines[j]
      if (!line) continue
      if (/商戶|送遞|謝謝|Partners|評分|訂單編號|落單時間|當面|程式/.test(line)) break
      const money = [...line.matchAll(/(?:HK\s*)?\$?\s*(-?[\d,]+(?:\.\d+)?)/gi)]
      for (const m of money) {
        const v = parseMoneyToken(m[1])
        if (v == null) continue
        if (v < 0) continue // 割引行はスキップ
        if (isPlausiblePaidAmount(v)) candidates.push(v)
      }
    }
    if (candidates.length > 0) return candidates[candidates.length - 1]
  }
  return null
}

function extractFinalPaid(text: string, _platform: ReceiptPlatform): number | null {
  const keeta = amountAfterLabelBlock(text, /顧客實付/)
  if (keeta != null) return keeta

  const fpVat = amountAfterLabelBlock(text, /總計（含增值稅）/)
  if (fpVat != null) return fpVat

  // foodpanda: 「總計」ブロックの最後の妥当額（小計・運費の後に来る）
  const totalBlock = amountAfterLabelBlock(text, /^總計$|總計\s*$|總計\s*[:：]/)
  if (totalBlock != null) return totalBlock

  const paid = amountAfterLabelBlock(text, /合計付款|實付金額|Paid\s*Amount/i)
  if (paid != null) return paid

  return null
}

export function parseReceiptText(rawText: string): ParsedReceipt {
  const text = normalizeOcrNoise(rawText.replace(/[ \t]+/g, " "))
  const platform = detectPlatform(text)
  const dateKey = extractDateKey(text)
  const restaurant = extractRestaurant(text)
  const foodSubtotal = findLabeledAmount(text, [/餐點總價/, /小計金額/, /小計(?!金額的)/])
  const deliveryFee = findLabeledAmount(text, [/運費/, /Delivery\s*Fee/i])
  const serviceFee = findLabeledAmount(text, [/平台服務費/, /平台費/, /Service\s*Fee/i])
  const discounts = extractDiscounts(text)
  const items = extractItems(text)
  const finalPaid = extractFinalPaid(text, platform)

  let originalBeforeDiscount: number | null = null
  if (foodSubtotal != null) {
    originalBeforeDiscount =
      foodSubtotal + (deliveryFee ?? 0) + (serviceFee ?? 0)
    originalBeforeDiscount = Math.round(originalBeforeDiscount * 100) / 100
  }

  return {
    dateKey,
    platform,
    restaurant,
    items,
    foodSubtotal,
    deliveryFee,
    serviceFee,
    originalBeforeDiscount,
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
