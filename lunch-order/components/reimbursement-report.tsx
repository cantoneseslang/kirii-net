"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { getHongKongDateKey } from "../lib/hong-kong-calendar"
import { supabase } from "../lib/supabase"
import {
  buildReimbursementMonthReport,
  formatReimbursementAmount,
  formatReimbursementTotal,
  getHongKongMonthRange,
  groupOrdersForReimbursement,
  roundUpToOneDecimal,
  type ReimbursementMonthReport,
} from "../lib/reimbursement-totals"

function currentHongKongYearMonth(): { year: number; month: number } {
  const key = getHongKongDateKey()
  const [year, month] = key.split("-").map(Number)
  return { year, month }
}

export default function ReimbursementReport() {
  const initial = useMemo(() => currentHongKongYearMonth(), [])
  const [year, setYear] = useState(initial.year)
  const [month, setMonth] = useState(initial.month)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ReimbursementMonthReport | null>(null)

  const loadReport = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try {
      const { from, to, dateKeys } = getHongKongMonthRange(y, m)

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("timestamp", from)
        .lt("timestamp", to)
        .order("timestamp", { ascending: true })

      if (error) throw error

      const { data: legacyRows, error: legacyError } = await supabase
        .from("orders")
        .select("*")
        .like("member_id", "meta-fp-%")

      if (legacyError) {
        console.error("reimbursement legacy fp fetch:", legacyError)
      }

      const { data: receiptRows, error: receiptError } = await supabase
        .from("orders")
        .select("*")
        .eq("drink", "__meta_fp_receipt__")

      if (receiptError) {
        console.error("reimbursement receipt fetch:", receiptError)
      }

      type OrderRow = {
        id?: string
        member_id: string
        member_name?: string
        dish: string
        drink?: string
        timestamp: string
        operator_member_id?: string | null
        operator_member_name?: string | null
      }
      const byId = new Map<string, OrderRow>()
      for (const row of [...(data ?? []), ...(legacyRows ?? []), ...(receiptRows ?? [])] as OrderRow[]) {
        const key = row.id ? String(row.id) : `${row.member_id}-${row.timestamp}-${row.dish}`
        if (!byId.has(key)) byId.set(key, row)
      }

      const { tingkokByDate, foodpandaByDate, receiptByDate } = groupOrdersForReimbursement(
        Array.from(byId.values()),
        dateKeys,
      )
      setReport(buildReimbursementMonthReport(y, m, tingkokByDate, foodpandaByDate, receiptByDate))
    } catch (err) {
      console.error("reimbursement load:", err)
      toast.error("報銷表載入失敗")
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReport(year, month)
  }, [year, month, loadReport])

  const shiftMonth = (delta: number) => {
    const date = new Date(year, month - 1 + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth() + 1)
  }

  const handlePrint = () => {
    window.print()
  }

  const totalA = report ? roundUpToOneDecimal(report.totalA) : 0
  const totalB = report ? roundUpToOneDecimal(report.totalB) : 0
  const grandTotal = roundUpToOneDecimal(totalA + totalB)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h3 className="font-bold text-lg text-center flex-1">汀角路茶座 及 味千拉麵</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="px-3 py-1.5 border rounded-md bg-gray-100 hover:bg-gray-200"
          >
            上月
          </button>
          <span className="min-w-[7rem] text-center font-medium">
            {year}年{month}月份
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="px-3 py-1.5 border rounded-md bg-gray-100 hover:bg-gray-200"
          >
            下月
          </button>
          <button
            type="button"
            onClick={() => void loadReport(year, month)}
            disabled={loading}
            className="px-3 py-1.5 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            重新載入
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!report || loading}
            className="px-3 py-1.5 border rounded-md bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            印刷
          </button>
        </div>
      </div>

      {loading && !report ? (
        <div className="border rounded-md p-8 text-center text-gray-500 print:hidden">載入中…</div>
      ) : !report ? (
        <div className="border rounded-md p-8 text-center text-gray-500 print:hidden">暫無資料</div>
      ) : (
        <>
          {/* 画面表示 */}
          <div className={`overflow-auto border rounded-md print:hidden ${loading ? "opacity-60" : ""}`}>
            <table className="w-full max-w-md mx-auto text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-2 text-left font-semibold border-r">
                    {report.year}年{report.month}月份
                  </th>
                  <th className="p-2 text-center font-semibold border-r w-28">
                    <div>A</div>
                    <div className="text-xs font-normal text-gray-600">汀角</div>
                  </th>
                  <th className="p-2 text-center font-semibold w-28">
                    <div>B</div>
                    <div className="text-xs font-normal text-gray-600">味千</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.days.map((row) => (
                  <tr key={row.dateKey} className="border-t">
                    <td className="p-1.5 px-2 border-r tabular-nums">{row.label}</td>
                    <td className="p-1.5 px-2 text-right border-r tabular-nums">
                      {formatReimbursementAmount(row.amountA)}
                    </td>
                    <td className="p-1.5 px-2 text-right tabular-nums">
                      {formatReimbursementAmount(row.amountB)}
                      {row.amountBFromReceipt ? (
                        <span className="ml-1 text-[10px] text-amber-700" title="收據最終額">
                          收據
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-w-md mx-auto mt-3 print:hidden">
            <div className="flex text-sm font-semibold py-2">
              <div className="w-24">共:</div>
              <div className="flex-1 text-right tabular-nums pr-2">
                {formatReimbursementTotal(report.totalA)}
              </div>
              <div className="w-28 text-right tabular-nums">
                {formatReimbursementTotal(report.totalB)}
              </div>
            </div>
            <div className="flex text-sm font-bold py-2 items-end">
              <div className="w-24">合共:</div>
              <div className="flex-1 text-center">
                <span className="inline-block tabular-nums border-b-4 border-double border-gray-900 px-6 pb-0.5">
                  {formatReimbursementTotal(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* A4 縦1ページ印刷用 */}
          <div id="print-area" className="hidden print:block">
            <div className="reimb-print-sheet">
              <h1 className="reimb-print-title">汀角路茶座 及 味千拉麵</h1>
              <table className="reimb-print-table">
                <thead>
                  <tr>
                    <th className="col-date">
                      {report.year}年{report.month}月份
                    </th>
                    <th className="col-a">
                      <div>A</div>
                      <div className="sub">汀角</div>
                    </th>
                    <th className="col-b">
                      <div>B</div>
                      <div className="sub">味千</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.days.map((row) => (
                    <tr key={row.dateKey}>
                      <td className="col-date">{row.label}</td>
                      <td className="col-a">{formatReimbursementAmount(row.amountA)}</td>
                      <td className="col-b">{formatReimbursementAmount(row.amountB)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="reimb-print-totals">
                <div className="reimb-print-subtotal">
                  <span className="lab">共:</span>
                  <span className="num-a">{formatReimbursementTotal(report.totalA)}</span>
                  <span className="num-b">{formatReimbursementTotal(report.totalB)}</span>
                </div>
                <div className="reimb-print-grand">
                  <span className="lab">合共:</span>
                  <span className="num-grand">{formatReimbursementTotal(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  )
}
