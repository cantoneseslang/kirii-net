import { FOODPANDA_RESTAURANT } from "../data/foodpanda-menu"
import { getHongKongDateKey, getHongKongDayRange } from "./hong-kong-calendar"
import {
  isFpReceiptRow,
  parseFpReceiptRecord,
  type FoodpandaReceiptRecord,
} from "./receipt-parser"
import type { FoodpandaOrder, Order } from "../types"

export const TINGKOK_MEAL_PRICE = 35

const META_FP_PREFIX = "meta-fp-"
const META_FP_DRINK = "__meta_fp__"
const META_AUDIT_DRINK = "__meta_audit__"
const META_EMPLOYEE_PREFIX = "meta-employee-"
const META_MENU_PREFIX = "meta-menu-"
const META_AUDIT_PREFIX = "meta-audit-"

export type ReimbursementDayRow = {
  dateKey: string
  day: number
  label: string
  isSunday: boolean
  amountA: number
  amountB: number
  /** 收據掃描の最終支払額で上書きしたか */
  amountBFromReceipt: boolean
}

export type ReimbursementMonthReport = {
  year: number
  month: number
  days: ReimbursementDayRow[]
  totalA: number
  totalB: number
  grandTotal: number
}

type OrderLikeRow = {
  id?: string
  member_id: string
  member_name?: string
  dish: string
  drink?: string
  timestamp: string
  operator_member_id?: string | null
  operator_member_name?: string | null
}

export function isFpOrderRow(row: { member_id: string; drink?: string }): boolean {
  if (isFpReceiptRow(row)) return false
  return row.drink === META_FP_DRINK || row.member_id.startsWith(META_FP_PREFIX)
}

export function isMetaOrFpRow(memberId: string, drink?: string): boolean {
  if (drink === META_FP_DRINK || drink === META_AUDIT_DRINK) return true
  if (isFpReceiptRow({ member_id: memberId, drink })) return true
  if (memberId.startsWith(META_AUDIT_PREFIX)) return true
  return (
    memberId.startsWith(META_EMPLOYEE_PREFIX) ||
    memberId.startsWith(META_MENU_PREFIX) ||
    memberId.startsWith(META_FP_PREFIX)
  )
}

export function listCalendarMonthDateKeys(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const keys: string[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    keys.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
  }
  return keys
}

/** 香港暦月の UTC 範囲（to は末日翌日 00:00 HK = exclusive） */
export function getHongKongMonthRange(year: number, month: number): { from: string; to: string; dateKeys: string[] } {
  const dateKeys = listCalendarMonthDateKeys(year, month)
  const { from } = getHongKongDayRange(dateKeys[0])
  const { to } = getHongKongDayRange(dateKeys[dateKeys.length - 1])
  return { from, to, dateKeys }
}

export function isSundayHongKongDateKey(dateKey: string): boolean {
  const [y, m, d] = dateKey.split("-").map(Number)
  const noonHk = new Date(Date.UTC(y, m - 1, d, 4, 0, 0))
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    weekday: "short",
  }).format(noonHk)
  return weekday === "Sun"
}

function findFoodpandaDishPrice(name: string): number {
  for (const category of FOODPANDA_RESTAURANT.menu) {
    const item = category.items.find((entry) => entry.name === name)
    if (item) return item.price
  }
  return 0
}

function findFoodpandaDrinkPrice(name: string): number {
  for (const category of FOODPANDA_RESTAURANT.drinks) {
    const item = category.items.find((entry) => entry.name === name)
    if (item) return item.price
  }
  return 0
}

function findFoodpandaNoodleExtra(name: string): number {
  return FOODPANDA_RESTAURANT.noodleOptions.find((opt) => opt.name === name)?.extraPrice ?? 0
}

function findFoodpandaAddOnExtra(name: string): number {
  return FOODPANDA_RESTAURANT.addOns.find((opt) => opt.name === name)?.extraPrice ?? 0
}

/** 1件の foodpanda 注文金額（配送料は含まない） */
export function calculateFoodpandaOrderAmount(order: FoodpandaOrder): number {
  const dish = findFoodpandaDishPrice(order.dish)
  const noodle = findFoodpandaNoodleExtra(order.noodle)
  const addOns = (order.addOns ?? []).reduce((sum, name) => sum + findFoodpandaAddOnExtra(name), 0)
  const drink = findFoodpandaDrinkPrice(order.drink)
  return dish + noodle + addOns + drink
}

/** 汀角路: 定食1件 = $35（飲品のみは $0） */
export function calculateTingkokDayAmount(orders: Order[]): number {
  return orders.filter((order) => order.dish && order.dish !== "未選擇").length * TINGKOK_MEAL_PRICE
}

/** その日の foodpanda 合計（注文金額 + 1件以上あれば配送料1回） */
export function calculateFoodpandaDayAmount(orders: FoodpandaOrder[]): number {
  if (orders.length === 0) return 0
  const itemsTotal = orders.reduce((sum, order) => sum + calculateFoodpandaOrderAmount(order), 0)
  return itemsTotal + FOODPANDA_RESTAURANT.deliveryFee
}

export function parseFoodpandaOrderFromRow(row: OrderLikeRow): FoodpandaOrder | null {
  try {
    const parsed = JSON.parse(row.dish) as FoodpandaOrder
    const memberId =
      parsed?.member_id ??
      (row.member_id.startsWith(META_FP_PREFIX) ? row.member_id.slice(META_FP_PREFIX.length) : row.member_id)
    if (!memberId) return null
    return {
      ...parsed,
      id: row.id ?? parsed.id,
      member_id: String(memberId),
      member_name: parsed.member_name ?? row.member_name ?? "",
      timestamp: parsed.timestamp ?? row.timestamp,
      addOns: parsed.addOns ?? [],
      noodle: parsed.noodle ?? "",
      drink: parsed.drink ?? "",
      dish: parsed.dish ?? "",
      operator_member_id:
        row.operator_member_id != null
          ? String(row.operator_member_id)
          : parsed.operator_member_id != null
            ? String(parsed.operator_member_id)
            : null,
      operator_member_name: row.operator_member_name ?? parsed.operator_member_name ?? null,
    }
  } catch {
    return null
  }
}

export function buildReimbursementMonthReport(
  year: number,
  month: number,
  tingkokByDate: Record<string, Order[]>,
  foodpandaByDate: Record<string, FoodpandaOrder[]>,
  receiptByDate: Record<string, FoodpandaReceiptRecord> = {},
): ReimbursementMonthReport {
  const dateKeys = listCalendarMonthDateKeys(year, month)
  const days: ReimbursementDayRow[] = dateKeys.map((dateKey) => {
    const day = Number(dateKey.slice(-2))
    const isSunday = isSundayHongKongDateKey(dateKey)
    const amountA = calculateTingkokDayAmount(tingkokByDate[dateKey] ?? [])
    const receipt = receiptByDate[dateKey]
    const amountBFromReceipt = receipt != null && Number.isFinite(receipt.finalPaid)
    const amountB = amountBFromReceipt
      ? receipt.finalPaid
      : calculateFoodpandaDayAmount(foodpandaByDate[dateKey] ?? [])
    return {
      dateKey,
      day,
      label: isSunday ? `${day}(日)` : String(day),
      isSunday,
      amountA,
      amountB,
      amountBFromReceipt,
    }
  })

  const totalA = days.reduce((sum, row) => sum + row.amountA, 0)
  const totalB = days.reduce((sum, row) => sum + row.amountB, 0)

  return {
    year,
    month,
    days,
    totalA,
    totalB,
    grandTotal: totalA + totalB,
  }
}

/** 生の orders 行を日別 tingkok / foodpanda / 收據 に振り分け */
export function groupOrdersForReimbursement(
  rows: OrderLikeRow[],
  dateKeys: string[],
): {
  tingkokByDate: Record<string, Order[]>
  foodpandaByDate: Record<string, FoodpandaOrder[]>
  receiptByDate: Record<string, FoodpandaReceiptRecord>
} {
  const dateKeySet = new Set(dateKeys)
  const tingkokByDate: Record<string, Order[]> = {}
  const foodpandaByDate: Record<string, FoodpandaOrder[]> = {}
  const receiptByDate: Record<string, FoodpandaReceiptRecord> = {}
  for (const key of dateKeys) {
    tingkokByDate[key] = []
    foodpandaByDate[key] = []
  }

  const seenFpIds = new Set<string>()

  for (const row of rows) {
    if (isFpReceiptRow(row)) {
      const record = parseFpReceiptRecord(row.dish)
      if (!record) continue
      if (!dateKeySet.has(record.dateKey)) continue
      receiptByDate[record.dateKey] = record
      continue
    }

    if (isFpOrderRow(row)) {
      const order = parseFoodpandaOrderFromRow(row)
      if (!order) continue
      const dateKey = getHongKongDateKey(new Date(order.timestamp))
      if (!dateKeySet.has(dateKey)) continue
      const dedupeKey = order.id || `${order.member_id}-${order.timestamp}-${order.dish}`
      if (seenFpIds.has(dedupeKey)) continue
      seenFpIds.add(dedupeKey)
      foodpandaByDate[dateKey].push(order)
      continue
    }

    if (isMetaOrFpRow(row.member_id, row.drink)) continue

    const dateKey = getHongKongDateKey(new Date(row.timestamp))
    if (!dateKeySet.has(dateKey)) continue
    tingkokByDate[dateKey].push({
      id: row.id ?? `${row.member_id}-${row.timestamp}`,
      member_id: String(row.member_id),
      member_name: row.member_name ?? "",
      dish: row.dish,
      drink: row.drink ?? "未選擇",
      timestamp: row.timestamp,
      operator_member_id: row.operator_member_id != null ? String(row.operator_member_id) : null,
      operator_member_name: row.operator_member_name ?? null,
    })
  }

  return { tingkokByDate, foodpandaByDate, receiptByDate }
}

/** 小数第2位以下を切り上げて小数1桁にする（3396.76 → 3396.8） */
export function roundUpToOneDecimal(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.ceil(value * 10 - Number.EPSILON) / 10
}

/** 日別金額表示（最大小数2桁、整数は .0） */
export function formatReimbursementAmount(value: number): string {
  const rounded = Math.round(value * 100) / 100
  if (Number.isInteger(rounded)) return rounded.toFixed(1)
  return String(rounded)
}

/** 共 / 合共 用：小数1桁へ切り上げ */
export function formatReimbursementTotal(value: number): string {
  return roundUpToOneDecimal(value).toFixed(1)
}
