"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { getHongKongDateKey } from "../lib/hong-kong-calendar"
import { supabase } from "../lib/supabase"
import {
  buildReimbursementMonthReport,
  formatReimbursementAmount,
  getHongKongMonthRange,
  groupOrdersForReimbursement,
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

      // 旧形式 meta-fp-* / 收據メタは行 timestamp がずれることがあるため別途拾う
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-lg text-center flex-1">汀角路茶座 及 foodpanda</h3>
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
        </div>
      </div>

      {loading && !report ? (
        <div className="border rounded-md p-8 text-center text-gray-500">載入中…</div>
      ) : !report ? (
        <div className="border rounded-md p-8 text-center text-gray-500">暫無資料</div>
      ) : (
        <>
          <div className={`overflow-auto border rounded-md ${loading ? "opacity-60" : ""}`}>
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
                    <div className="text-xs font-normal text-gray-600">foodpanda</div>
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
                        <span className="ml-1 text-[10px] text-amber-700" title="收據最終額">收據</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-w-md mx-auto border rounded-md overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="bg-gray-50 border-b">
                  <td className="p-2 font-semibold border-r w-24">共:</td>
                  <td className="p-2 text-right border-r tabular-nums w-28">
                    {formatReimbursementAmount(report.totalA)}
                  </td>
                  <td className="p-2 text-right tabular-nums w-28">
                    {formatReimbursementAmount(report.totalB)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold border-r" colSpan={1}>
                    合共:
                  </td>
                  <td className="p-2 text-right font-bold tabular-nums border-b-4 border-double border-gray-800" colSpan={2}>
                    {formatReimbursementAmount(report.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
