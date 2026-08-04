"use client"

import { useRef } from "react"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Order, FoodpandaOrder, DailyOrders, DailyFoodpandaOrders, EmployeeRecord, ManagedMenuItem } from "../types"
import { supabase } from "../lib/supabase"
import { toast } from "react-hot-toast"
import * as XLSX from "xlsx"
import {
  formatOperatorSummary,
  isProxyOrder,
  resolveOrderOperator,
} from "../lib/order-operator"
import {
  getDefaultEmployees,
  getDefaultMenuItemsFromSchedule,
  readStoredMenuItems,
  writeStoredMenuItems,
  sortEmployeesByMembersOrder,
  reconcileEmployeeRecordWithMembers,
  dedupeEmployeesById,
  mergeEmployeesWithDefaults,
} from "../lib/local-master-data"
import {
  getHongKongDateKey,
  getHongKongDayRange,
  formatHongKongPeriodDate,
  listRecentHongKongDateKeys,
} from "../lib/hong-kong-calendar"
import { isAdminMember } from "../lib/admin-access"

interface OrderContextType {
  orders: DailyOrders
  employees: EmployeeRecord[]
  activeEmployees: EmployeeRecord[]
  menuItems: ManagedMenuItem[]
  currentMember: string | null
  setCurrentMember: (member: string | null) => void
  authMemberId: string | null
  bindAuthMember: (member: string | null) => void
  addOrder: (order: Omit<Order, "id" | "timestamp">) => Promise<void>
  getOrdersForDate: (dateKey: string) => Order[]
  fetchOrdersForDate: (dateKey: string) => Promise<Order[]>
  getManagedMenuForWeekday: (weekday: string) => string[]
  hasOrdered: (memberId: string) => boolean
  exportToCSV: (dateKey?: string) => void
  resetOrders: (audit: AuditActorInput) => Promise<void>
  resetOrderStatus: () => Promise<void>
  modifyOrder: (orderId: string, newOrder: Omit<Order, "id" | "timestamp">) => Promise<void>
  cancelOrder: (memberId: string, audit: AuditActorInput) => Promise<void>
  lastResetTime: Date | null
  foodpandaOrders: FoodpandaOrder[]
  getFoodpandaOrdersForDate: (dateKey: string) => FoodpandaOrder[]
  fetchFoodpandaOrdersForDate: (dateKey: string) => Promise<FoodpandaOrder[]>
  addFpOrder: (order: Omit<FoodpandaOrder, "id" | "timestamp">) => Promise<void>
  hasFpOrdered: (memberId: string) => boolean
  cancelFpOrder: (memberId: string, audit: AuditActorInput) => Promise<void>
  resetFpOrders: (audit: AuditActorInput) => Promise<void>
  fetchAuditLogs: (limit?: number) => Promise<AuditLogEntry[]>
  saveEmployees: (employees: EmployeeRecord[]) => Promise<void>
  deleteEmployeePermanently: (employeeId: string) => Promise<void>
  saveMenuItems: (items: ManagedMenuItem[]) => Promise<void>
  /** 員工名單の「儲存」または削除後、Supabase 照会結果（画面表示用） */
  employeesPersistResult: EmployeesPersistResult | null
  /** 菜單「保存」後、Supabase 照会結果 */
  menuPersistResult: MenuPersistResult | null
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

const META_EMPLOYEE_PREFIX = "meta-employee-"
const META_MENU_PREFIX = "meta-menu-"
/** 旧形式: meta-fp-{memberId}（1人1行・上書き）— 読み取りのみ互換 */
const META_FP_PREFIX = "meta-fp-"
/** 新形式: drink で foodpanda 行を識別し、注文ごとに1行追加 */
const META_FP_DRINK = "__meta_fp__"
/** 收據掃描の日次最終支払額（報銷表 B 上書き） */
const META_FP_RECEIPT_PREFIX = "meta-fp-receipt-"
const META_FP_RECEIPT_DRINK = "__meta_fp_receipt__"
const META_AUDIT_PREFIX = "meta-audit-"
const META_AUDIT_DRINK = "__meta_audit__"
const CURRENT_MEMBER_STORAGE_KEY = "lunch-order-current-member-v1"
const AUTH_MEMBER_STORAGE_KEY = "lunch-order-auth-member-v1"

type AuditActorInput = {
  actorName: string
}

type AuditAction = "INSERT" | "UPDATE" | "DELETE"

export type AuditLogEntry = {
  id: string
  createdAt: string
  action: AuditAction
  actorName: string
  confirmationCodeSuffix: string
  targetOrderId: string | null
  targetMemberId: string | null
  targetMemberName: string | null
  operatorMemberId: string | null
  operatorMemberName: string | null
  isProxyOrder: boolean
  summary: string
}

type OrderDbRow = {
  id?: string
  member_id: string
  member_name?: string
  dish: string
  drink?: string
  timestamp: string
  operator_member_id?: string | null
  operator_member_name?: string | null
}

function isEmployeeMetaRow(memberId: string) {
  return memberId.startsWith(META_EMPLOYEE_PREFIX)
}

function isMenuMetaRow(memberId: string) {
  return memberId.startsWith(META_MENU_PREFIX)
}

function isFpMetaRow(memberId: string) {
  return memberId.startsWith(META_FP_PREFIX)
}

function isFpReceiptMetaRow(memberId: string, drink?: string) {
  return drink === META_FP_RECEIPT_DRINK || memberId.startsWith(META_FP_RECEIPT_PREFIX)
}

function isFpOrderRow(row: { member_id: string; drink?: string }) {
  if (isFpReceiptMetaRow(row.member_id, row.drink)) return false
  return row.drink === META_FP_DRINK || isFpMetaRow(row.member_id)
}

function isMetaRow(memberId: string, drink?: string) {
  if (drink === META_FP_DRINK || drink === META_AUDIT_DRINK || drink === META_FP_RECEIPT_DRINK) return true
  if (memberId.startsWith(META_AUDIT_PREFIX) || memberId.startsWith(META_FP_RECEIPT_PREFIX)) return true
  return isEmployeeMetaRow(memberId) || isMenuMetaRow(memberId) || isFpMetaRow(memberId)
}

function sortFoodpandaOrders(orders: FoodpandaOrder[], employees: EmployeeRecord[]): FoodpandaOrder[] {
  return [...orders].sort((a, b) => {
    const ia = employees.findIndex((m) => m.id === a.member_id)
    const ib = employees.findIndex((m) => m.id === b.member_id)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

function normalizeActorName(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase()
}

function isActorMatched(actorName: string, candidates: Array<string | undefined | null>): boolean {
  const actor = normalizeActorName(actorName)
  if (!actor) return false
  return candidates.some((name) => !!name && normalizeActorName(name) === actor)
}

function sameMemberId(a: unknown, b: unknown): boolean {
  return String(a ?? "") === String(b ?? "")
}

function getEmployeeAliasCandidates(
  employees: EmployeeRecord[],
  memberId?: string | null,
): Array<string | undefined> {
  if (!memberId) return []
  const employee = employees.find((row) => sameMemberId(row.id, memberId))
  if (!employee) return []
  return [employee.nameInChinese, employee.nameInEnglish]
}

function buildCancelActorCandidates(
  employees: EmployeeRecord[],
  params: {
    targetMemberId: string
    targetMemberName?: string | null
    operatorMemberId?: string | null
    operatorMemberName?: string | null
  },
): Array<string | undefined | null> {
  return [
    params.targetMemberName,
    ...getEmployeeAliasCandidates(employees, params.targetMemberId),
    params.operatorMemberName,
    ...getEmployeeAliasCandidates(employees, params.operatorMemberId),
  ]
}

function foodpandaOrderFromRow(row: OrderDbRow): FoodpandaOrder | null {
  try {
    const parsed = JSON.parse(row.dish) as FoodpandaOrder
    const memberId = parsed?.member_id ?? (isFpMetaRow(row.member_id) ? row.member_id.slice(META_FP_PREFIX.length) : row.member_id)
    if (!memberId) return null
    return {
      ...parsed,
      id: row.id ?? parsed.id,
      member_id: String(memberId),
      member_name: parsed.member_name ?? row.member_name ?? "",
      timestamp: parsed.timestamp ?? row.timestamp,
      addOns: parsed.addOns ?? [],
      operator_member_id:
        row.operator_member_id != null
          ? String(row.operator_member_id)
          : parsed.operator_member_id != null
            ? String(parsed.operator_member_id)
            : null,
      operator_member_name: row.operator_member_name ?? parsed.operator_member_name ?? null,
    }
  } catch (err) {
    console.error("Invalid foodpanda row:", row, err)
    return null
  }
}

/** onePerMember: 当日UI用（修改は上書き）。false: 過去日照会は行ごと全件 */
function parseFoodpandaOrdersFromRows(
  rows: OrderDbRow[],
  employees: EmployeeRecord[],
  dateKey?: string,
  onePerMember = false,
): FoodpandaOrder[] {
  const byMember = new Map<string, FoodpandaOrder>()
  const all: FoodpandaOrder[] = []
  for (const row of rows) {
    if (!isFpOrderRow(row)) continue
    const order = foodpandaOrderFromRow(row)
    if (!order) continue
    const orderDateKey = getHongKongDateKey(new Date(order.timestamp))
    if (dateKey && orderDateKey !== dateKey) continue
    all.push(order)
    byMember.set(order.member_id, order)
  }
  const list = onePerMember ? Array.from(byMember.values()) : all
  return sortFoodpandaOrders(list, employees)
}

function parseAuditEntryFromRow(row: OrderDbRow): AuditLogEntry | null {
  if (row.drink !== META_AUDIT_DRINK) return null
  try {
    const payload = JSON.parse(row.dish) as {
      action: AuditAction
      actorName?: string
      confirmationCodeSuffix?: string
      targetOrderId?: string | null
      targetMemberId?: string | null
      targetMemberName?: string | null
      operatorMemberId?: string | null
      operatorMemberName?: string | null
      isProxyOrder?: boolean
      summary?: string
    }
    return {
      id: row.id ?? crypto.randomUUID(),
      createdAt: row.timestamp,
      action: payload.action,
      actorName: payload.actorName ?? row.member_name ?? "",
      confirmationCodeSuffix: payload.confirmationCodeSuffix ?? "",
      targetOrderId: payload.targetOrderId ?? null,
      targetMemberId: payload.targetMemberId ?? null,
      targetMemberName: payload.targetMemberName ?? null,
      operatorMemberId: payload.operatorMemberId ?? null,
      operatorMemberName: payload.operatorMemberName ?? null,
      isProxyOrder: Boolean(payload.isProxyOrder),
      summary: payload.summary ?? "",
    }
  } catch (error) {
    console.error("Invalid audit row:", row, error)
    return null
  }
}

const ORDER_HISTORY_DAYS = 90

function logPostgrestError(context: string, err: { message?: string; code?: string; details?: string; hint?: string }) {
  console.error(context, {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  })
}

/** message が空のときも UI / toast に出せるようにする */
export function formatPostgrestErrorMessage(err: { message?: string; code?: string; details?: string; hint?: string }): string {
  const m = err.message?.trim()
  if (m) return m
  const parts = [err.code, err.details, err.hint].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : "未知錯誤"
}

export interface EmployeesPersistResult {
  /** ISO 8601 */
  savedAtIso: string
  /** 今回 persist に渡した社員レコード数 */
  rowsWritten: number
  /** Supabase `orders` 上の `meta-employee-%` 行数（保存直後に COUNT 照会） */
  supabaseMetaRowCount: number | null
  /** 行数照会に失敗したとき */
  verifyError: string | null
}

async function countEmployeeMetaRowsInSupabase(): Promise<{ count: number | null; error: string | null }> {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .like("member_id", `${META_EMPLOYEE_PREFIX}%`)
  if (error) return { count: null, error: formatPostgrestErrorMessage(error) }
  return { count: count ?? 0, error: null }
}

export interface MenuPersistResult {
  savedAtIso: string
  rowsWritten: number
  supabaseMetaRowCount: number | null
  verifyError: string | null
}

async function countMenuMetaRowsInSupabase(): Promise<{ count: number | null; error: string | null }> {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .like("member_id", `${META_MENU_PREFIX}%`)
  if (error) return { count: null, error: formatPostgrestErrorMessage(error) }
  return { count: count ?? 0, error: null }
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  /** persist（delete→insert）と並行して loadMasterData が走ると、未挿入の空読みで state が壊れる */
  const persistMasterDataLockRef = useRef(false)
  /** 保存直後に DB 読みが空でも React の prev が古い固定メニューのままになるのを防ぐ */
  const lastMenuPersistRef = useRef<ManagedMenuItem[] | null>(null)
  /** DB に meta-menu が一度でもある／保存に成功したら true（空読みで schedule に戻さない） */
  const menuEverWrittenRef = useRef(false)

  const [orders, setOrders] = useState<DailyOrders>({})
  const [employees, setEmployees] = useState<EmployeeRecord[]>(getDefaultEmployees)
  const [menuItems, setMenuItems] = useState<ManagedMenuItem[]>(() => {
    const stashed = readStoredMenuItems()
    if (stashed.length > 0) return stashed
    return getDefaultMenuItemsFromSchedule()
  })
  const [currentMember, setCurrentMemberState] = useState<string | null>(null)
  const [authMemberId, setAuthMemberId] = useState<string | null>(null)
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const [foodpandaOrders, setFoodpandaOrders] = useState<FoodpandaOrder[]>([])
  const [fpOrdersByDate, setFpOrdersByDate] = useState<DailyFoodpandaOrders>({})
  const [employeesPersistResult, setEmployeesPersistResult] = useState<EmployeesPersistResult | null>(null)
  const [menuPersistResult, setMenuPersistResult] = useState<MenuPersistResult | null>(null)

  const setCurrentMember = useCallback((member: string | null) => {
    setCurrentMemberState(member)
    if (typeof window === "undefined") return
    try {
      if (member) {
        localStorage.setItem(CURRENT_MEMBER_STORAGE_KEY, String(member))
      } else {
        localStorage.removeItem(CURRENT_MEMBER_STORAGE_KEY)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const bindAuthMember = useCallback((member: string | null) => {
    setAuthMemberId(member)
    if (typeof window === "undefined") return
    try {
      if (member) {
        localStorage.setItem(AUTH_MEMBER_STORAGE_KEY, String(member))
      } else {
        localStorage.removeItem(AUTH_MEMBER_STORAGE_KEY)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const activeEmployees = employees.filter((employee) => employee.isActive)
  const authEmployeeRecord = employees.find((e) => String(e.id) === String(authMemberId ?? ""))
  const selectedEmployeeRecord = employees.find((e) => String(e.id) === String(currentMember ?? ""))
  const hasAdminAccess = isAdminMember(authEmployeeRecord) || isAdminMember(selectedEmployeeRecord)

  const didHydrateMemberRef = useRef(false)
  useEffect(() => {
    if (didHydrateMemberRef.current) return
    didHydrateMemberRef.current = true
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem(CURRENT_MEMBER_STORAGE_KEY)
      if (saved) {
        setCurrentMemberState(saved)
      }
      const savedAuthMember = localStorage.getItem(AUTH_MEMBER_STORAGE_KEY)
      if (savedAuthMember) {
        setAuthMemberId(savedAuthMember)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const loadMasterData = useCallback(async () => {
    if (persistMasterDataLockRef.current) return
    try {
      // `.or(like,like)` は環境によってクエリが欠けることがあるため、社員／菜單は別 SELECT（モバイルで 0 件になる対策）
      const [empRes, menuRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .like("member_id", `${META_EMPLOYEE_PREFIX}%`)
          .order("timestamp", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .like("member_id", `${META_MENU_PREFIX}%`)
          .order("timestamp", { ascending: false }),
      ])

      if (empRes.error) {
        logPostgrestError("Error loading employee meta:", empRes.error)
      }
      if (menuRes.error) {
        logPostgrestError("Error loading menu meta:", menuRes.error)
      }
      if (empRes.error && menuRes.error) {
        return
      }

      const data = [...(empRes.data ?? []), ...(menuRes.data ?? [])]

      const employeeRows: { record: EmployeeRecord; timestamp: string }[] = []
      const nextMenuItemsMap = new Map<string, ManagedMenuItem>()

      for (const row of data) {
        if (isEmployeeMetaRow(row.member_id)) {
          try {
            const raw = JSON.parse(row.dish) as EmployeeRecord
            const record = reconcileEmployeeRecordWithMembers(raw)
            employeeRows.push({ record, timestamp: row.timestamp })
          } catch (err) {
            console.error("Invalid employee meta row:", row, err)
          }
        }
        if (isMenuMetaRow(row.member_id)) {
          try {
            const record = JSON.parse(row.dish) as ManagedMenuItem
            if (!nextMenuItemsMap.has(record.id)) nextMenuItemsMap.set(record.id, record)
          } catch (err) {
            console.error("Invalid menu meta row:", row, err)
          }
        }
      }

      employeeRows.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      const nextEmployeesMap = new Map<string, EmployeeRecord>()
      for (const { record } of employeeRows) {
        nextEmployeesMap.set(record.id, record)
      }

      const fromDb = Array.from(nextEmployeesMap.values())
      setEmployees(
        nextEmployeesMap.size > 0
          ? sortEmployeesByMembersOrder(mergeEmployeesWithDefaults(fromDb))
          : getDefaultEmployees(),
      )
      // meta-menu が 0 件: 一度でも DB/保存があれば schedule に戻さない。未体験の端末だけ schedule で埋める。
      setMenuItems((prev) => {
        if (nextMenuItemsMap.size > 0) {
          const fromDb = Array.from(nextMenuItemsMap.values())
          menuEverWrittenRef.current = true
          writeStoredMenuItems(fromDb)
          lastMenuPersistRef.current = null
          return fromDb
        }
        if (lastMenuPersistRef.current && lastMenuPersistRef.current.length > 0) {
          const justSaved = lastMenuPersistRef.current
          lastMenuPersistRef.current = null
          writeStoredMenuItems(justSaved)
          return justSaved
        }
        if (prev.length > 0) return prev
        const stashed = readStoredMenuItems()
        if (stashed.length > 0) return stashed
        // 保存済みだが一瞬だけ空に見えるとき prev を捨てない（[] で draft を潰さない）
        if (menuEverWrittenRef.current) {
          const again = readStoredMenuItems()
          if (again.length > 0) return again
          return prev.length > 0 ? prev : []
        }
        return getDefaultMenuItemsFromSchedule()
      })
    } catch (err) {
      console.error("Unexpected error loading master data:", err)
    }
  }, [])

  const persistEmployees = useCallback(async (nextEmployees: EmployeeRecord[]) => {
    persistMasterDataLockRef.current = true
    try {
      const now = new Date().toISOString()
      const { error: deleteError } = await supabase.from("orders").delete().like("member_id", `${META_EMPLOYEE_PREFIX}%`)
      if (deleteError) throw deleteError

      if (nextEmployees.length > 0) {
        const rows = nextEmployees.map((employee) => ({
          member_id: `${META_EMPLOYEE_PREFIX}${employee.id}`,
          member_name: employee.nameInChinese || "employee",
          dish: JSON.stringify(employee),
          drink: "__meta_employee__",
          timestamp: now,
        }))
        const { error: insertError } = await supabase.from("orders").insert(rows)
        if (insertError) throw insertError
      }
    } finally {
      persistMasterDataLockRef.current = false
    }
  }, [])

  const persistMenuItems = useCallback(async (items: ManagedMenuItem[]) => {
    persistMasterDataLockRef.current = true
    try {
      const now = new Date().toISOString()
      const { error: deleteError } = await supabase.from("orders").delete().like("member_id", `${META_MENU_PREFIX}%`)
      if (deleteError) throw deleteError

      if (items.length > 0) {
        const rows = items.map((item) => ({
          member_id: `${META_MENU_PREFIX}${item.id}`,
          member_name: item.weekday,
          dish: JSON.stringify(item),
          drink: "__meta_menu__",
          timestamp: now,
        }))
        const { error: insertError } = await supabase.from("orders").insert(rows)
        if (insertError) throw insertError
      }
    } finally {
      persistMasterDataLockRef.current = false
    }
  }, [])

  const saveEmployees = useCallback(async (nextEmployees: EmployeeRecord[]) => {
    if (!hasAdminAccess) {
      toast.error("你冇管理權限")
      throw new Error("Admin permission required")
    }
    setEmployeesPersistResult(null)
    try {
      const reconciled = dedupeEmployeesById(nextEmployees.map(reconcileEmployeeRecordWithMembers))
      const merged = mergeEmployeesWithDefaults(reconciled)
      const ordered = sortEmployeesByMembersOrder(merged)
      setEmployees(ordered)
      await persistEmployees(ordered)
      await loadMasterData()
      const { count, error: verifyError } = await countEmployeeMetaRowsInSupabase()
      setEmployeesPersistResult({
        savedAtIso: new Date().toISOString(),
        rowsWritten: ordered.length,
        supabaseMetaRowCount: count,
        verifyError,
      })
    } catch (e) {
      setEmployeesPersistResult(null)
      throw e
    }
  }, [hasAdminAccess, persistEmployees, loadMasterData])

  const deleteEmployeePermanently = useCallback(async (employeeId: string) => {
    if (!hasAdminAccess) {
      toast.error("你冇管理權限")
      throw new Error("Admin permission required")
    }
    setEmployeesPersistResult(null)
    try {
      const nextEmployees = sortEmployeesByMembersOrder(
        mergeEmployeesWithDefaults(
          employees.map((employee) =>
            employee.id === employeeId ? { ...employee, isActive: false } : employee,
          ),
        ),
      )
      setEmployees(nextEmployees)
      await persistEmployees(nextEmployees)
      await loadMasterData()
      const { count, error: verifyError } = await countEmployeeMetaRowsInSupabase()
      setEmployeesPersistResult({
        savedAtIso: new Date().toISOString(),
        rowsWritten: nextEmployees.length,
        supabaseMetaRowCount: count,
        verifyError,
      })
    } catch (e) {
      setEmployeesPersistResult(null)
      throw e
    }
  }, [hasAdminAccess, employees, persistEmployees, loadMasterData])

  const saveMenuItems = useCallback(async (items: ManagedMenuItem[]) => {
    if (!hasAdminAccess) {
      toast.error("你冇管理權限")
      throw new Error("Admin permission required")
    }
    setMenuPersistResult(null)
    try {
      lastMenuPersistRef.current = items
      await persistMenuItems(items)
      menuEverWrittenRef.current = true
      writeStoredMenuItems(items)
      setMenuItems(items)
      await loadMasterData()
      const { count, error: verifyError } = await countMenuMetaRowsInSupabase()
      setMenuPersistResult({
        savedAtIso: new Date().toISOString(),
        rowsWritten: items.length,
        supabaseMetaRowCount: count,
        verifyError,
      })
    } catch (e) {
      setMenuPersistResult(null)
      lastMenuPersistRef.current = null
      throw e
    }
  }, [hasAdminAccess, persistMenuItems, loadMasterData])

  const getManagedMenuForWeekday = useCallback(
    (weekday: string) =>
      menuItems
        .filter((item) => item.weekday === weekday)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.dishName),
    [menuItems],
  )

  const appendAuditLog = useCallback(
    async ({
      action,
      targetRow,
      actorName,
      summary,
      operatorMemberId,
      operatorMemberName,
      isProxy,
    }: {
      action: AuditAction
      targetRow: OrderDbRow | null
      actorName: string
      summary: string
      operatorMemberId?: string | null
      operatorMemberName?: string | null
      isProxy?: boolean
    }) => {
      const payload = {
        action,
        actorName,
        confirmationCodeSuffix: "",
        targetOrderId: targetRow?.id ?? null,
        targetMemberId: targetRow?.member_id ?? null,
        targetMemberName: targetRow?.member_name ?? null,
        operatorMemberId: operatorMemberId ?? null,
        operatorMemberName: operatorMemberName ?? null,
        isProxyOrder: Boolean(isProxy),
        summary,
      }

      const { error } = await supabase.from("orders").insert({
        member_id: `${META_AUDIT_PREFIX}${crypto.randomUUID()}`,
        member_name: actorName,
        dish: JSON.stringify(payload),
        drink: META_AUDIT_DRINK,
        timestamp: new Date().toISOString(),
      })
      if (error) {
        logPostgrestError("appendAuditLog:", error)
      }
    },
    [],
  )

  const deleteOrderById = useCallback(
    async (row: OrderDbRow, audit: { actorName: string }, summary: string) => {
      if (!row.id) return
      const { error } = await supabase.from("orders").delete().eq("id", row.id)
      if (error) {
        logPostgrestError("deleteOrderById:", error)
        throw error
      }
      await appendAuditLog({
        action: "DELETE",
        targetRow: row,
        actorName: audit.actorName,
        summary,
      })
    },
    [appendAuditLog],
  )

  const deleteTodayFpOrdersForMember = useCallback(
    async (memberId: string, audit?: { actorName: string }) => {
      const todayKey = getHongKongDateKey()
      const { from, to } = getHongKongDayRange(todayKey)

      const legacyMemberId = `${META_FP_PREFIX}${memberId}`
      const [legacyRes, currentRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, member_id, member_name, dish, drink, timestamp")
          .eq("member_id", legacyMemberId)
          .gte("timestamp", from)
          .lt("timestamp", to),
        supabase
          .from("orders")
          .select("id, member_id, member_name, dish, drink, timestamp")
          .eq("member_id", memberId)
          .eq("drink", META_FP_DRINK)
          .gte("timestamp", from)
          .lt("timestamp", to),
      ])

      if (legacyRes.error) {
        logPostgrestError("deleteTodayFpOrdersForMember select legacy:", legacyRes.error)
        throw legacyRes.error
      }
      if (currentRes.error) {
        logPostgrestError("deleteTodayFpOrdersForMember select current:", currentRes.error)
        throw currentRes.error
      }

      const deduped = new Map<string, OrderDbRow>()
      for (const row of [...(legacyRes.data ?? []), ...(currentRes.data ?? [])] as OrderDbRow[]) {
        const key = row.id ?? `${row.member_id}-${row.timestamp}-${row.drink ?? ""}`
        deduped.set(key, row)
      }
      const targets = Array.from(deduped.values())

      const actor = audit?.actorName?.trim() || "system"
      for (const row of targets) {
        await deleteOrderById(
          row,
          { actorName: actor },
          `foodpanda同日訂單刪除(${memberId})`,
        )
      }
    },
    [deleteOrderById],
  )

  const loadFoodpandaOrders = useCallback(async () => {
    try {
      const todayKey = getHongKongDateKey()
      const { from, to } = getHongKongDayRange(todayKey)
      const selectCols = "id, member_id, member_name, dish, drink, timestamp, operator_member_id, operator_member_name"
      const [legacyRes, currentRes] = await Promise.all([
        supabase
          .from("orders")
          .select(selectCols)
          .like("member_id", `${META_FP_PREFIX}%`)
          .gte("timestamp", from)
          .lt("timestamp", to),
        supabase
          .from("orders")
          .select(selectCols)
          .eq("drink", META_FP_DRINK)
          .gte("timestamp", from)
          .lt("timestamp", to),
      ])

      if (legacyRes.error) {
        logPostgrestError("Error loading foodpanda legacy orders:", legacyRes.error)
        return
      }
      if (currentRes.error) {
        logPostgrestError("Error loading foodpanda current orders:", currentRes.error)
        return
      }

      const deduped = new Map<string, OrderDbRow>()
      for (const row of [...(legacyRes.data ?? []), ...(currentRes.data ?? [])] as OrderDbRow[]) {
        const key = row.id ?? `${row.member_id}-${row.timestamp}-${row.drink ?? ""}`
        deduped.set(key, row)
      }

      const fpRows = Array.from(deduped.values()).filter((row) => isFpOrderRow(row))
      const arr = parseFoodpandaOrdersFromRows(fpRows, employees, todayKey, true)
      setFoodpandaOrders(arr)
      setFpOrdersByDate((prev) => ({ ...prev, [todayKey]: arr }))
    } catch (err) {
      console.error("loadFoodpandaOrders:", err)
    }
  }, [employees])

  const persistFpOrder = useCallback(
    async (order: FoodpandaOrder) => {
      await deleteTodayFpOrdersForMember(order.member_id, {
        actorName: order.operator_member_name || order.member_name,
      })

      const payload = {
        member_id: order.member_id,
        member_name: order.member_name,
        dish: JSON.stringify(order),
        drink: META_FP_DRINK,
        timestamp: order.timestamp,
        operator_member_id: order.operator_member_id ?? order.member_id,
        operator_member_name: order.operator_member_name ?? order.member_name,
      }

      const { data, error: insertError } = await supabase.from("orders").insert(payload).select().single()

      if (insertError) {
        logPostgrestError("persistFpOrder insert:", insertError)
        throw insertError
      }
      const operator = {
        operatorMemberId: order.operator_member_id ?? order.member_id,
        operatorMemberName: order.operator_member_name ?? order.member_name,
      }
      await appendAuditLog({
        action: "INSERT",
        targetRow: data as OrderDbRow,
        actorName: operator.operatorMemberName,
        summary: formatOperatorSummary(
          operator,
          order.member_id,
          order.member_name,
          "foodpanda訂單新增/修改",
        ),
        operatorMemberId: operator.operatorMemberId,
        operatorMemberName: operator.operatorMemberName,
        isProxy: isProxyOrder({
          member_id: order.member_id,
          operator_member_id: order.operator_member_id,
        }),
      })
      return data
    },
    [appendAuditLog, deleteTodayFpOrdersForMember],
  )

  const addFpOrder = useCallback(
    async (order: Omit<FoodpandaOrder, "id" | "timestamp">) => {
      try {
        const operator = resolveOrderOperator(authMemberId, order.member_id, employees)
        const newOrder: FoodpandaOrder = {
          ...order,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          operator_member_id: operator.operatorMemberId,
          operator_member_name: operator.operatorMemberName,
        }
        await persistFpOrder(newOrder)
        await loadFoodpandaOrders()
      } catch (e) {
        console.error("addFpOrder:", e)
        toast.error("foodpanda 落單保存失敗: " + (e instanceof Error ? e.message : String(e)))
        throw e
      }
    },
    [authMemberId, employees, persistFpOrder, loadFoodpandaOrders],
  )

  const hasFpOrdered = useCallback((memberId: string) => {
    return foodpandaOrders.some((o) => sameMemberId(o.member_id, memberId))
  }, [foodpandaOrders])

  const cancelFpOrder = useCallback(
    async (memberId: string, audit: AuditActorInput) => {
      try {
        const existing = foodpandaOrders.find((o) => sameMemberId(o.member_id, memberId))
        const allowed = isActorMatched(
          audit.actorName,
          buildCancelActorCandidates(employees, {
            targetMemberId: memberId,
            targetMemberName: existing?.member_name,
            operatorMemberId: existing?.operator_member_id,
            operatorMemberName: existing?.operator_member_name,
          }),
        )
        if (!allowed) {
          toast.error("取消權限不足：僅限訂餐本人或代理操作者取消")
          return
        }
        if (existing?.id) {
          await deleteOrderById(
            {
              id: existing.id,
              member_id: existing.member_id,
              member_name: existing.member_name,
              dish: existing.dish,
              drink: META_FP_DRINK,
              timestamp: existing.timestamp,
            },
            { actorName: audit.actorName },
            "foodpanda個別取消",
          )
        } else {
          await deleteTodayFpOrdersForMember(memberId, {
            actorName: audit.actorName,
          })
        }
        await loadFoodpandaOrders()
      } catch (e) {
        console.error("cancelFpOrder:", e)
        throw e
      }
    },
    [foodpandaOrders, employees, deleteOrderById, deleteTodayFpOrdersForMember, loadFoodpandaOrders],
  )

  const resetFpOrders = useCallback(
    async (audit: AuditActorInput) => {
      if (!hasAdminAccess) {
        toast.error("你冇管理權限")
        return
      }
      try {
        setIsLoading(true)
        const { data: rows, error } = await supabase
          .from("orders")
          .select("id, member_id, member_name, dish, drink, timestamp")
          .or(`member_id.like.${META_FP_PREFIX}%,drink.eq.${META_FP_DRINK}`)
        if (error) {
          logPostgrestError("resetFpOrders fetch:", error)
          toast.error("foodpanda 重設失敗: " + formatPostgrestErrorMessage(error))
          throw error
        }
        for (const row of (rows ?? []) as OrderDbRow[]) {
          await deleteOrderById(
            row,
            { actorName: audit.actorName },
            "foodpanda一括Reset",
          )
        }
        setFoodpandaOrders([])
        setFpOrdersByDate({})
        await loadFoodpandaOrders()
      } finally {
        setIsLoading(false)
      }
    },
    [hasAdminAccess, deleteOrderById, loadFoodpandaOrders],
  )

  const getDateRange = () => {
    const keys = listRecentHongKongDateKeys(ORDER_HISTORY_DAYS)
    const oldestKey = keys[keys.length - 1] ?? getHongKongDateKey()
    const todayKey = getHongKongDateKey()
    const { from } = getHongKongDayRange(oldestKey)
    const { to } = getHongKongDayRange(todayKey)
    return { from, to }
  }

  const loadOrders = useCallback(async () => {
    // 同時に複数回実行されないようにする
    if (loadingRef.current) return
    loadingRef.current = true

    setIsLoading(true)
    setError(null)

    try {
      const dateRange = getDateRange()

      // 直接Supabaseクライアントを使用
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("timestamp", dateRange.from)
        .lt("timestamp", dateRange.to)
        .order("timestamp", { ascending: false })

      if (error) {
        logPostgrestError("Supabase error loading orders:", error)
        const msg = formatPostgrestErrorMessage(error)
        setError(`資料載入錯誤: ${msg}`)
        toast.error("訂單資料載入失敗: " + msg)
        return
      }

      const orderRows = (data ?? []).filter((row) => !isMetaRow(row.member_id, row.drink))

      if (!orderRows || orderRows.length === 0) {
        setOrders({})
      } else {
        // 日付ごとにグループ化
        const groupedOrders = orderRows.reduce((acc, order) => {
          try {
            const dateKey = getHongKongDateKey(new Date(order.timestamp))
            if (!acc[dateKey]) acc[dateKey] = []
            acc[dateKey].push(order)
            return acc
          } catch (err) {
            console.error("Error processing order:", order, err)
            return acc
          }
        }, {} as DailyOrders)

        setOrders(groupedOrders)
      }
    } catch (error) {
      console.error("Error in loadOrders:", error)
      setError(`未預期錯誤: ${error instanceof Error ? error.message : String(error)}`)
      toast.error("訂單資料載入失敗")
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [])

  const refreshTodayOrders = useCallback(async () => {
    try {
      const todayKey = getHongKongDateKey()
      const { from, to } = getHongKongDayRange(todayKey)
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("timestamp", from)
        .lt("timestamp", to)
        .order("timestamp", { ascending: false })

      if (error) {
        logPostgrestError("refreshTodayOrders:", error)
        return
      }

      const dayOrders = (data ?? []).filter((row) => !isMetaRow(row.member_id, row.drink))
      setOrders((prev) => ({ ...prev, [todayKey]: dayOrders }))
    } catch (err) {
      console.error("refreshTodayOrders:", err)
    }
  }, [])

  const loadMasterDataRef = useRef(loadMasterData)
  const loadOrdersRef = useRef(loadOrders)
  const loadFoodpandaOrdersRef = useRef(loadFoodpandaOrders)
  const refreshTodayOrdersRef = useRef(refreshTodayOrders)

  useEffect(() => {
    loadMasterDataRef.current = loadMasterData
    loadOrdersRef.current = loadOrders
    loadFoodpandaOrdersRef.current = loadFoodpandaOrders
    refreshTodayOrdersRef.current = refreshTodayOrders
  }, [loadMasterData, loadOrders, loadFoodpandaOrders, refreshTodayOrders])

  // 初期ロード
  useEffect(() => {
    loadMasterDataRef.current()
    loadOrdersRef.current()
    loadFoodpandaOrdersRef.current()

    // 定期的に更新（ポーリング）
    const intervalId = setInterval(() => {
      loadMasterDataRef.current()
      refreshTodayOrdersRef.current()
      loadFoodpandaOrdersRef.current()
    }, 30000) // 30秒ごとに更新

    return () => clearInterval(intervalId)
  }, [])

  // リアルタイム更新（可能な場合）
  useEffect(() => {
    try {
      const channel = supabase
        .channel("orders-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            const row = (payload.new ?? payload.old) as
              | { member_id?: string | null; drink?: string | null }
              | null
            if (row?.member_id && isMetaRow(String(row.member_id), row.drink ?? undefined)) {
              loadMasterDataRef.current()
            }
            refreshTodayOrdersRef.current()
            loadFoodpandaOrdersRef.current()
          },
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up real-time subscription:", err)
      // リアルタイム更新に失敗してもアプリは動作し続ける
    }
  }, [])

  const hasOrdered = useCallback(
    (memberId: string): boolean => {
      try {
        const todayOrders = orders[getHongKongDateKey()] || []
        return todayOrders.some((order) => order.member_id === memberId)
      } catch (err) {
        console.error("Error in hasOrdered:", err)
        return false
      }
    },
    [orders],
  )

  const addOrder = async (order: Omit<Order, "id" | "timestamp">) => {
    try {
      setIsLoading(true)

      if (hasOrdered(order.member_id)) {
        toast.error("該成員已經訂購")
        return
      }

      const operator = resolveOrderOperator(authMemberId, order.member_id, employees)
      const timestamp = new Date().toISOString()

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            member_id: order.member_id,
            member_name: order.member_name,
            dish: order.dish,
            drink: order.drink,
            timestamp,
            operator_member_id: operator.operatorMemberId,
            operator_member_name: operator.operatorMemberName,
          },
        ])
        .select()

      if (error) {
        logPostgrestError("Error adding order:", error)
        toast.error("訂單提交失敗: " + formatPostgrestErrorMessage(error))
        throw error
      }

      if (Array.isArray(data) && data[0]) {
        await appendAuditLog({
          action: "INSERT",
          targetRow: data[0] as OrderDbRow,
          actorName: operator.operatorMemberName,
          summary: formatOperatorSummary(
            operator,
            order.member_id,
            order.member_name,
            "汀角路訂單新增",
          ),
          operatorMemberId: operator.operatorMemberId,
          operatorMemberName: operator.operatorMemberName,
          isProxy: isProxyOrder({
            member_id: order.member_id,
            operator_member_id: operator.operatorMemberId,
          }),
        })
      }
      toast.success("訂單已成功提交")

      // データを再読み込み
      await refreshTodayOrders()
    } catch (error) {
      console.error("Error in addOrder:", error)
      toast.error("訂單提交失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const getOrdersForDate = useCallback(
    (dateKey: string): Order[] => {
      return orders[dateKey] || []
    },
    [orders],
  )

  const fetchOrdersForDate = useCallback(
    async (dateKey: string): Promise<Order[]> => {
      if (orders[dateKey] !== undefined) return orders[dateKey]

      const { from, to } = getHongKongDayRange(dateKey)
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("timestamp", from)
        .lt("timestamp", to)
        .order("timestamp", { ascending: false })

      if (error) {
        logPostgrestError("fetchOrdersForDate:", error)
        throw new Error(formatPostgrestErrorMessage(error))
      }

      const dayOrders = (data ?? []).filter((row) => !isMetaRow(row.member_id, row.drink))
      setOrders((prev) => ({ ...prev, [dateKey]: dayOrders }))
      return dayOrders
    },
    [orders],
  )

  const getFoodpandaOrdersForDate = useCallback(
    (dateKey: string): FoodpandaOrder[] => {
      return fpOrdersByDate[dateKey] ?? []
    },
    [fpOrdersByDate],
  )

  const fetchFoodpandaOrdersForDate = useCallback(
    async (dateKey: string): Promise<FoodpandaOrder[]> => {
      if (fpOrdersByDate[dateKey] !== undefined) return fpOrdersByDate[dateKey]

      const { from, to } = getHongKongDayRange(dateKey)
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("timestamp", from)
        .lt("timestamp", to)
        .order("timestamp", { ascending: false })

      if (error) {
        logPostgrestError("fetchFoodpandaOrdersForDate:", error)
        throw new Error(formatPostgrestErrorMessage(error))
      }

      let fpRows = (data ?? []).filter((row) => isFpOrderRow(row))

      // 旧形式 meta-fp-* は行の timestamp が上書きでずれるため、JSON 内の期日でも拾う
      const { data: legacyRows } = await supabase
        .from("orders")
        .select("*")
        .like("member_id", `${META_FP_PREFIX}%`)

      const seenIds = new Set(fpRows.map((r) => r.id).filter(Boolean))
      for (const row of legacyRows ?? []) {
        if (row.id && seenIds.has(row.id)) continue
        const order = foodpandaOrderFromRow(row)
        if (order && getHongKongDateKey(new Date(order.timestamp)) === dateKey) {
          fpRows.push(row)
          if (row.id) seenIds.add(row.id)
        }
      }

      const dayOrders = parseFoodpandaOrdersFromRows(fpRows, employees, dateKey, false)
      setFpOrdersByDate((prev) => ({ ...prev, [dateKey]: dayOrders }))
      if (dateKey === getHongKongDateKey()) {
        setFoodpandaOrders(dayOrders)
      }
      return dayOrders
    },
    [fpOrdersByDate, employees],
  )

  const exportToCSV = (dateKey?: string) => {
    try {
      const key = dateKey ?? getHongKongDateKey()
      const [, month = "1", day = "1"] = key.split("-")
      const formattedDate = formatHongKongPeriodDate(key)
      const todayOrders = orders[key] || []

      const getMemberGroup = (memberId: string) => employees.find(m => m.id === memberId)?.group || "A"
      const groupA = todayOrders.filter(o => getMemberGroup(o.member_id) === "A")
      const groupB = todayOrders.filter(o => getMemberGroup(o.member_id) === "B")

      const memberIndex = (memberId: string) => {
        const idx = employees.findIndex(m => m.id === memberId)
        return idx === -1 ? 999 : idx
      }
      const buildDishGroups = (orderList: typeof todayOrders) => {
        const sorted = [...orderList].sort((a, b) => memberIndex(a.member_id) - memberIndex(b.member_id))
        const groups: { dish: string; orders: typeof todayOrders }[] = []
        const seen: string[] = []
        for (const o of sorted) {
          if (!seen.includes(o.dish)) seen.push(o.dish)
        }
        for (const dish of seen) {
          groups.push({ dish, orders: sorted.filter(o => o.dish === dish) })
        }
        return groups
      }

      const dishGroupsA = buildDishGroups(groupA)
      const dishGroupsB = buildDishGroups(groupB)

      const rows: (string | number)[][] = []
      const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = []
      let rowIdx = 0

      rows.push([formattedDate])
      rowIdx++
      rows.push(["A", "姓名", "餐點", "數量", "飲品"])
      rowIdx++

      let aNum = 1
      for (const group of dishGroupsA) {
        const qty = group.orders.length
        const groupStartRow = rowIdx
        group.orders.forEach((o, i) => {
          rows.push([aNum, o.member_name, o.dish, i === 0 ? qty : "", o.drink])
          aNum++
          rowIdx++
        })
        if (qty > 1) {
          merges.push({ s: { r: groupStartRow, c: 3 }, e: { r: groupStartRow + qty - 1, c: 3 } })
        }
      }

      rows.push([])
      rowIdx++
      rows.push(["B"])
      rowIdx++

      let bNum = 1
      for (const group of dishGroupsB) {
        const qty = group.orders.length
        const groupStartRow = rowIdx
        group.orders.forEach((o, i) => {
          rows.push([bNum, o.member_name, o.dish, i === 0 ? qty : "", o.drink])
          bNum++
          rowIdx++
        })
        if (qty > 1) {
          merges.push({ s: { r: groupStartRow, c: 3 }, e: { r: groupStartRow + qty - 1, c: 3 } })
        }
      }

      const withDish = todayOrders.filter(o => o.dish !== "未選擇")
      const drinksOnly = todayOrders.filter(o => o.dish === "未選擇")
      const mealPrice = 35
      const drinkOnlyPrice = 10
      const total = withDish.length * mealPrice + drinksOnly.length * drinkOnlyPrice
      const totalFormula = drinksOnly.length > 0
        ? `Total : ${withDish.length} x ${mealPrice} + ${drinksOnly.length} x ${drinkOnlyPrice} = ${total}`
        : `Total : ${withDish.length} x ${mealPrice} = ${total}`
      rows.push(["", "", "", totalFormula])
      rowIdx++

      rows.push([])
      rowIdx++
      const statsRow = rowIdx
      rows.push(["", "統計"])
      rowIdx++
      rows.push(["", "餐點:", "飲品:"])
      rowIdx++

      const dishCounts: Record<string, number> = {}
      const drinkCounts: Record<string, number> = {}
      for (const o of todayOrders) {
        dishCounts[o.dish] = (dishCounts[o.dish] || 0) + 1
        drinkCounts[o.drink] = (drinkCounts[o.drink] || 0) + 1
      }

      const dishEntries = Object.entries(dishCounts)
      const drinkEntries = Object.entries(drinkCounts)
      const maxLen = Math.max(dishEntries.length, drinkEntries.length)

      for (let i = 0; i < maxLen; i++) {
        const dEntry = dishEntries[i] ? `${dishEntries[i][0]}: ${dishEntries[i][1]}件` : ""
        const kEntry = drinkEntries[i] ? `${drinkEntries[i][0]}: ${drinkEntries[i][1]}件` : ""
        rows.push(["", dEntry, kEntry])
        rowIdx++
      }

      rows.push([])
      rowIdx++
      rows.push(["", "註：", "香港桐井有限公司"])
      rowIdx++
      rows.push(["", "", "請留意數量和種類，"])
      rowIdx++
      rows.push(["", "", "請於約 11:30 送來，謝謝！"])
      rowIdx++
      rows.push(["", "", "電話：2264 8166"])

      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws["!merges"] = merges
      ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 20 }, { wch: 8 }, { wch: 14 }]

      const centerStyle = { alignment: { horizontal: "center", vertical: "center" } }
      const dCol = 3
      for (let r = 0; r <= rowIdx; r++) {
        const cellRef = XLSX.utils.encode_cell({ r, c: dCol })
        if (ws[cellRef]) {
          if (!ws[cellRef].s) ws[cellRef].s = {}
          ws[cellRef].s = centerStyle
        }
      }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "訂單")
      XLSX.writeFile(wb, `訂單_${Number(month)}月${Number(day)}日.xlsx`)
    } catch (err) {
      console.error("Error exporting Excel:", err)
      toast.error("匯出 Excel 失敗")
    }
  }

  const resetOrders = async (audit: AuditActorInput) => {
    if (!hasAdminAccess) {
      toast.error("你冇管理權限")
      return
    }
    try {
      setIsLoading(true)

      // 今日の日付の開始時刻（00:00:00）を取得
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: targets, error: fetchError } = await supabase
        .from("orders")
        .select("id, member_id, member_name, dish, drink, timestamp")
        .gte("timestamp", today.toISOString())
      if (fetchError) {
        logPostgrestError("Error fetching orders for reset:", fetchError)
        toast.error("重設訂單失敗: " + formatPostgrestErrorMessage(fetchError))
        throw fetchError
      }

      const rowsToDelete = ((targets ?? []) as OrderDbRow[]).filter(
        (row) =>
          !isEmployeeMetaRow(row.member_id) &&
          !isMenuMetaRow(row.member_id) &&
          !isFpMetaRow(row.member_id) &&
          row.drink !== META_FP_DRINK &&
          row.drink !== META_AUDIT_DRINK,
      )

      for (const row of rowsToDelete) {
        await deleteOrderById(
          row,
          { actorName: audit.actorName },
          "汀角路當日一括Reset",
        )
      }

      // ローカルステートをリセット
      setOrders({})
      setCurrentMember(null)

      // リセット時間を更新
      const newResetTime = new Date()
      setLastResetTime(newResetTime)
      localStorage.setItem("lastResetTime", newResetTime.toISOString())

      toast.success("訂單記錄已重設")

      // データを再読み込み
      await loadOrders()
    } catch (error) {
      console.error("Error in resetOrders:", error)
      toast.error("重設訂單失敗")
    } finally {
      setIsLoading(false)
    }
  }

  // 最後のリセット時間を読み込む
  useEffect(() => {
    try {
      const storedResetTime = localStorage.getItem("lastResetTime")
      if (storedResetTime) {
        setLastResetTime(new Date(storedResetTime))
      }
    } catch (err) {
      console.error("Error loading last reset time:", err)
    }
  }, [])

  const resetOrderStatus = useCallback(async () => {
    await Promise.all([refreshTodayOrders(), loadFoodpandaOrders()])
  }, [refreshTodayOrders, loadFoodpandaOrders])

  const fetchAuditLogs = useCallback(async (limit = 200): Promise<AuditLogEntry[]> => {
    if (!hasAdminAccess) {
      throw new Error("Admin permission required")
    }
    const { data, error } = await supabase
      .from("orders")
      .select("id, member_id, member_name, dish, drink, timestamp")
      .eq("drink", META_AUDIT_DRINK)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) {
      logPostgrestError("fetchAuditLogs:", error)
      throw error
    }

    const appLogs = (data ?? [])
      .map((row) => parseAuditEntryFromRow(row as OrderDbRow))
      .filter((row): row is AuditLogEntry => row !== null)

    const { data: dbAuditData, error: dbAuditError } = await supabase
      .from("order_audit_logs")
      .select("id, created_at, action, old_row, new_row, order_id")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (dbAuditError) {
      logPostgrestError("fetchAuditLogs(order_audit_logs):", dbAuditError)
      return appLogs
    }

    const dbLogs: AuditLogEntry[] = (dbAuditData ?? []).map((row) => {
      const oldRow = (row.old_row ?? null) as Partial<OrderDbRow> | null
      const newRow = (row.new_row ?? null) as Partial<OrderDbRow> | null
      const targetMemberId = String(newRow?.member_id ?? oldRow?.member_id ?? "")
      const targetMemberName = String(newRow?.member_name ?? oldRow?.member_name ?? "")
      const operatorMemberId = String(newRow?.operator_member_id ?? oldRow?.operator_member_id ?? "")
      const operatorMemberName = String(newRow?.operator_member_name ?? oldRow?.operator_member_name ?? "")
      return {
        id: `db-${row.id}`,
        createdAt: row.created_at as string,
        action: row.action as AuditAction,
        actorName: operatorMemberName || "system(db)",
        confirmationCodeSuffix: "",
        targetOrderId: (row.order_id as string) ?? null,
        targetMemberId: targetMemberId || null,
        targetMemberName: targetMemberName || null,
        operatorMemberId: operatorMemberId || null,
        operatorMemberName: operatorMemberName || null,
        isProxyOrder: Boolean(
          operatorMemberId &&
            targetMemberId &&
            operatorMemberId !== targetMemberId,
        ),
        summary: `DB trigger ${row.action}`,
      }
    })

    return [...appLogs, ...dbLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }, [hasAdminAccess])

  const modifyOrder = async (orderId: string, newOrder: Omit<Order, "id" | "timestamp">) => {
    try {
      setIsLoading(true)
      // 更新前に注文が存在するか確認
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (checkError) {
        logPostgrestError("Error checking existing order:", checkError)
        toast.error("確認訂單失敗: " + formatPostgrestErrorMessage(checkError))
        throw checkError
      }

      if (!existingOrder) {
        console.error("Order not found:", orderId)
        toast.error("搵唔到訂單")
        throw new Error("Order not found")
      }

      const operator = resolveOrderOperator(authMemberId, newOrder.member_id, employees)

      const { error } = await supabase
        .from("orders")
        .update({
          member_id: newOrder.member_id,
          member_name: newOrder.member_name,
          dish: newOrder.dish,
          drink: newOrder.drink,
          operator_member_id: operator.operatorMemberId,
          operator_member_name: operator.operatorMemberName,
        })
        .eq("id", orderId)

      if (error) {
        logPostgrestError("Error modifying order:", error)
        toast.error("修改訂單失敗: " + formatPostgrestErrorMessage(error))
        throw error
      }

      await appendAuditLog({
        action: "UPDATE",
        targetRow: {
          id: orderId,
          member_id: newOrder.member_id,
          member_name: newOrder.member_name,
          dish: newOrder.dish,
          drink: newOrder.drink,
          timestamp: existingOrder.timestamp,
          operator_member_id: operator.operatorMemberId,
          operator_member_name: operator.operatorMemberName,
        },
        actorName: operator.operatorMemberName,
        summary: formatOperatorSummary(
          operator,
          newOrder.member_id,
          newOrder.member_name,
          `汀角路訂單修改（前: ${existingOrder.dish}/${existingOrder.drink}）`,
        ),
        operatorMemberId: operator.operatorMemberId,
        operatorMemberName: operator.operatorMemberName,
        isProxy: isProxyOrder({
          member_id: newOrder.member_id,
          operator_member_id: operator.operatorMemberId,
        }),
      })

      toast.success("訂單已修改")

      // データを再読み込み
      await refreshTodayOrders()
    } catch (error) {
      console.error("Error in modifyOrder:", error)
      toast.error("修改訂單失敗")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (memberId: string, audit: AuditActorInput) => {
    try {
      setIsLoading(true)

      const todayOrders = orders[getHongKongDateKey()] || []
      const orderToCancel = todayOrders.find((order) => order.member_id === memberId)

      if (!orderToCancel) {
        toast.error("搵唔到對應訂單")
        return
      }

      const allowed = isActorMatched(
        audit.actorName,
        buildCancelActorCandidates(employees, {
          targetMemberId: memberId,
          targetMemberName: orderToCancel.member_name,
          operatorMemberId: orderToCancel.operator_member_id,
          operatorMemberName: orderToCancel.operator_member_name,
        }),
      )
      if (!allowed) {
        toast.error("取消權限不足：僅限訂餐本人或代理操作者取消")
        return
      }

      await deleteOrderById(
        orderToCancel as unknown as OrderDbRow,
        { actorName: audit.actorName },
        "汀角路個別取消",
      )

      toast.success("訂單已取消")

      // データを再読み込み
      await refreshTodayOrders()
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("取消訂單失敗")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        employees,
        activeEmployees,
        menuItems,
        currentMember,
        setCurrentMember,
        authMemberId,
        bindAuthMember,
        addOrder,
        getOrdersForDate,
        fetchOrdersForDate,
        getManagedMenuForWeekday,
        hasOrdered,
        exportToCSV,
        resetOrders,
        resetOrderStatus,
        modifyOrder,
        cancelOrder,
        lastResetTime,
        foodpandaOrders,
        getFoodpandaOrdersForDate,
        fetchFoodpandaOrdersForDate,
        addFpOrder,
        hasFpOrdered,
        cancelFpOrder,
        resetFpOrders,
        fetchAuditLogs,
        saveEmployees,
        deleteEmployeePermanently,
        saveMenuItems,
        employeesPersistResult,
        menuPersistResult,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrders must be used within a OrderProvider")
  }
  return context
}
