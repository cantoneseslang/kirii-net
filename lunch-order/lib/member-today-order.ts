import { createClient } from "@supabase/supabase-js"
import { getHongKongDateKey, getHongKongDayRange } from "@/lib/hong-kong-calendar"
import type { FoodpandaOrder, Order } from "@/types"

const META_EMPLOYEE_PREFIX = "meta-employee-"
const META_MENU_PREFIX = "meta-menu-"
const META_FP_PREFIX = "meta-fp-"
const META_FP_DRINK = "__meta_fp__"
const META_AUDIT_PREFIX = "meta-audit-"
const META_AUDIT_DRINK = "__meta_audit__"

type OrderRow = {
  id: string
  member_id: string
  member_name: string
  dish: string
  drink: string
  timestamp: string
}

export type MemberTodayOrderLine = {
  label: string
  quantity: number
}

export type MemberTodayOrderSection = {
  category: string
  items: MemberTodayOrderLine[]
}

export type MemberTodayOrderResult = {
  dateKey: string
  memberId: string
  memberName: string | null
  hasOrder: boolean
  channel: "tingkok" | "foodpanda" | null
  sections: MemberTodayOrderSection[]
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

function isMetaRow(memberId: string, drink?: string) {
  if (drink === META_FP_DRINK || drink === META_AUDIT_DRINK) return true
  if (memberId.startsWith(META_AUDIT_PREFIX)) return true
  return (
    memberId.startsWith(META_EMPLOYEE_PREFIX) ||
    memberId.startsWith(META_MENU_PREFIX) ||
    memberId.startsWith(META_FP_PREFIX)
  )
}

function isFpOrderRow(row: { member_id: string; drink?: string }) {
  return row.drink === META_FP_DRINK || row.member_id.startsWith(META_FP_PREFIX)
}

function foodpandaOrderFromRow(row: OrderRow): FoodpandaOrder | null {
  try {
    const parsed = JSON.parse(row.dish) as FoodpandaOrder
    const memberId = parsed?.member_id ?? row.member_id.replace(META_FP_PREFIX, "")
    if (!memberId) return null
    return {
      ...parsed,
      id: row.id ?? parsed.id,
      member_id: memberId,
      member_name: parsed.member_name ?? row.member_name ?? "",
      timestamp: parsed.timestamp ?? row.timestamp,
      addOns: parsed.addOns ?? [],
    }
  } catch {
    return null
  }
}

function formatFpDishLine(order: FoodpandaOrder): string {
  const parts = [order.dish]
  if (order.noodle && order.noodle !== "不適用") {
    parts.push(`麵：${order.noodle}`)
  }
  const extras = order.addOns?.filter((item) => item && item !== "不用加配") ?? []
  if (extras.length) {
    parts.push(`追加：${extras.join("、")}`)
  }
  return parts.join(" ")
}

function buildTingkokSections(order: Order): MemberTodayOrderSection[] {
  if (order.dish && order.dish !== "未選擇") {
    const items: MemberTodayOrderLine[] = [{ label: order.dish, quantity: 1 }]
    if (order.drink && order.drink !== "未選擇") {
      items.push({ label: order.drink, quantity: 1 })
    }
    return [{ category: "餐飲套餐", items }]
  }
  if (order.drink && order.drink !== "未選擇") {
    return [{ category: "飲品", items: [{ label: order.drink, quantity: 1 }] }]
  }
  return []
}

function buildFoodpandaSections(order: FoodpandaOrder): MemberTodayOrderSection[] {
  const sections: MemberTodayOrderSection[] = [
    {
      category: "foodpanda 套餐",
      items: [{ label: formatFpDishLine(order), quantity: 1 }],
    },
  ]
  if (order.drink && order.drink !== "未選擇") {
    sections.push({
      category: "飲品",
      items: [{ label: order.drink, quantity: 1 }],
    })
  }
  return sections
}

export async function getMemberTodayOrder(memberId: string): Promise<MemberTodayOrderResult> {
  const dateKey = getHongKongDateKey()
  const { from, to } = getHongKongDayRange(dateKey)
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("orders")
    .select("id, member_id, member_name, dish, drink, timestamp")
    .gte("timestamp", from)
    .lt("timestamp", to)
    .order("timestamp", { ascending: false })

  if (error) {
    throw error
  }

  const rows = (data ?? []).filter((row) => !isMetaRow(row.member_id, row.drink)) as OrderRow[]
  const fpRows = rows.filter((row) => isFpOrderRow(row))
  const tingkokRows = rows.filter((row) => !isFpOrderRow(row))

  const fpOrder = fpRows
    .map((row) => foodpandaOrderFromRow(row))
    .find((order) => order?.member_id === memberId)

  if (fpOrder) {
    return {
      dateKey,
      memberId,
      memberName: fpOrder.member_name || null,
      hasOrder: true,
      channel: "foodpanda",
      sections: buildFoodpandaSections(fpOrder),
    }
  }

  const tingkokOrder = tingkokRows.find((row) => row.member_id === memberId) as Order | undefined
  if (tingkokOrder) {
    const sections = buildTingkokSections(tingkokOrder)
    return {
      dateKey,
      memberId,
      memberName: tingkokOrder.member_name || null,
      hasOrder: sections.length > 0,
      channel: "tingkok",
      sections,
    }
  }

  return {
    dateKey,
    memberId,
    memberName: null,
    hasOrder: false,
    channel: null,
    sections: [],
  }
}
