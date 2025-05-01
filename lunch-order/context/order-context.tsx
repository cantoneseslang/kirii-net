"use client"

import { useRef } from "react"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Order, DailyOrders } from "../types"
import { supabase } from "../lib/supabase"
import { toast } from "react-hot-toast"

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
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<DailyOrders>({})
  const [currentMember, setCurrentMember] = useState<string | null>(null)
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

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
      const formattedDate = `期日:${today.getMonth() + 1}月${today.getDate()}號${today.toLocaleDateString("zh-HK", { weekday: "long" })}`

      const csvRows = []
      csvRows.push(formattedDate)
      csvRows.push("姓名,餐點,飲品")

      const todayOrders = orders[today.toLocaleDateString("zh-HK", { weekday: "long" })] || []

      for (const order of todayOrders) {
        const values = [order.member_name, order.dish, order.drink].map((value) => `"${value}"`)
        csvRows.push(values.join(","))
      }

      const csvData = csvRows.join("\n")
      const encoder = new TextEncoder()
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]) // UTF-8 BOM
      const csvContent = encoder.encode(csvData)

      const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.setAttribute("href", url)
      a.setAttribute("download", `訂單_${today.getMonth() + 1}月${today.getDate()}日.csv`)
      a.click()
    } catch (err) {
      console.error("Error exporting CSV:", err)
      toast.error("CSVのエクスポートに失敗しました")
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
