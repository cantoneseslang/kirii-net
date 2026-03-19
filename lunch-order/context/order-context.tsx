"use client"

import { useRef } from "react"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Order, FoodpandaOrder, DailyOrders } from "../types"
import { supabase } from "../lib/supabase"
import { toast } from "react-hot-toast"
import * as XLSX from "xlsx"
import { MEMBERS } from "../data/members"

interface OrderContextType {
  orders: DailyOrders
  currentMember: string | null
  setCurrentMember: (member: string | null) => void
  addOrder: (order: Omit<Order, "id" | "timestamp">) => Promise<void>
  getWeekdayOrders: (weekday: string) => Order[]
  hasOrdered: (memberId: string) => boolean
  exportToCSV: () => void
  resetOrders: () => Promise<void>
  resetOrderStatus: () => Promise<void>
  modifyOrder: (orderId: string, newOrder: Omit<Order, "id" | "timestamp">) => Promise<void>
  cancelOrder: (memberId: string) => Promise<void>
  lastResetTime: Date | null
  foodpandaOrders: FoodpandaOrder[]
  addFpOrder: (order: Omit<FoodpandaOrder, "id" | "timestamp">) => void
  hasFpOrdered: (memberId: string) => boolean
  cancelFpOrder: (memberId: string) => void
  resetFpOrders: () => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<DailyOrders>({})
  const [currentMember, setCurrentMember] = useState<string | null>(null)
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)
  const [foodpandaOrders, setFoodpandaOrders] = useState<FoodpandaOrder[]>([
    { id: "demo-1", member_id: "1", member_name: "佐近宏樹", dish: "豚骨叉燒拉麵", noodle: "拉麵", addOns: ["加配 新鮮丹麥多士"], drink: "奶茶 (凍)", timestamp: new Date().toISOString() },
    { id: "demo-2", member_id: "12", member_name: "盧良基", dish: "沙嗲豚肉野菜拉麵 (配煎蛋)", noodle: "嗌嗌粉", addOns: [], drink: "可樂", timestamp: new Date().toISOString() },
    { id: "demo-3", member_id: "14", member_name: "麥雲開", dish: "醬汁煮牛肉", noodle: "", addOns: ["迷你 叉燒拉麵"], drink: "雪碧", timestamp: new Date().toISOString() },
    { id: "demo-4", member_id: "5", member_name: "葉庭軒", dish: "豚骨叉燒拉麵", noodle: "烏冬", addOns: [], drink: "日本蘋果汁", timestamp: new Date().toISOString() },
    { id: "demo-5", member_id: "7", member_name: "林韋樂", dish: "未選擇", noodle: "", addOns: [], drink: "巨峰乳酸蘇打", timestamp: new Date().toISOString() },
  ])

  const addFpOrder = useCallback((order: Omit<FoodpandaOrder, "id" | "timestamp">) => {
    setFoodpandaOrders(prev => {
      const existing = prev.findIndex(o => o.member_id === order.member_id)
      const newOrder: FoodpandaOrder = { ...order, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newOrder
        return updated
      }
      return [...prev, newOrder]
    })
  }, [])

  const hasFpOrdered = useCallback((memberId: string) => {
    return foodpandaOrders.some(o => o.member_id === memberId)
  }, [foodpandaOrders])

  const cancelFpOrder = useCallback((memberId: string) => {
    setFoodpandaOrders(prev => prev.filter(o => o.member_id !== memberId))
  }, [])

  const resetFpOrders = useCallback(() => {
    setFoodpandaOrders([])
  }, [])

  // 日付範囲を取得する関数（タイムゾーン問題を回避）
  const getDateRange = () => {
    // 現在の日付を取得
    const now = new Date()

    // 今日の00:00:00
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

    // 明日の00:00:00
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    // 3日前の00:00:00（念のため）
    const threeDaysAgo = new Date(todayStart)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    return {
      from: threeDaysAgo.toISOString(),
      to: tomorrowStart.toISOString(),
    }
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
        console.error("Supabase error loading orders:", error)
        setError(`データ読み込みエラー: ${error.message}`)
        toast.error("注文データの読み込みに失敗しました: " + error.message)
        return
      }

      console.log("Loaded orders data:", data)

      if (!data || data.length === 0) {
        console.log("No orders found")
        setOrders({})
      } else {
        // 日付ごとにグループ化
        const groupedOrders = data.reduce((acc, order) => {
          try {
            const orderDate = new Date(order.timestamp)
            const weekday = orderDate.toLocaleDateString("zh-HK", { weekday: "long" })

            if (!acc[weekday]) acc[weekday] = []
            acc[weekday].push(order)

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
    loadOrders()

    // 定期的に更新（ポーリング）
    const intervalId = setInterval(() => {
      loadOrders()
    }, 30000) // 30秒ごとに更新

    return () => clearInterval(intervalId)
  }, [loadOrders])

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
            loadOrders()
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
  }, [loadOrders])

  const hasOrdered = useCallback(
    (memberId: string): boolean => {
      try {
        const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
        const todayOrders = orders[today] || []
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
        console.error("Error adding order:", error)
        toast.error("訂單提交失敗: " + error.message)
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

  const getWeekdayOrders = useCallback(
    (weekday: string): Order[] => {
      return orders[weekday] || []
    },
    [orders],
  )

  const exportToCSV = () => {
    try {
      const today = new Date()
      const weekdayNames = ["日", "一", "二", "三", "四", "五", "六"]
      const formattedDate = `期日:${today.getMonth() + 1}月${today.getDate()}號星期${weekdayNames[today.getDay()]}`

      const todayOrders = orders[today.toLocaleDateString("zh-HK", { weekday: "long" })] || []

      const getMemberGroup = (memberId: string) => MEMBERS.find(m => m.id === memberId)?.group || "A"
      const groupA = todayOrders.filter(o => getMemberGroup(o.member_id) === "A")
      const groupB = todayOrders.filter(o => getMemberGroup(o.member_id) === "B")

      const memberIndex = (memberId: string) => {
        const idx = MEMBERS.findIndex(m => m.id === memberId)
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

      // 今日の注文を全て削除
      const { error } = await supabase.from("orders").delete().gte("timestamp", today.toISOString())

      if (error) {
        console.error("Error deleting orders:", error)
        toast.error("注文のリセットに失敗しました: " + error.message)
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
    await loadOrders() // This will refresh the orders state
  }, [loadOrders])

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
        console.error("Error checking existing order:", checkError)
        toast.error("注文の確認に失敗しました: " + checkError.message)
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
        console.error("Error modifying order:", error)
        toast.error("注文の修正に失敗しました: " + error.message)
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

      const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
      const todayOrders = orders[today] || []
      const orderToCancel = todayOrders.find((order) => order.member_id === memberId)

      if (!orderToCancel) {
        toast.error("該当する注文が見つかりません")
        return
      }

      console.log("Cancelling order:", orderToCancel.id)

      const { error } = await supabase.from("orders").delete().eq("id", orderToCancel.id)

      if (error) {
        console.error("Error cancelling order:", error)
        toast.error("注文の取り消しに失敗しました: " + error.message)
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
        currentMember,
        setCurrentMember,
        addOrder,
        getWeekdayOrders,
        hasOrdered,
        exportToCSV,
        resetOrders,
        resetOrderStatus,
        modifyOrder,
        cancelOrder,
        lastResetTime,
        foodpandaOrders,
        addFpOrder,
        hasFpOrdered,
        cancelFpOrder,
        resetFpOrders,
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
