"use client"

import { useRef } from "react"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Order, FoodpandaOrder, DailyOrders, DailyFoodpandaOrders, EmployeeRecord, ManagedMenuItem } from "../types"
import { supabase } from "../lib/supabase"
import { toast } from "react-hot-toast"
import * as XLSX from "xlsx"
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
  isSameHongKongCalendarDay,
  formatHongKongPeriodDate,
  listRecentHongKongDateKeys,
} from "../lib/hong-kong-calendar"

interface OrderContextType {
  orders: DailyOrders
  employees: EmployeeRecord[]
  activeEmployees: EmployeeRecord[]
  menuItems: ManagedMenuItem[]
  currentMember: string | null
  setCurrentMember: (member: string | null) => void
  addOrder: (order: Omit<Order, "id" | "timestamp">) => Promise<void>
  getOrdersForDate: (dateKey: string) => Order[]
  fetchOrdersForDate: (dateKey: string) => Promise<Order[]>
  getManagedMenuForWeekday: (weekday: string) => string[]
  hasOrdered: (memberId: string) => boolean
  exportToCSV: (dateKey?: string) => void
  resetOrders: () => Promise<void>
  resetOrderStatus: () => Promise<void>
  modifyOrder: (orderId: string, newOrder: Omit<Order, "id" | "timestamp">) => Promise<void>
  cancelOrder: (memberId: string) => Promise<void>
  lastResetTime: Date | null
  foodpandaOrders: FoodpandaOrder[]
  getFoodpandaOrdersForDate: (dateKey: string) => FoodpandaOrder[]
  fetchFoodpandaOrdersForDate: (dateKey: string) => Promise<FoodpandaOrder[]>
  addFpOrder: (order: Omit<FoodpandaOrder, "id" | "timestamp">) => Promise<void>
  hasFpOrdered: (memberId: string) => boolean
  cancelFpOrder: (memberId: string) => Promise<void>
  resetFpOrders: () => Promise<void>
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
const META_FP_PREFIX = "meta-fp-"

function isEmployeeMetaRow(memberId: string) {
  return memberId.startsWith(META_EMPLOYEE_PREFIX)
}

function isMenuMetaRow(memberId: string) {
  return memberId.startsWith(META_MENU_PREFIX)
}

function isFpMetaRow(memberId: string) {
  return memberId.startsWith(META_FP_PREFIX)
}

function isMetaRow(memberId: string) {
  return isEmployeeMetaRow(memberId) || isMenuMetaRow(memberId) || isFpMetaRow(memberId)
}

function sortFoodpandaOrders(orders: FoodpandaOrder[], employees: EmployeeRecord[]): FoodpandaOrder[] {
  return [...orders].sort((a, b) => {
    const ia = employees.findIndex((m) => m.id === a.member_id)
    const ib = employees.findIndex((m) => m.id === b.member_id)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

function parseFoodpandaOrdersFromRows(
  rows: { member_id: string; dish: string }[],
  employees: EmployeeRecord[],
  dateKey?: string,
): FoodpandaOrder[] {
  const byMember = new Map<string, FoodpandaOrder>()
  for (const row of rows) {
    if (!isFpMetaRow(row.member_id)) continue
    try {
      const parsed = JSON.parse(row.dish) as FoodpandaOrder
      if (!parsed?.member_id) continue
      if (dateKey && getHongKongDateKey(new Date(parsed.timestamp)) !== dateKey) continue
      byMember.set(parsed.member_id, parsed)
    } catch (err) {
      console.error("Invalid foodpanda meta row:", row, err)
    }
  }
  return sortFoodpandaOrders(Array.from(byMember.values()), employees)
}

/** PostgREST `.or()` / `like` 用: 末尾の `%` は URL では `%25` にしないとクエリが壊れる */
const LIKE_META_EMPLOYEE_PATTERN = `${META_EMPLOYEE_PREFIX}%25`
const LIKE_META_MENU_PATTERN = `${META_MENU_PREFIX}%25`
const LIKE_META_FP_PATTERN = `${META_FP_PREFIX}%25`

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
  return parts.length > 0 ? parts.join(" · ") : "不明なエラー"
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
  const [currentMember, setCurrentMember] = useState<string | null>(null)
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const [foodpandaOrders, setFoodpandaOrders] = useState<FoodpandaOrder[]>([])
  const [fpOrdersByDate, setFpOrdersByDate] = useState<DailyFoodpandaOrders>({})
  const [employeesPersistResult, setEmployeesPersistResult] = useState<EmployeesPersistResult | null>(null)
  const [menuPersistResult, setMenuPersistResult] = useState<MenuPersistResult | null>(null)

  const activeEmployees = employees.filter((employee) => employee.isActive)

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
  }, [persistEmployees, loadMasterData])

  const deleteEmployeePermanently = useCallback(async (employeeId: string) => {
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
  }, [employees, persistEmployees, loadMasterData])

  const saveMenuItems = useCallback(async (items: ManagedMenuItem[]) => {
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
  }, [persistMenuItems, loadMasterData])

  const getManagedMenuForWeekday = useCallback(
    (weekday: string) =>
      menuItems
        .filter((item) => item.weekday === weekday)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.dishName),
    [menuItems],
  )

  const loadFoodpandaOrders = useCallback(async () => {
    try {
      const todayKey = getHongKongDateKey()
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .like("member_id", `${META_FP_PREFIX}%`)
        .order("timestamp", { ascending: false })

      if (error) {
        logPostgrestError("Error loading foodpanda orders:", error)
        return
      }

      const arr = parseFoodpandaOrdersFromRows(data ?? [], employees, todayKey)
      setFoodpandaOrders(arr)
      setFpOrdersByDate((prev) => ({ ...prev, [todayKey]: arr }))
    } catch (err) {
      console.error("loadFoodpandaOrders:", err)
    }
  }, [employees])

  const persistFpOrder = useCallback(async (order: FoodpandaOrder) => {
    const rowKey = `${META_FP_PREFIX}${order.member_id}`
    const { error: deleteError } = await supabase.from("orders").delete().eq("member_id", rowKey)
    if (deleteError) {
      logPostgrestError("persistFpOrder delete:", deleteError)
      throw deleteError
    }
    const { error: insertError } = await supabase.from("orders").insert({
      member_id: rowKey,
      member_name: order.member_name,
      dish: JSON.stringify(order),
      drink: "__meta_fp__",
      timestamp: order.timestamp,
    })
    if (insertError) {
      logPostgrestError("persistFpOrder insert:", insertError)
      throw insertError
    }
  }, [])

  const addFpOrder = useCallback(
    async (order: Omit<FoodpandaOrder, "id" | "timestamp">) => {
      try {
        const newOrder: FoodpandaOrder = {
          ...order,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        }
        await persistFpOrder(newOrder)
        await loadFoodpandaOrders()
      } catch (e) {
        console.error("addFpOrder:", e)
        toast.error("foodpanda 落單保存失敗: " + (e instanceof Error ? e.message : String(e)))
        throw e
      }
    },
    [persistFpOrder, loadFoodpandaOrders],
  )

  const hasFpOrdered = useCallback((memberId: string) => {
    return foodpandaOrders.some((o) => o.member_id === memberId)
  }, [foodpandaOrders])

  const cancelFpOrder = useCallback(
    async (memberId: string) => {
      try {
        const { error } = await supabase.from("orders").delete().eq("member_id", `${META_FP_PREFIX}${memberId}`)
        if (error) {
          logPostgrestError("cancelFpOrder:", error)
          toast.error("foodpanda 取消失敗: " + formatPostgrestErrorMessage(error))
          throw error
        }
        await loadFoodpandaOrders()
      } catch (e) {
        console.error("cancelFpOrder:", e)
        throw e
      }
    },
    [loadFoodpandaOrders],
  )

  const resetFpOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.from("orders").delete().like("member_id", `${META_FP_PREFIX}%`)
      if (error) {
        logPostgrestError("resetFpOrders:", error)
        toast.error("foodpanda リセット失敗: " + formatPostgrestErrorMessage(error))
        throw error
      }
      setFoodpandaOrders([])
      await loadFoodpandaOrders()
    } finally {
      setIsLoading(false)
    }
  }, [loadFoodpandaOrders])

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
      console.log("Loading orders...")

      const dateRange = getDateRange()
      console.log("Date range:", dateRange)

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
        setError(`データ読み込みエラー: ${msg}`)
        toast.error("注文データの読み込みに失敗しました: " + msg)
        return
      }

      const orderRows = (data ?? []).filter((row) => !isMetaRow(row.member_id))
      console.log("Loaded orders data:", orderRows)

      if (!orderRows || orderRows.length === 0) {
        console.log("No orders found")
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

        console.log("Grouped orders:", groupedOrders)
        setOrders(groupedOrders)
      }
    } catch (error) {
      console.error("Error in loadOrders:", error)
      setError(`予期せぬエラー: ${error instanceof Error ? error.message : String(error)}`)
      toast.error("注文データの読み込みに失敗しました")
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [])

  // 初期ロード
  useEffect(() => {
    loadMasterData()
    loadOrders()
    loadFoodpandaOrders()

    // 定期的に更新（ポーリング）
    const intervalId = setInterval(() => {
      loadMasterData()
      loadOrders()
      loadFoodpandaOrders()
    }, 30000) // 30秒ごとに更新

    return () => clearInterval(intervalId)
  }, [loadOrders, loadMasterData, loadFoodpandaOrders])

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
            console.log("Received real-time update:", payload)
            loadMasterData()
            loadOrders()
            loadFoodpandaOrders()
          },
        )
        .subscribe((status) => {
          console.log("Supabase channel status:", status)
        })

      return () => {
        channel.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up real-time subscription:", err)
      // リアルタイム更新に失敗してもアプリは動作し続ける
    }
  }, [loadOrders, loadMasterData, loadFoodpandaOrders])

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

      console.log("Submitting order:", order)

      // タイムスタンプを明示的に設定
      const timestamp = new Date().toISOString()
      console.log("Submitting order with data:", { ...order, timestamp })

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            member_id: order.member_id,
            member_name: order.member_name,
            dish: order.dish,
            drink: order.drink,
            timestamp: timestamp,
          },
        ])
        .select()

      if (error) {
        logPostgrestError("Error adding order:", error)
        toast.error("訂單提交失敗: " + formatPostgrestErrorMessage(error))
        throw error
      }

      console.log("Order added successfully:", data)
      toast.success("訂單已成功提交")

      // データを再読み込み
      await loadOrders()
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

      const dayOrders = (data ?? []).filter((row) => !isMetaRow(row.member_id))
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
        .like("member_id", `${META_FP_PREFIX}%`)
        .gte("timestamp", from)
        .lt("timestamp", to)
        .order("timestamp", { ascending: false })

      if (error) {
        logPostgrestError("fetchFoodpandaOrdersForDate:", error)
        throw new Error(formatPostgrestErrorMessage(error))
      }

      const dayOrders = parseFoodpandaOrdersFromRows(data ?? [], employees, dateKey)
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
      XLSX.writeFile(wb, `訂單_${today.getMonth() + 1}月${today.getDate()}日.xlsx`)
    } catch (err) {
      console.error("Error exporting Excel:", err)
      toast.error("Excelのエクスポートに失敗しました")
    }
  }

  const resetOrders = async () => {
    try {
      setIsLoading(true)

      // 今日の日付の開始時刻（00:00:00）を取得
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      console.log("Resetting orders from:", today.toISOString())

      // 今日の注文のみ削除（社員・メニュー用 meta 行は同じ orders テーブルにあり、
      // timestamp が今日なら gte だけだと一緒に消えて「1人消えた」になる）
      const { error } = await supabase
        .from("orders")
        .delete()
        .gte("timestamp", today.toISOString())
        .not("member_id", "like", LIKE_META_EMPLOYEE_PATTERN)
        .not("member_id", "like", LIKE_META_MENU_PATTERN)
        .not("member_id", "like", LIKE_META_FP_PATTERN)

      if (error) {
        logPostgrestError("Error deleting orders:", error)
        toast.error("注文のリセットに失敗しました: " + formatPostgrestErrorMessage(error))
        throw error
      }

      // ローカルステートをリセット
      setOrders({})
      setCurrentMember(null)

      // リセット時間を更新
      const newResetTime = new Date()
      setLastResetTime(newResetTime)
      localStorage.setItem("lastResetTime", newResetTime.toISOString())

      console.log("Orders reset successfully at:", newResetTime)
      toast.success("注文記録がリセットされました")

      // データを再読み込み
      await loadOrders()
    } catch (error) {
      console.error("Error in resetOrders:", error)
      toast.error("注文のリセットに失敗しました")
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
    await loadOrders()
    await loadFoodpandaOrders()
  }, [loadOrders, loadFoodpandaOrders])

  const modifyOrder = async (orderId: string, newOrder: Omit<Order, "id" | "timestamp">) => {
    try {
      setIsLoading(true)
      console.log("Modifying order:", orderId, newOrder)

      // 更新前に注文が存在するか確認
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (checkError) {
        logPostgrestError("Error checking existing order:", checkError)
        toast.error("注文の確認に失敗しました: " + formatPostgrestErrorMessage(checkError))
        throw checkError
      }

      if (!existingOrder) {
        console.error("Order not found:", orderId)
        toast.error("注文が見つかりません")
        throw new Error("Order not found")
      }

      console.log("Existing order:", existingOrder)
      console.log("Updating with:", newOrder)

      // 注文を更新
      const { error } = await supabase
        .from("orders")
        .update({
          member_id: newOrder.member_id,
          member_name: newOrder.member_name,
          dish: newOrder.dish,
          drink: newOrder.drink,
        })
        .eq("id", orderId)

      if (error) {
        logPostgrestError("Error modifying order:", error)
        toast.error("注文の修正に失敗しました: " + formatPostgrestErrorMessage(error))
        throw error
      }

      console.log("Order modified successfully")
      toast.success("注文が修正されました")

      // データを再読み込み
      await loadOrders()
    } catch (error) {
      console.error("Error in modifyOrder:", error)
      toast.error("注文の修正に失敗しました")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (memberId: string) => {
    try {
      setIsLoading(true)

      const todayOrders = orders[getHongKongDateKey()] || []
      const orderToCancel = todayOrders.find((order) => order.member_id === memberId)

      if (!orderToCancel) {
        toast.error("該当する注文が見つかりません")
        return
      }

      console.log("Cancelling order:", orderToCancel.id)

      const { error } = await supabase.from("orders").delete().eq("id", orderToCancel.id)

      if (error) {
        logPostgrestError("Error cancelling order (delete):", error)
        toast.error("注文の取り消しに失敗しました: " + formatPostgrestErrorMessage(error))
        throw error
      }

      toast.success("注文が取り消されました")

      // データを再読み込み
      await loadOrders()
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("注文の取り消しに失敗しました")
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
