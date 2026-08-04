"use client"

import { useCallback, useState } from "react"
import { toast } from "react-hot-toast"
import { useOrders } from "../context/order-context"
import { getHongKongDateKey, getHongKongDayRange } from "../lib/hong-kong-calendar"
import { ocrReceiptFile } from "../lib/receipt-ocr"
import {
  matchReceiptToOrders,
  META_FP_RECEIPT_DRINK,
  normalizeReceiptItemName,
  receiptMemberId,
  type FoodpandaReceiptRecord,
  type ParsedReceipt,
  type ReceiptMatchResult,
  type ReceiptPlatform,
} from "../lib/receipt-parser"
import { supabase } from "../lib/supabase"

type ScanDraft = {
  fileName: string
  ocrText: string
  dateKey: string
  platform: ReceiptPlatform
  finalPaid: string
  foodSubtotal: string
  deliveryFee: string
  serviceFee: string
  itemsText: string
  discountsText: string
  match: ReceiptMatchResult | null
  orderDishes: string[]
}

function numOrEmpty(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? "" : String(value)
}

function parseOptionalNumber(value: string): number | null {
  const t = value.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

async function loadFoodpandaDishesForDate(dateKey: string): Promise<string[]> {
  const { from, to } = getHongKongDayRange(dateKey)
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .gte("timestamp", from)
    .lt("timestamp", to)

  if (error) throw error

  const dishes: string[] = []
  for (const row of data ?? []) {
    if (row.drink !== "__meta_fp__" && !String(row.member_id).startsWith("meta-fp-")) continue
    if (String(row.member_id).startsWith("meta-fp-receipt-")) continue
    try {
      const parsed = JSON.parse(row.dish) as { dish?: string; timestamp?: string }
      const key = getHongKongDateKey(new Date(parsed.timestamp || row.timestamp))
      if (key !== dateKey) continue
      if (parsed.dish) dishes.push(parsed.dish)
    } catch {
      /* skip */
    }
  }
  return dishes
}

function draftFromParsed(fileName: string, parsed: ParsedReceipt, ocrText: string): ScanDraft {
  return {
    fileName,
    ocrText,
    dateKey: parsed.dateKey || getHongKongDateKey(),
    platform: parsed.platform,
    finalPaid: numOrEmpty(parsed.finalPaid),
    foodSubtotal: numOrEmpty(parsed.foodSubtotal),
    deliveryFee: numOrEmpty(parsed.deliveryFee),
    serviceFee: numOrEmpty(parsed.serviceFee),
    itemsText: parsed.items.map((i) => i.name).join("\n"),
    discountsText: parsed.discounts.map((d) => `${d.label}`).join("\n"),
    match: null,
    orderDishes: [],
  }
}

export default function ReceiptScanPanel() {
  const { currentMember } = useOrders()
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<ScanDraft | null>(null)
  const [status, setStatus] = useState("")

  const refreshMatch = useCallback(async (next: ScanDraft) => {
    try {
      const orderDishes = await loadFoodpandaDishesForDate(next.dateKey)
      const receiptItems = next.itemsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name) => ({
          name,
          normalizedName: normalizeReceiptItemName(name),
          price: null as number | null,
        }))
      const match = matchReceiptToOrders(receiptItems, orderDishes)
      setDraft({ ...next, orderDishes, match })
    } catch (err) {
      console.error(err)
      setDraft({ ...next, match: null, orderDishes: [] })
    }
  }, [])

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setStatus("")
    try {
      // 複数ある場合は先頭から順に処理し、最後に開いたものを編集対象にする
      let last: ScanDraft | null = null
      for (const file of Array.from(files)) {
        setStatus(`OCR中: ${file.name}`)
        const { text, parsed } = await ocrReceiptFile(file)
        last = draftFromParsed(file.name, parsed, text)
      }
      if (!last) return
      setStatus("當日落單と照合中…")
      await refreshMatch(last)
      toast.success("收據讀取完成（請確認後保存）")
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "收據掃描失敗")
      setDraft(null)
    } finally {
      setBusy(false)
      setStatus("")
    }
  }

  const saveReceipt = async () => {
    if (!draft) return
    const finalPaid = parseOptionalNumber(draft.finalPaid)
    if (!draft.dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(draft.dateKey)) {
      toast.error("期日を YYYY-MM-DD で入力してください")
      return
    }
    if (finalPaid == null || finalPaid < 0) {
      toast.error("最終支払額（顧客實付／總計）を入力してください")
      return
    }

    setSaving(true)
    try {
      const foodSubtotal = parseOptionalNumber(draft.foodSubtotal)
      const deliveryFee = parseOptionalNumber(draft.deliveryFee)
      const serviceFee = parseOptionalNumber(draft.serviceFee)
      const originalBeforeDiscount =
        foodSubtotal == null
          ? null
          : Math.round((foodSubtotal + (deliveryFee ?? 0) + (serviceFee ?? 0)) * 100) / 100
      const record: FoodpandaReceiptRecord = {
        dateKey: draft.dateKey,
        platform: draft.platform,
        finalPaid,
        foodSubtotal,
        deliveryFee,
        serviceFee,
        originalBeforeDiscount,
        discounts: draft.discountsText
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((label) => {
            const m = label.match(/(-?\d+(?:\.\d+)?)\s*$/)
            return { label, amount: m ? -Math.abs(Number(m[1])) : 0 }
          }),
        items: draft.itemsText
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((name) => ({
            name,
            normalizedName: normalizeReceiptItemName(name),
            price: null,
          })),
        sourceFileName: draft.fileName,
        updatedAt: new Date().toISOString(),
      }

      const memberId = receiptMemberId(draft.dateKey)
      const { from } = getHongKongDayRange(draft.dateKey)

      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("member_id", memberId)
        .eq("drink", META_FP_RECEIPT_DRINK)
        .maybeSingle()

      const payload = {
        member_id: memberId,
        member_name: "foodpanda-receipt",
        dish: JSON.stringify(record),
        drink: META_FP_RECEIPT_DRINK,
        timestamp: from,
        operator_member_id: currentMember ? String(currentMember) : null,
        operator_member_name: null,
      }

      if (existing?.id) {
        const { error } = await supabase.from("orders").update(payload).eq("id", existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("orders").insert(payload)
        if (error) throw error
      }

      toast.success(`${draft.dateKey} の最終額 $${finalPaid} を報銷表 B に適用しました`)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "保存失敗")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-lg">收據掃描（foodpanda / KeeTa）</h3>
        <p className="text-sm text-gray-600 mt-1">
          重要フィールド: <strong>期日</strong>・<strong>內容（品目）</strong>・<strong>元金額（餐點/小計）</strong>・
          <strong>割引後（顧客實付/總計）</strong>。OCRは誤読しやすいので保存前に必ず確認してください。
        </p>
      </div>

      <div className="border rounded-md p-4 bg-gray-50 space-y-3">
        <label className="block text-sm font-medium">
          收據ファイル
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            disabled={busy}
            className="mt-1 block w-full text-sm"
            onChange={(e) => {
              void handleFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </label>
        {(busy || status) && (
          <p className="text-sm text-blue-700">{busy ? status || "処理中…" : status}</p>
        )}
      </div>

      {draft && (
        <div className="border rounded-md p-4 space-y-3">
          <div className="text-sm text-gray-500">來源: {draft.fileName}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm font-semibold">
              1. 期日 (YYYY-MM-DD)
              <input
                className="mt-1 w-full border rounded px-2 py-1.5 border-amber-400 bg-amber-50"
                value={draft.dateKey}
                onChange={(e) => setDraft({ ...draft, dateKey: e.target.value })}
                onBlur={() => draft && void refreshMatch(draft)}
              />
            </label>
            <label className="text-sm">
              平台
              <select
                className="mt-1 w-full border rounded px-2 py-1.5"
                value={draft.platform}
                onChange={(e) =>
                  setDraft({ ...draft, platform: e.target.value as ReceiptPlatform })
                }
              >
                <option value="keeta">KeeTa</option>
                <option value="foodpanda">foodpanda</option>
                <option value="unknown">unknown</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              3. 元金額（餐點總價 / 小計）
              <input
                className="mt-1 w-full border rounded px-2 py-1.5 border-amber-400 bg-amber-50"
                value={draft.foodSubtotal}
                onChange={(e) => setDraft({ ...draft, foodSubtotal: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              4. 割引後（顧客實付 / 總計）→ 報銷表B
              <input
                className="mt-1 w-full border rounded px-2 py-1.5 border-amber-400 bg-amber-50"
                value={draft.finalPaid}
                onChange={(e) => setDraft({ ...draft, finalPaid: e.target.value })}
              />
            </label>
            <label className="text-sm">
              運費
              <input
                className="mt-1 w-full border rounded px-2 py-1.5"
                value={draft.deliveryFee}
                onChange={(e) => setDraft({ ...draft, deliveryFee: e.target.value })}
              />
            </label>
            <label className="text-sm">
              平台/服務費
              <input
                className="mt-1 w-full border rounded px-2 py-1.5"
                value={draft.serviceFee}
                onChange={(e) => setDraft({ ...draft, serviceFee: e.target.value })}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold">
            2. 內容（品目・1行1件）
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 min-h-[100px] font-mono text-xs border-amber-400 bg-amber-50"
              value={draft.itemsText}
              onChange={(e) => setDraft({ ...draft, itemsText: e.target.value })}
              onBlur={() => draft && void refreshMatch(draft)}
            />
          </label>

          <label className="block text-sm">
            割引行（参考）
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 min-h-[72px] font-mono text-xs"
              value={draft.discountsText}
              onChange={(e) => setDraft({ ...draft, discountsText: e.target.value })}
            />
          </label>

          {draft.match && (
            <div
              className={`rounded-md border p-3 text-sm ${
                draft.match.missingInReceipt.length === 0 && draft.match.extraInReceipt.length === 0
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="font-semibold mb-1">當日 foodpanda 落單との照会</div>
              <p>
                落單 {draft.match.orderCount} 件 / 收據餐點 {draft.match.receiptMealCount} 件 /
                一致 {draft.match.matched.length}
              </p>
              {draft.match.missingInReceipt.length > 0 && (
                <p className="mt-1 text-amber-800">
                  收據に無い落單: {draft.match.missingInReceipt.join("、")}
                </p>
              )}
              {draft.match.extraInReceipt.length > 0 && (
                <p className="mt-1 text-amber-800">
                  落單に無い收據品目: {draft.match.extraInReceipt.join("、")}
                </p>
              )}
              {draft.orderDishes.length === 0 && (
                <p className="mt-1 text-gray-600">該日の foodpanda 落單は見つかりませんでした（最終額の保存は可能）</p>
              )}
            </div>
          )}

          <details className="text-xs text-gray-500">
            <summary>OCR 原文</summary>
            <pre className="mt-2 whitespace-pre-wrap max-h-48 overflow-auto border rounded p-2 bg-gray-50">
              {draft.ocrText}
            </pre>
          </details>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveReceipt()}
              className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? "保存中…" : "確認して報銷表 B に適用"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => draft && void refreshMatch(draft)}
              className="px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200"
            >
              再照合
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
