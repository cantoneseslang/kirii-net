"use client"

import { useState } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"
import OrderSummaryPreview from "./order-summary-preview"
import EmployeeListManager from "./employee-list-manager"
import MenuListManager from "./menu-list-manager"
import Link from "next/link"

type AdminTab = "tingkok" | "foodpanda"
type AdminSubview = "orders" | "employees" | "menus"

export default function AdminPanel() {
  const { orders, getWeekdayOrders, exportToCSV, resetOrders, resetOrderStatus, lastResetTime, foodpandaOrders, resetFpOrders } = useOrders()
  const [isResetting, setIsResetting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [adminTab, setAdminTab] = useState<AdminTab>("tingkok")
  const [adminSubview, setAdminSubview] = useState<AdminSubview>("orders")

  const handleReset = async () => {
    try {
      setIsResetting(true)
      if (adminTab === "tingkok") {
        await resetOrders()
      } else {
        resetFpOrders()
      }
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

  const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
  const todayOrders = getWeekdayOrders(today)
  const weekdays = Object.keys(orders)

  if (showPreview) {
    return <OrderSummaryPreview onBack={() => setShowPreview(false)} restaurant={adminTab} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/monthly-summary"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          每月訂單統計
        </Link>
        <button
          onClick={() => setAdminSubview("employees")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "employees" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          員工名單
        </button>
        <button
          onClick={() => setAdminSubview("menus")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "menus" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          菜單名單
        </button>
        <button
          onClick={() => setAdminSubview("orders")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "orders" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          訂單管理
        </button>
      </div>

      {adminSubview === "orders" && (
        <>
      <div className="grid grid-cols-2 gap-0 border rounded-md overflow-hidden mb-4">
        <button
          onClick={() => setAdminTab("tingkok")}
          className={`py-3 text-center font-bold transition-colors ${
            adminTab === "tingkok" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          汀角路茶座
        </button>
        <button
          onClick={() => setAdminTab("foodpanda")}
          className={`py-3 text-center font-bold transition-colors ${
            adminTab === "foodpanda" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={adminTab === "foodpanda" ? { backgroundColor: "#d70f64" } : {}}
        >
          🐼 foodpanda
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            更新
          </button>
          <button onClick={() => setShowPreview(true)} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            導出落單表
          </button>
        </div>
        {showConfirmReset ? (
          <div className="flex space-x-2">
            <button onClick={() => setShowConfirmReset(false)} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
              取消Reset
            </button>
            <button onClick={handleReset} disabled={isResetting} className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50">
              Reset
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConfirmReset(true)} className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white">
            Reset
          </button>
        )}
      </div>

      {lastResetTime && adminTab === "tingkok" && <p className="text-sm text-gray-500">最終リセット: {lastResetTime.toLocaleString("zh-HK")}</p>}

      {adminTab === "tingkok" && (
        <>
          {weekdays.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-gray-500">沒有落單記錄</div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <button className="px-4 py-2 rounded-md bg-blue-500 text-white">{today}</button>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">{today}の注文 ({todayOrders.length}件)</h3>
                {todayOrders.length === 0 ? (
                  <div className="text-center text-gray-500 p-4">沒有落單記錄</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {todayOrders.map((order) => (
                        <div key={order.id} className="border rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between">
                            <h4 className="font-bold">{order.member_name}</h4>
                            <span className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleTimeString("zh-HK")}</span>
                          </div>
                          <div className="mt-2">
                            <p><span className="font-medium">餐點:</span> {order.dish}</p>
                            <p><span className="font-medium">飲品:</span> {order.drink}</p>
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
                            {Object.entries(todayOrders.reduce((acc, order) => { acc[order.dish] = (acc[order.dish] || 0) + 1; return acc }, {} as Record<string, number>)).map(([dish, count]) => (
                              <li key={dish}>{dish}: {count}件</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">飲品:</h5>
                          <ul className="space-y-1">
                            {Object.entries(todayOrders.reduce((acc, order) => { acc[order.drink] = (acc[order.drink] || 0) + 1; return acc }, {} as Record<string, number>)).map(([drink, count]) => (
                              <li key={drink}>{drink}: {count}件</li>
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
        </>
      )}

      {adminTab === "foodpanda" && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg" style={{ color: '#d70f64' }}>
            🐼 foodpanda 注文 ({foodpandaOrders.length}件)
          </h3>
          {foodpandaOrders.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-gray-500">沒有 foodpanda 落單記錄</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodpandaOrders.map((order) => (
                  <div key={order.id} className="border rounded-md p-4" style={{ backgroundColor: '#fff0f5', borderColor: '#d70f64' }}>
                    <div className="flex justify-between">
                      <h4 className="font-bold">{order.member_name}</h4>
                      <span className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleTimeString("zh-HK")}</span>
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                      <p><span className="font-medium">餐點:</span> {order.dish}</p>
                      {order.noodle && <p><span className="font-medium">麵類:</span> {order.noodle}</p>}
                      {order.addOns.length > 0 && <p><span className="font-medium">追加:</span> {order.addOns.join(", ")}</p>}
                      <p><span className="font-medium">飲品:</span> {order.drink}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-md" style={{ backgroundColor: '#fff0f5' }}>
                <h4 className="font-bold mb-2" style={{ color: '#d70f64' }}>統計</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-1">餐點:</h5>
                    <ul className="space-y-1">
                      {Object.entries(foodpandaOrders.reduce((acc, o) => { acc[o.dish] = (acc[o.dish] || 0) + 1; return acc }, {} as Record<string, number>)).map(([dish, count]) => (
                        <li key={dish}>{dish}: {count}件</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">飲品:</h5>
                    <ul className="space-y-1">
                      {Object.entries(foodpandaOrders.reduce((acc, o) => { acc[o.drink] = (acc[o.drink] || 0) + 1; return acc }, {} as Record<string, number>)).map(([drink, count]) => (
                        <li key={drink}>{drink}: {count}件</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}

      {adminSubview === "employees" && <EmployeeListManager />}
      {adminSubview === "menus" && <MenuListManager />}
    </div>
  )
}
