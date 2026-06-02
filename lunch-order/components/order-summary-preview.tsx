"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useOrders } from "../context/order-context"
import type { Order, FoodpandaOrder, EmployeeRecord } from "../types"
import { formatHongKongPeriodDate, getHongKongDateKey } from "../lib/hong-kong-calendar"
import OrderDateQueryBar from "./order-date-query-bar"

interface DishGroup {
  dish: string
  orders: Order[]
}

function memberIndex(memberId: string, employees: EmployeeRecord[]): number {
  const idx = employees.findIndex(m => m.id === memberId)
  return idx === -1 ? 999 : idx
}

function buildDishGroups(orderList: Order[], employees: EmployeeRecord[]): DishGroup[] {
  const sorted = [...orderList].sort((a, b) => memberIndex(a.member_id, employees) - memberIndex(b.member_id, employees))
  const groups: DishGroup[] = []
  const seen: string[] = []
  for (const o of sorted) {
    if (!seen.includes(o.dish)) seen.push(o.dish)
  }
  for (const dish of seen) {
    groups.push({ dish, orders: sorted.filter(o => o.dish === dish) })
  }
  return groups
}

function buildSummaryData(todayOrders: Order[], employees: EmployeeRecord[]) {
  const getMemberGroup = (memberId: string) => employees.find(m => m.id === memberId)?.group || "A"
  const groupA = todayOrders.filter(o => getMemberGroup(o.member_id) === "A")
  const groupB = todayOrders.filter(o => getMemberGroup(o.member_id) === "B")

  const dishGroupsA = buildDishGroups(groupA, employees)
  const dishGroupsB = buildDishGroups(groupB, employees)

  const dishCounts: Record<string, number> = {}
  const drinkCounts: Record<string, number> = {}
  for (const o of todayOrders) {
    dishCounts[o.dish] = (dishCounts[o.dish] || 0) + 1
    drinkCounts[o.drink] = (drinkCounts[o.drink] || 0) + 1
  }

  const withDish = todayOrders.filter(o => o.dish !== "未選擇")
  const drinksOnly = todayOrders.filter(o => o.dish === "未選擇")
  const mealPrice = 35
  const drinkOnlyPrice = 10
  const total = withDish.length * mealPrice + drinksOnly.length * drinkOnlyPrice
  const totalFormula = drinksOnly.length > 0
    ? `Total : ${withDish.length} x ${mealPrice} + ${drinksOnly.length} x ${drinkOnlyPrice} = ${total}`
    : `Total : ${withDish.length} x ${mealPrice} = ${total}`

  return { dishGroupsA, dishGroupsB, dishCounts, drinkCounts, totalFormula }
}

function TingkokPreview({ formattedDate, todayOrders, employees }: { formattedDate: string; todayOrders: Order[]; employees: EmployeeRecord[] }) {
  const { dishGroupsA, dishGroupsB, dishCounts, drinkCounts, totalFormula } = buildSummaryData(todayOrders, employees)
  const dishEntries = Object.entries(dishCounts)
  const drinkEntries = Object.entries(drinkCounts)
  let aNum = 0

  return (
    <div className="border rounded-md p-6 bg-white text-sm" id="print-area">
      <div className="font-bold text-base mb-4">{formattedDate}</div>
      <table className="w-full border-collapse border mb-2" style={{tableLayout: 'fixed'}}>
        <colgroup>
          <col style={{width: '5%'}} />
          <col style={{width: '15%'}} />
          <col style={{width: '28%'}} />
          <col style={{width: '8%'}} />
          <col style={{width: '44%'}} />
        </colgroup>
        <thead>
          <tr>
            <th className="text-left py-1 px-2 border">A</th>
            <th className="text-left py-1 px-2 border">姓名</th>
            <th className="text-left py-1 px-2 border">餐點</th>
            <th className="text-center py-1 px-2 border">數量</th>
            <th className="text-left py-1 px-2 border">飲品</th>
          </tr>
        </thead>
        <tbody>
          {dishGroupsA.map((group) => {
            const qty = group.orders.length
            return group.orders.map((o, i) => {
              aNum++
              return (
                <tr key={o.id}>
                  <td className="py-1 px-2 border">{aNum}</td>
                  <td className="py-1 px-2 border">{o.member_name}</td>
                  <td className="py-1 px-2 border">{o.dish}</td>
                  {i === 0 ? <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>{qty}</td> : null}
                  <td className="py-1 px-2 border align-middle">{o.drink}</td>
                </tr>
              )
            })
          })}
        </tbody>
      </table>

      <div className="mt-4 mb-2">
        <table className="w-full border-collapse border" style={{tableLayout: 'fixed'}}>
          <colgroup>
            <col style={{width: '5%'}} />
            <col style={{width: '15%'}} />
            <col style={{width: '28%'}} />
            <col style={{width: '8%'}} />
            <col style={{width: '44%'}} />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left py-1 px-2 border">B</th>
              <th className="border"></th><th className="border"></th><th className="border"></th><th className="border"></th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let bNum = 0
              return dishGroupsB.map((group) => {
                const qty = group.orders.length
                return group.orders.map((o, i) => {
                  bNum++
                  return (
                    <tr key={o.id}>
                      <td className="py-1 px-2 border">{bNum}</td>
                      <td className="py-1 px-2 border">{o.member_name}</td>
                      <td className="py-1 px-2 border">{o.dish}</td>
                      {i === 0 ? <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>{qty}</td> : null}
                      <td className="py-1 px-2 border align-middle">{o.drink}</td>
                    </tr>
                  )
                })
              })
            })()}
          </tbody>
        </table>
      </div>

      <div className="text-right font-bold mt-2 mb-6">{totalFormula}</div>

      <div className="mt-6">
        <div className="font-bold text-base mb-2 ml-8">統計</div>
        <div className="flex" style={{paddingLeft: '5%'}}>
          <div style={{width: '48%'}}>
            <div className="font-medium mb-1">餐點:</div>
            {dishEntries.map(([name, count]) => (<div key={name}>{name}: {count}件</div>))}
          </div>
          <div>
            <div className="font-medium mb-1">飲品:</div>
            {drinkEntries.map(([name, count]) => (<div key={name}>{name}: {count}件</div>))}
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
  )
}

interface FpDishGroup {
  dish: string
  orders: FoodpandaOrder[]
}

function buildFpDishGroups(orderList: FoodpandaOrder[], employees: EmployeeRecord[]): FpDishGroup[] {
  const sorted = [...orderList].sort((a, b) => memberIndex(a.member_id, employees) - memberIndex(b.member_id, employees))
  const groups: FpDishGroup[] = []
  const seen: string[] = []
  for (const o of sorted) {
    if (!seen.includes(o.dish)) seen.push(o.dish)
  }
  for (const dish of seen) {
    groups.push({ dish, orders: sorted.filter(o => o.dish === dish) })
  }
  return groups
}

function FoodpandaPreview({ formattedDate, fpOrders, employees }: { formattedDate: string; fpOrders: FoodpandaOrder[]; employees: EmployeeRecord[] }) {
  const getMemberGroup = (memberId: string) => employees.find(m => m.id === memberId)?.group || "A"
  const groupA = fpOrders.filter(o => getMemberGroup(o.member_id) === "A")
  const groupB = fpOrders.filter(o => getMemberGroup(o.member_id) === "B")

  const dishGroupsA = buildFpDishGroups(groupA, employees)
  const dishGroupsB = buildFpDishGroups(groupB, employees)

  const dishCounts: Record<string, number> = {}
  const drinkCounts: Record<string, number> = {}
  for (const o of fpOrders) {
    dishCounts[o.dish] = (dishCounts[o.dish] || 0) + 1
    drinkCounts[o.drink] = (drinkCounts[o.drink] || 0) + 1
  }
  const dishEntries = Object.entries(dishCounts)
  const drinkEntries = Object.entries(drinkCounts)

  let aNum = 0

  return (
    <div className="border rounded-md p-6 bg-white text-sm" id="print-area" style={{borderColor: '#d70f64'}}>
      <div className="font-bold text-base mb-1" style={{color: '#d70f64'}}>🐼 foodpanda 落單表</div>
      <div className="font-bold text-base mb-4">{formattedDate}</div>

      <table className="w-full border-collapse border mb-2" style={{tableLayout: 'fixed'}}>
        <colgroup>
          <col style={{width: '4%'}} />
          <col style={{width: '11%'}} />
          <col style={{width: '20%'}} />
          <col style={{width: '6%'}} />
          <col style={{width: '9%'}} />
          <col style={{width: '20%'}} />
          <col style={{width: '15%'}} />
        </colgroup>
        <thead>
          <tr>
            <th className="text-left py-1 px-2 border">A</th>
            <th className="text-left py-1 px-2 border">姓名</th>
            <th className="text-left py-1 px-2 border">餐點</th>
            <th className="text-center py-1 px-2 border">數量</th>
            <th className="text-left py-1 px-2 border">麵類</th>
            <th className="text-left py-1 px-2 border">追加</th>
            <th className="text-left py-1 px-2 border">飲品</th>
          </tr>
        </thead>
        <tbody>
          {dishGroupsA.map((group) => {
            const qty = group.orders.length
            return group.orders.map((o, i) => {
              aNum++
              return (
                <tr key={o.id}>
                  <td className="py-1 px-2 border">{aNum}</td>
                  <td className="py-1 px-2 border">{o.member_name}</td>
                  <td className="py-1 px-2 border">{o.dish}</td>
                  {i === 0 ? <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>{qty}</td> : null}
                  <td className="py-1 px-2 border">{o.noodle || "-"}</td>
                  <td className="py-1 px-2 border text-xs">{o.addOns.length > 0 ? o.addOns.join(", ") : "-"}</td>
                  <td className="py-1 px-2 border">{o.drink}</td>
                </tr>
              )
            })
          })}
        </tbody>
      </table>

      <div className="mt-4 mb-2">
        <table className="w-full border-collapse border" style={{tableLayout: 'fixed'}}>
          <colgroup>
            <col style={{width: '4%'}} />
            <col style={{width: '11%'}} />
            <col style={{width: '20%'}} />
            <col style={{width: '6%'}} />
            <col style={{width: '9%'}} />
            <col style={{width: '20%'}} />
            <col style={{width: '15%'}} />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left py-1 px-2 border">B</th>
              <th className="border"></th><th className="border"></th><th className="border"></th><th className="border"></th><th className="border"></th><th className="border"></th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let bNum = 0
              return dishGroupsB.map((group) => {
                const qty = group.orders.length
                return group.orders.map((o, i) => {
                  bNum++
                  return (
                    <tr key={o.id}>
                      <td className="py-1 px-2 border">{bNum}</td>
                      <td className="py-1 px-2 border">{o.member_name}</td>
                      <td className="py-1 px-2 border">{o.dish}</td>
                      {i === 0 ? <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>{qty}</td> : null}
                      <td className="py-1 px-2 border">{o.noodle || "-"}</td>
                      <td className="py-1 px-2 border text-xs">{o.addOns.length > 0 ? o.addOns.join(", ") : "-"}</td>
                      <td className="py-1 px-2 border">{o.drink}</td>
                    </tr>
                  )
                })
              })
            })()}
          </tbody>
        </table>
      </div>

      <div className="text-right font-bold mt-2 mb-6">合計: {fpOrders.length} 件</div>

      <div className="mt-6">
        <div className="font-bold text-base mb-2 ml-8">統計</div>
        <div className="flex" style={{paddingLeft: '5%'}}>
          <div style={{width: '48%'}}>
            <div className="font-medium mb-1">餐點:</div>
            {dishEntries.map(([name, count]) => (<div key={name}>{name}: {count}件</div>))}
          </div>
          <div>
            <div className="font-medium mb-1">飲品:</div>
            {drinkEntries.map(([name, count]) => (<div key={name}>{name}: {count}件</div>))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSummaryPreview({ onBack, restaurant = "tingkok" }: { onBack: () => void; restaurant?: "tingkok" | "foodpanda" }) {
  const { exportToCSV, employees, fetchOrdersForDate, fetchFoodpandaOrdersForDate } = useOrders()
  const todayKey = getHongKongDateKey()
  const [queriedDateKey, setQueriedDateKey] = useState<string | null>(null)
  const [dayOrders, setDayOrders] = useState<Order[]>([])
  const [fpOrders, setFpOrders] = useState<FoodpandaOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hasQueried, setHasQueried] = useState(false)

  const runDateQuery = useCallback(
    async (dateKey: string) => {
      setLoading(true)
      setLoadError(null)
      setQueriedDateKey(dateKey)
      setHasQueried(true)
      try {
        if (restaurant === "tingkok") {
          const data = await fetchOrdersForDate(dateKey)
          setDayOrders(data)
          setFpOrders([])
        } else {
          const data = await fetchFoodpandaOrdersForDate(dateKey)
          setFpOrders(data)
          setDayOrders([])
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "載入失敗")
        setDayOrders([])
        setFpOrders([])
      } finally {
        setLoading(false)
      }
    },
    [restaurant, fetchOrdersForDate, fetchFoodpandaOrdersForDate],
  )

  const didInitialQuery = useRef(false)
  useEffect(() => {
    if (didInitialQuery.current) return
    didInitialQuery.current = true
    void runDateQuery(todayKey)
  }, [runDateQuery, todayKey])

  const formattedDate = queriedDateKey ? formatHongKongPeriodDate(queriedDateKey) : ""
  const handlePrint = () => { window.print() }
  const isTingkok = restaurant === "tingkok"
  const displayOrders = isTingkok ? dayOrders : fpOrders

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4 print:hidden">
        <button onClick={onBack} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
          ← 返回
        </button>
        <OrderDateQueryBar
          todayKey={todayKey}
          defaultDateKey={todayKey}
          loading={loading}
          onQuery={runDateQuery}
        />
        {isTingkok && (
          <button
            onClick={() => queriedDateKey && exportToCSV(queriedDateKey)}
            disabled={!queriedDateKey || dayOrders.length === 0}
            className="px-4 py-2 border rounded-md bg-green-500 hover:bg-green-600 text-white font-bold disabled:opacity-50 self-end"
          >
            導出 Excel
          </button>
        )}
        <button onClick={handlePrint} className="px-4 py-2 border rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold">
          列印
        </button>
      </div>

      {!hasQueried && !loading && (
        <div className="border rounded-md p-8 text-center text-gray-500 mb-4 print:hidden">
          請選擇期日
        </div>
      )}
      {loadError && (
        <p className="text-red-600 mb-4 print:hidden">{loadError}</p>
      )}
      {hasQueried && !loading && !loadError && displayOrders.length === 0 && queriedDateKey && (
        <div className="border rounded-md p-8 text-center text-gray-500 mb-4 print:hidden">
          {formatHongKongPeriodDate(queriedDateKey)} 沒有{isTingkok ? "" : " foodpanda "}落單記錄
        </div>
      )}

      {isTingkok ? (
        dayOrders.length > 0 && queriedDateKey ? (
          <TingkokPreview formattedDate={formattedDate} todayOrders={dayOrders} employees={employees} />
        ) : null
      ) : (
        fpOrders.length > 0 && queriedDateKey ? (
          <FoodpandaPreview formattedDate={formattedDate} fpOrders={fpOrders} employees={employees} />
        ) : null
      )}
    </div>
  )
}
