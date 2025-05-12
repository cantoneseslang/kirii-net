"use client"

import { useState } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"

export default function AdminPanel() {
  const { orders, getWeekdayOrders, exportToCSV, resetOrders, resetOrderStatus, lastResetTime } = useOrders()
  const [isResetting, setIsResetting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  const handleReset = async () => {
    try {
      setIsResetting(true)
      await resetOrders()
      toast.success("注文記録がリセットされました")
      setShowConfirmReset(false)
    } catch (error) {
      console.error("Error resetting orders:", error)
      toast.error("リセットに失敗しました")
    } finally {
      setIsResetting(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await resetOrderStatus()
      toast.success("注文状況が更新されました")
    } catch (error) {
      console.error("Error refreshing orders:", error)
      toast.error("更新に失敗しました")
    } finally {
      setIsRefreshing(false)
    }
  }

  const weekdays = Object.keys(orders)
  const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
  const todayOrders = getWeekdayOrders(today)

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            更新
          </button>
          <button onClick={exportToCSV} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            導出excel
          </button>
        </div>
        {showConfirmReset ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
            >
              取消Reset
            </button>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white"
          >
            Reset
          </button>
        )}
      </div>

      {lastResetTime && <p className="text-sm text-gray-500">最終リセット: {lastResetTime.toLocaleString("zh-HK")}</p>}

      {weekdays.length === 0 ? (
        <div className="border rounded-md p-8 text-center text-gray-500">沒有落單記錄</div>
      ) : (
        <div className="space-y-4">
          <div className="border-b pb-2">
              <button
              className="px-4 py-2 rounded-md bg-blue-500 text-white"
              >
              {today}
              </button>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">
              {today}の注文 ({todayOrders.length}件)
            </h3>

            {todayOrders.length === 0 ? (
              <div className="text-center text-gray-500 p-4">沒有落單記錄</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayOrders.map((order) => (
                    <div key={order.id} className="border rounded-md p-4 bg-gray-50">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{order.member_name}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(order.timestamp).toLocaleTimeString("zh-HK")}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p>
                          <span className="font-medium">餐點:</span> {order.dish}
                        </p>
                        <p>
                          <span className="font-medium">飲品:</span> {order.drink}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-100 p-4 rounded-md">
                  <h4 className="font-bold mb-2">統計</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-1">餐點:</h5>
                      <ul className="space-y-1">
                        {Object.entries(
                          todayOrders.reduce(
                            (acc, order) => {
                              acc[order.dish] = (acc[order.dish] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).map(([dish, count]) => (
                          <li key={dish}>
                            {dish}: {count}件
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">飲品:</h5>
                      <ul className="space-y-1">
                        {Object.entries(
                          todayOrders.reduce(
                            (acc, order) => {
                              acc[order.drink] = (acc[order.drink] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).map(([drink, count]) => (
                          <li key={drink}>
                            {drink}: {count}件
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
