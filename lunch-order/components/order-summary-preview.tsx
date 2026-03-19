"use client"

import { useOrders } from "../context/order-context"
import type { Order } from "../types"

interface DishGroup {
  dish: string
  orders: Order[]
}

function buildSummaryData(todayOrders: Order[]) {
  const withDish = todayOrders.filter(o => o.dish !== "未選擇")
  const drinksOnly = todayOrders.filter(o => o.dish === "未選擇")

  const dishGroups: DishGroup[] = []
  const dishOrder: string[] = []
  for (const o of withDish) {
    if (!dishOrder.includes(o.dish)) dishOrder.push(o.dish)
  }
  for (const dish of dishOrder) {
    dishGroups.push({ dish, orders: withDish.filter(o => o.dish === dish) })
  }

  const dishCounts: Record<string, number> = {}
  const drinkCounts: Record<string, number> = {}
  for (const o of todayOrders) {
    dishCounts[o.dish] = (dishCounts[o.dish] || 0) + 1
    drinkCounts[o.drink] = (drinkCounts[o.drink] || 0) + 1
  }

  const mealPrice = 35
  const drinkOnlyPrice = 10
  const total = withDish.length * mealPrice + drinksOnly.length * drinkOnlyPrice
  const totalFormula = drinksOnly.length > 0
    ? `Total : ${withDish.length} x ${mealPrice} + ${drinksOnly.length} x ${drinkOnlyPrice} = ${total}`
    : `Total : ${withDish.length} x ${mealPrice} = ${total}`

  return { withDish, drinksOnly, dishGroups, dishCounts, drinkCounts, totalFormula }
}

export default function OrderSummaryPreview({ onBack }: { onBack: () => void }) {
  const { orders, exportToCSV } = useOrders()

  const today = new Date()
  const weekdayNames = ["日", "一", "二", "三", "四", "五", "六"]
  const formattedDate = `期日:${today.getMonth() + 1}月${today.getDate()}號星期${weekdayNames[today.getDay()]}`
  const weekday = today.toLocaleDateString("zh-HK", { weekday: "long" })
  const todayOrders = orders[weekday] || []

  const { drinksOnly, dishGroups, dishCounts, drinkCounts, totalFormula } = buildSummaryData(todayOrders)

  const dishEntries = Object.entries(dishCounts)
  const drinkEntries = Object.entries(drinkCounts)
  const maxLen = Math.max(dishEntries.length, drinkEntries.length)

  const handlePrint = () => {
    window.print()
  }

  let aNum = 0

  return (
    <div>
      <div className="flex gap-2 mb-4 print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
        >
          ← 返回
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 border rounded-md bg-green-500 hover:bg-green-600 text-white font-bold"
        >
          導出 Excel
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 border rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold"
        >
          列印
        </button>
      </div>

      <div className="border rounded-md p-6 bg-white text-sm" id="print-area">
        <div className="font-bold text-base mb-4">{formattedDate}</div>

        <table className="w-full border-collapse mb-2">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 w-8">A</th>
              <th className="text-left py-1 w-28">姓名</th>
              <th className="text-left py-1">餐點</th>
              <th className="text-center py-1 w-16">數量</th>
              <th className="text-left py-1 w-24">飲品</th>
            </tr>
          </thead>
          <tbody>
            {dishGroups.map((group) => {
              const qty = group.orders.length
              return group.orders.map((o, i) => {
                aNum++
                return (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="py-1">{aNum}</td>
                    <td className="py-1">{o.member_name}</td>
                    <td className="py-1">{o.dish}</td>
                    {i === 0 ? (
                      <td className="py-1 text-center" rowSpan={qty}>{qty}</td>
                    ) : null}
                    <td className="py-1">{o.drink}</td>
                  </tr>
                )
              })
            })}
          </tbody>
        </table>

        <div className="mt-4 mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 w-8">B</th>
                <th className="text-left py-1 w-28"></th>
                <th className="text-left py-1"></th>
                <th className="text-center py-1 w-16"></th>
                <th className="text-left py-1 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {drinksOnly.map((o, idx) => (
                <tr key={o.id} className="border-b border-gray-100">
                  <td className="py-1">{idx + 1}</td>
                  <td className="py-1">{o.member_name}</td>
                  <td className="py-1">{o.dish}</td>
                  <td className="py-1"></td>
                  <td className="py-1">{o.drink}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right font-bold mt-2 mb-6">{totalFormula}</div>

        <div className="mt-6">
          <div className="font-bold text-base mb-2 ml-8">統計</div>
          <div className="grid grid-cols-2 gap-x-4 ml-8">
            <div>
              <div className="font-medium mb-1">餐點:</div>
              {dishEntries.map(([name, count]) => (
                <div key={name}>{name}: {count}件</div>
              ))}
            </div>
            <div>
              <div className="font-medium mb-1">飲品:</div>
              {drinkEntries.map(([name, count]) => (
                <div key={name}>{name}: {count}件</div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 ml-8">
          <span className="font-bold">註：</span>
          <span className="ml-4">香港桐井有限公司</span>
          <div className="ml-16">請留意數量和種類，</div>
          <div className="ml-16">請於約 11:30 送來，謝謝！</div>
          <div className="ml-16">電話：2264 8166</div>
        </div>
      </div>
    </div>
  )
}
