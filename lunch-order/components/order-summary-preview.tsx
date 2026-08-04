"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useOrders } from "../context/order-context"
import type { Order, FoodpandaOrder, EmployeeRecord } from "../types"
import {
  formatHongKongPeriodDate,
  getHongKongDateKey,
  getHongKongDayRange,
} from "../lib/hong-kong-calendar"
import {
  META_FP_RECEIPT_DRINK,
  parseFpReceiptRecord,
  receiptMemberId,
  type FoodpandaReceiptRecord,
} from "../lib/receipt-parser"
import {
  calculateFoodpandaOrderAmount,
  formatMoney2,
  formatReimbursementTotal,
  roundUpToOneDecimal,
  splitAmountEvenly,
} from "../lib/reimbursement-totals"
import { supabase } from "../lib/supabase"
import OrderDateQueryBar from "./order-date-query-bar"

async function loadReceiptRow(dateKey: string): Promise<{
  id: string
  record: FoodpandaReceiptRecord
} | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, dish")
    .eq("member_id", receiptMemberId(dateKey))
    .eq("drink", META_FP_RECEIPT_DRINK)
    .maybeSingle()
  if (error || !data?.dish) return null
  const record = parseFpReceiptRecord(data.dish)
  if (!record) return null
  return { id: String(data.id), record }
}

/** 誤年保存（2020-07-02 等）の画像を正しい期日へ寄せる */
async function fetchReceiptForDate(dateKey: string): Promise<FoodpandaReceiptRecord | null> {
  const primary = await loadReceiptRow(dateKey)
  if (primary?.record.imageDataUrl?.startsWith("data:image/")) {
    return primary.record
  }

  const [, mm, dd] = dateKey.split("-")
  const y = Number(dateKey.slice(0, 4))
  const altYears = [y - 6, y - 1, 2020, 2025].filter((yy, i, arr) => yy > 2019 && yy !== y && arr.indexOf(yy) === i)

  for (const altY of altYears) {
    const altKey = `${altY}-${mm}-${dd}`
    const alt = await loadReceiptRow(altKey)
    if (!alt?.record.imageDataUrl?.startsWith("data:image/")) continue

    const merged: FoodpandaReceiptRecord = {
      ...alt.record,
      ...(primary?.record ?? {}),
      dateKey,
      finalPaid: primary?.record.finalPaid ?? alt.record.finalPaid,
      imageDataUrl: alt.record.imageDataUrl,
      updatedAt: new Date().toISOString(),
    }

    const { from } = getHongKongDayRange(dateKey)
    const payload = {
      member_id: receiptMemberId(dateKey),
      member_name: "foodpanda-receipt",
      dish: JSON.stringify(merged),
      drink: META_FP_RECEIPT_DRINK,
      timestamp: from,
    }
    if (primary?.id) {
      await supabase.from("orders").update(payload).eq("id", primary.id)
    } else {
      await supabase.from("orders").insert(payload)
    }
    return merged
  }

  return primary?.record ?? null
}

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

function TingkokPreview({
  formattedDate,
  todayOrders,
  employees,
}: {
  formattedDate: string
  todayOrders: Order[]
  employees: EmployeeRecord[]
}) {
  const { dishGroupsA, dishGroupsB, dishCounts, drinkCounts, totalFormula } = buildSummaryData(todayOrders, employees)
  const dishEntries = Object.entries(dishCounts)
  const drinkEntries = Object.entries(drinkCounts)
  let aNum = 0

  return (
    <div className="border rounded-md p-6 bg-white text-sm order-sheet" id="print-area">
      <div className="font-bold text-base mb-3 order-sheet-date">{formattedDate}</div>
      <table className="w-full border-collapse border mb-2 order-sheet-table" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "44%" }} />
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
                  {i === 0 ? (
                    <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>
                      {qty}
                    </td>
                  ) : null}
                  <td className="py-1 px-2 border align-middle">{o.drink}</td>
                </tr>
              )
            })
          })}
        </tbody>
      </table>

      <div className="mt-3 mb-1">
        <table className="w-full border-collapse border order-sheet-table" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "44%" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left py-1 px-2 border">B</th>
              <th className="border"></th>
              <th className="border"></th>
              <th className="border"></th>
              <th className="border"></th>
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
                      {i === 0 ? (
                        <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>
                          {qty}
                        </td>
                      ) : null}
                      <td className="py-1 px-2 border align-middle">{o.drink}</td>
                    </tr>
                  )
                })
              })
            })()}
          </tbody>
        </table>
      </div>

      <div className="text-left font-bold mt-2 mb-4 order-sheet-total">{totalFormula}</div>

      <div className="order-sheet-stats">
        <div className="font-bold text-base mb-2 ml-4">統計</div>
        <div className="flex" style={{ paddingLeft: "5%" }}>
          <div style={{ width: "48%" }}>
            <div className="font-medium mb-1">餐點:</div>
            {dishEntries.map(([name, count]) => (
              <div key={name}>
                {name}: {count}件
              </div>
            ))}
          </div>
          <div>
            <div className="font-medium mb-1">飲品:</div>
            {drinkEntries.map(([name, count]) => (
              <div key={name}>
                {name}: {count}件
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 ml-4 order-sheet-notes">
        <span className="font-bold">註：</span>
        <span className="ml-4">香港桐井有限公司</span>
        <div className="ml-12">請留意數量和種類，</div>
        <div className="ml-12">請於約 11:30 送來，謝謝！</div>
        <div className="ml-12">電話：2264 8166</div>
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

function FoodpandaPreview({
  formattedDate,
  fpOrders,
  employees,
  receipt,
}: {
  formattedDate: string
  fpOrders: FoodpandaOrder[]
  employees: EmployeeRecord[]
  receipt: FoodpandaReceiptRecord | null
}) {
  const getMemberGroup = (memberId: string) => employees.find((m) => m.id === memberId)?.group || "A"
  const groupA = fpOrders.filter((o) => getMemberGroup(o.member_id) === "A")
  const groupB = fpOrders.filter((o) => getMemberGroup(o.member_id) === "B")

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

  // 原價 = 各人メニュー金額の合計（配送料は含めない）
  const originalTotal = fpOrders.reduce((sum, o) => sum + calculateFoodpandaOrderAmount(o), 0)
  const receiptPaid =
    receipt != null && Number.isFinite(receipt.finalPaid)
      ? roundUpToOneDecimal(receipt.finalPaid)
      : null
  // 表示順（A→B）で按分し、各行の合計が折扣後と完全一致（例 133.9→66.95+66.95）
  const displayOrder = [...dishGroupsA, ...dishGroupsB].flatMap((g) => g.orders)
  const receiptSplits =
    receiptPaid != null && displayOrder.length > 0
      ? splitAmountEvenly(receiptPaid, displayOrder.length)
      : null
  const amountByOrderId = new Map<string, number>()
  if (receiptSplits) {
    displayOrder.forEach((o, idx) => {
      amountByOrderId.set(o.id, receiptSplits[idx] ?? 0)
    })
  }
  const receiptImageUrl =
    receipt?.imageDataUrl && receipt.imageDataUrl.startsWith("data:image/")
      ? receipt.imageDataUrl
      : null
  /** 右側埋め込みは画像があるときのみ（金額だけの舊データは再スキャンが必要） */
  const hasReceiptImage = Boolean(receiptImageUrl)

  const renderFpRows = (groups: FpDishGroup[], startNum: { n: number }) =>
    groups.map((group) => {
      const qty = group.orders.length
      return group.orders.map((o, i) => {
        startNum.n++
        const menuAmount = calculateFoodpandaOrderAmount(o)
        const displayAmount = amountByOrderId.has(o.id)
          ? (amountByOrderId.get(o.id) as number)
          : menuAmount
        return (
          <tr key={o.id}>
            <td className="py-1 px-2 border">{startNum.n}</td>
            <td className="py-1 px-2 border">{o.member_name}</td>
            <td className="py-1 px-2 border">{o.dish}</td>
            {i === 0 ? (
              <td className="py-1 px-2 border text-center align-middle" rowSpan={qty}>
                {qty}
              </td>
            ) : null}
            <td className="py-1 px-2 border">{o.noodle || "-"}</td>
            <td className="py-1 px-2 border text-xs">
              {o.addOns.length > 0 ? o.addOns.join(", ") : "-"}
            </td>
            <td className="py-1 px-2 border">{o.drink}</td>
            <td className="py-1 px-2 border text-right tabular-nums">
              ${formatMoney2(displayAmount)}
            </td>
          </tr>
        )
      })
    })

  const colgroup = (
    <colgroup>
      <col style={{ width: "4%" }} />
      <col style={{ width: "10%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "6%" }} />
      <col style={{ width: "10%" }} />
      <col style={{ width: "16%" }} />
      <col style={{ width: "14%" }} />
      <col style={{ width: "10%" }} />
    </colgroup>
  )

  return (
    <div
      className={`border rounded-md p-6 bg-white text-sm order-sheet ${
        hasReceiptImage ? "order-sheet--with-receipt" : ""
      }`}
      id="print-area"
      style={{ borderColor: "#d70f64" }}
    >
      <div className={`order-sheet-grid ${hasReceiptImage ? "order-sheet-grid--receipt" : ""}`}>
        <div className="order-sheet-main">
          <div className="font-bold text-base mb-1" style={{ color: "#d70f64" }}>
            🐼 foodpanda 落單表
          </div>
          <div className="font-bold text-base mb-3 order-sheet-date">{formattedDate}</div>

          <table
            className="w-full border-collapse border mb-2 order-sheet-table"
            style={{ tableLayout: "fixed" }}
          >
            {colgroup}
            <thead>
              <tr>
                <th className="text-left py-1 px-2 border">A</th>
                <th className="text-left py-1 px-2 border">姓名</th>
                <th className="text-left py-1 px-2 border">餐點</th>
                <th className="text-center py-1 px-2 border">數量</th>
                <th className="text-left py-1 px-2 border">麵類</th>
                <th className="text-left py-1 px-2 border">追加</th>
                <th className="text-left py-1 px-2 border">飲品</th>
                <th className="text-right py-1 px-2 border">金額</th>
              </tr>
            </thead>
            <tbody>{renderFpRows(dishGroupsA, { n: 0 })}</tbody>
          </table>

          <div className="mt-3 mb-1">
            <table
              className="w-full border-collapse border order-sheet-table"
              style={{ tableLayout: "fixed" }}
            >
              {colgroup}
              <thead>
                <tr>
                  <th className="text-left py-1 px-2 border">B</th>
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                </tr>
              </thead>
              <tbody>{renderFpRows(dishGroupsB, { n: 0 })}</tbody>
            </table>
          </div>

          <div className="text-left font-bold mt-2 mb-4 order-sheet-total space-y-0.5">
            <div>
              合計: {fpOrders.length} 件　原價 ${formatMoney2(originalTotal)}
            </div>
            {receiptPaid != null ? (
              <div style={{ color: "#d70f64" }}>
                折扣後: ${formatReimbursementTotal(receiptPaid)}（收據）
              </div>
            ) : null}
          </div>

          <div className="order-sheet-stats">
            <div className="font-bold text-base mb-2 ml-4">統計</div>
            <div className="flex" style={{ paddingLeft: "5%" }}>
              <div style={{ width: "48%" }}>
                <div className="font-medium mb-1">餐點:</div>
                {dishEntries.map(([name, count]) => (
                  <div key={name}>
                    {name}: {count}件
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium mb-1">飲品:</div>
                {drinkEntries.map(([name, count]) => (
                  <div key={name}>
                    {name}: {count}件
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {hasReceiptImage ? (
          <aside className="order-sheet-receipt" aria-label="收據">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptImageUrl!}
              alt="收據"
              className="order-sheet-receipt-img"
            />
          </aside>
        ) : null}
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
  const [fpReceipt, setFpReceipt] = useState<FoodpandaReceiptRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hasQueried, setHasQueried] = useState(false)

  const querySeq = useRef(0)

  const runDateQuery = useCallback(
    async (dateKey: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return
      const seq = ++querySeq.current
      setLoading(true)
      setLoadError(null)
      setQueriedDateKey(dateKey)
      setHasQueried(true)
      try {
        if (restaurant === "tingkok") {
          const data = await fetchOrdersForDate(dateKey)
          if (seq !== querySeq.current) return
          setDayOrders(data)
          setFpOrders([])
          setFpReceipt(null)
        } else {
          // force: キャッシュで空のまま固まらないように毎回取り直す
          // 收據は注文と分離（巨大画像を注文照会に混ぜない）
          const [data, receipt] = await Promise.all([
            fetchFoodpandaOrdersForDate(dateKey, { force: true }),
            fetchReceiptForDate(dateKey),
          ])
          if (seq !== querySeq.current) return
          setFpOrders(data)
          setDayOrders([])
          setFpReceipt(receipt)
        }
      } catch (e) {
        if (seq !== querySeq.current) return
        setLoadError(e instanceof Error ? e.message : "載入失敗")
        setDayOrders([])
        setFpOrders([])
        setFpReceipt(null)
      } finally {
        if (seq === querySeq.current) setLoading(false)
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
          value={queriedDateKey ?? todayKey}
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

      {loadError && (
        <p className="text-red-600 mb-4 print:hidden">{loadError}</p>
      )}
      {loading && displayOrders.length === 0 && (
        <div className="border rounded-md p-8 text-center text-gray-500 mb-4 print:hidden">
          查詢中…
        </div>
      )}
      {hasQueried && !loading && !loadError && displayOrders.length === 0 && queriedDateKey && (
        <div className="border rounded-md p-8 text-center text-gray-500 mb-4 print:hidden">
          {formatHongKongPeriodDate(queriedDateKey)} 沒有{isTingkok ? "" : " foodpanda "}落單記錄
          <div className="text-xs mt-2 text-gray-400">（週末や注文のない日は表示されません）</div>
        </div>
      )}

      {isTingkok ? (
        dayOrders.length > 0 && queriedDateKey ? (
          <div className={loading ? "opacity-60" : undefined}>
            <TingkokPreview
              formattedDate={formattedDate}
              todayOrders={dayOrders}
              employees={employees}
            />
          </div>
        ) : null
      ) : (
        fpOrders.length > 0 && queriedDateKey ? (
          <div className={loading ? "opacity-60" : undefined}>
            <FoodpandaPreview
              formattedDate={formattedDate}
              fpOrders={fpOrders}
              employees={employees}
              receipt={fpReceipt}
            />
          </div>
        ) : null
      )}
      {!isTingkok && fpOrders.length > 0 && queriedDateKey && !loading && !fpReceipt ? (
        <p className="text-sm text-amber-700 mt-2 print:hidden">
          該期日尚未套用收據。請在「收據掃描」上傳並套用後，顯示折扣後金額與右側收據圖。
        </p>
      ) : null}
      {!isTingkok &&
      fpOrders.length > 0 &&
      queriedDateKey &&
      !loading &&
      fpReceipt &&
      !(fpReceipt.imageDataUrl && fpReceipt.imageDataUrl.startsWith("data:image/")) ? (
        <p className="text-sm text-amber-700 mt-2 print:hidden">
          已有折扣金額，但沒有收據圖。請在「收據掃描」重新上傳該日收據並套用，右側才會嵌入並可一同列印。
        </p>
      ) : null}
    </div>
  )
}
