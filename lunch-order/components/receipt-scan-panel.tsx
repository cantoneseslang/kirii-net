"use client"

import { useCallback, useState } from "react"
import { toast } from "react-hot-toast"
import { useOrders } from "../context/order-context"
import { getHongKongDateKey, getHongKongDayRange } from "../lib/hong-kong-calendar"
import { fileToReceiptImageDataUrl } from "../lib/receipt-image"
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
import { roundUpToOneDecimal } from "../lib/reimbursement-totals"
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
  engine: "vision" | "tesseract-fallback"
  dateFromReceipt: boolean
  imageDataUrl: string | null
}

function numOrEmpty(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ""
  return String(roundUpToOneDecimal(value))
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

function draftFromOcr(
  fileName: string,
  parsed: ParsedReceipt,
  ocrText: string,
  engine: "vision" | "tesseract-fallback",
  imageDataUrl: string | null,
): ScanDraft {
  // 期日は收據から読めた場合のみ自動入力（今日の日付で埋めない）
  return {
    fileName,
    ocrText,
    dateKey: parsed.dateKey || "",
    platform: parsed.platform,
    finalPaid: numOrEmpty(parsed.finalPaid),
    foodSubtotal: numOrEmpty(parsed.foodSubtotal),
    deliveryFee: numOrEmpty(parsed.deliveryFee),
    serviceFee: numOrEmpty(parsed.serviceFee),
    itemsText: parsed.items.map((i) => i.name).join("\n"),
    discountsText: parsed.discounts.map((d) => d.label).join("\n"),
    match: null,
    orderDishes: [],
    engine,
    dateFromReceipt: Boolean(parsed.dateKey),
    imageDataUrl,
  }
}

export default function ReceiptScanPanel() {
  const { currentMember } = useOrders()
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<ScanDraft | null>(null)
  const [status, setStatus] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)

  const refreshMatch = useCallback(async (next: ScanDraft) => {
    if (!next.dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(next.dateKey)) {
      setDraft({ ...next, match: null, orderDishes: [] })
      return
    }
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
      let last: ScanDraft | null = null
      let lastFile: File | null = null
      for (const file of Array.from(files)) {
        setStatus(`Vision 讀取中（繁體中文／從收據判定期日）: ${file.name}`)
        const result = await ocrReceiptFile(file)
        last = draftFromOcr(file.name, result.parsed, result.text, result.engine, result.imageDataUrl)
        lastFile = file
        setPreviewUrl(result.imageDataUrl)
      }
      if (!last || !lastFile) return
      setSourceFile(lastFile)
      if (last.dateKey) {
        setStatus(`對照 ${last.dateKey} foodpanda 落單…`)
        await refreshMatch(last)
      } else {
        setDraft(last)
      }
      if (!last.dateFromReceipt) {
        toast.error("未能從收據讀取期日 — 請手動核對後填寫 YYYY-MM-DD")
      } else if (!last.finalPaid) {
        toast.error(`期日 ${last.dateKey} 已讀取，但金額未辨識 — 請手動填寫折扣後金額`)
      } else {
        toast.success(
          `已從收據讀取期日 ${last.dateKey}` +
            (last.engine === "vision" ? "（Vision）" : "（備援 OCR・請仔細核對）"),
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "收據掃描失敗")
      setDraft(null)
      setSourceFile(null)
    } finally {
      setBusy(false)
      setStatus("")
    }
  }

  const saveReceipt = async () => {
    if (!draft) return
    const rawFinal = parseOptionalNumber(draft.finalPaid)
    if (!draft.dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(draft.dateKey)) {
      toast.error("請輸入正確期日 YYYY-MM-DD")
      return
    }
    if (rawFinal == null || rawFinal < 0) {
      toast.error("請輸入折扣後金額（顧客實付／總計）")
      return
    }
    const finalPaid = roundUpToOneDecimal(rawFinal)

    setSaving(true)
    try {
      const foodSubtotalRaw = parseOptionalNumber(draft.foodSubtotal)
      const deliveryFeeRaw = parseOptionalNumber(draft.deliveryFee)
      const serviceFeeRaw = parseOptionalNumber(draft.serviceFee)
      const foodSubtotal = foodSubtotalRaw == null ? null : roundUpToOneDecimal(foodSubtotalRaw)
      const deliveryFee = deliveryFeeRaw == null ? null : roundUpToOneDecimal(deliveryFeeRaw)
      const serviceFee = serviceFeeRaw == null ? null : roundUpToOneDecimal(serviceFeeRaw)
      const originalBeforeDiscount =
        foodSubtotal == null
          ? null
          : roundUpToOneDecimal(foodSubtotal + (deliveryFee ?? 0) + (serviceFee ?? 0))

      setStatus("壓縮收據圖片…")
      let imageDataUrl: string | null = draft.imageDataUrl
      if (!imageDataUrl && sourceFile) {
        imageDataUrl = await fileToReceiptImageDataUrl(sourceFile)
      } else if (!imageDataUrl && previewUrl?.startsWith("data:image/")) {
        imageDataUrl = previewUrl
      }

      const memberId = receiptMemberId(draft.dateKey)
      const { from } = getHongKongDayRange(draft.dateKey)

      const { data: existing } = await supabase
        .from("orders")
        .select("id, dish")
        .eq("member_id", memberId)
        .eq("drink", META_FP_RECEIPT_DRINK)
        .maybeSingle()

      // 再套用で画像なしの場合は既存画像を維持
      if (!imageDataUrl && existing?.dish) {
        try {
          const prev = JSON.parse(existing.dish) as FoodpandaReceiptRecord
          if (prev.imageDataUrl) imageDataUrl = prev.imageDataUrl
        } catch {
          /* ignore */
        }
      }

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
        imageDataUrl,
      }

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

      toast.success(
        imageDataUrl
          ? `已套用 ${draft.dateKey}（含收據圖）至報銷表 B／落單表`
          : `已套用 ${draft.dateKey} 折扣後金額 $${finalPaid.toFixed(1)} 至報銷表 B`,
      )
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "儲存失敗")
    } finally {
      setSaving(false)
      setStatus("")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-lg">收據掃描</h3>
      </div>

      <div className="border rounded-md p-4 bg-gray-50 space-y-3">
        <label className="block text-sm font-medium">
          上傳收據（JPEG / PDF）
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
          <p className="text-sm text-blue-700">{busy ? status || "處理中…" : status}</p>
        )}
      </div>

      {draft && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-start">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="收據預覽"
                className="w-40 max-h-56 object-contain border rounded bg-white"
              />
            ) : null}
            <div className="text-sm text-gray-600 flex-1 min-w-[12rem]">
              <div>
                來源檔案：<span className="font-medium text-gray-800">{draft.fileName}</span>
              </div>
              <div className="mt-1">
                引擎：
                <span className="font-medium text-gray-800">
                  {draft.engine === "vision" ? "Vision AI（繁中收據）" : "Tesseract 備援（請仔細核對）"}
                </span>
              </div>
              {draft.dateFromReceipt ? (
                <div className="mt-1 text-green-700 font-medium">
                  期日已從收據讀取：{draft.dateKey}
                </div>
              ) : (
                <div className="mt-1 text-red-600 font-medium">
                  未能從收據判定期日 — 請看圖手動填寫
                </div>
              )}
            </div>
          </div>

          <div
            className={`rounded-md border p-3 text-sm ${
              draft.dateFromReceipt && draft.finalPaid
                ? "border-amber-300 bg-amber-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <div className="font-semibold mb-2">必填核對（套用至報銷表 B）</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="font-medium">
                期日 (YYYY-MM-DD) — 必須與收據落單日一致
                <input
                  className={`mt-1 w-full border rounded px-2 py-1.5 bg-white ${
                    draft.dateFromReceipt ? "" : "border-red-400 ring-1 ring-red-300"
                  }`}
                  value={draft.dateKey}
                  placeholder="從收據讀取，例 2026-07-15"
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      dateKey: e.target.value,
                      dateFromReceipt: /^\d{4}-\d{2}-\d{2}$/.test(e.target.value),
                    })
                  }
                  onBlur={() => draft && void refreshMatch(draft)}
                />
              </label>
              <label className="font-medium">
                平台
                <select
                  className="mt-1 w-full border rounded px-2 py-1.5 bg-white"
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
              <label className="font-medium">
                原金額（餐點總價／小計）
                <input
                  className="mt-1 w-full border rounded px-2 py-1.5 bg-white"
                  value={draft.foodSubtotal}
                  onChange={(e) => setDraft({ ...draft, foodSubtotal: e.target.value })}
                />
              </label>
              <label className="font-medium">
                折扣後金額（顧客實付／總計）
                <input
                  className="mt-1 w-full border rounded px-2 py-1.5 bg-white font-bold"
                  value={draft.finalPaid}
                  onChange={(e) => setDraft({ ...draft, finalPaid: e.target.value })}
                />
              </label>
            </div>
          </div>

          <label className="block text-sm font-medium">
            內容（餐點，一行一項）
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 min-h-[100px] font-mono text-xs"
              value={draft.itemsText}
              onChange={(e) => setDraft({ ...draft, itemsText: e.target.value })}
              onBlur={() => draft && void refreshMatch(draft)}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              運費
              <input
                className="mt-1 w-full border rounded px-2 py-1.5"
                value={draft.deliveryFee}
                onChange={(e) => setDraft({ ...draft, deliveryFee: e.target.value })}
              />
            </label>
            <label className="text-sm">
              平台／服務費
              <input
                className="mt-1 w-full border rounded px-2 py-1.5"
                value={draft.serviceFee}
                onChange={(e) => setDraft({ ...draft, serviceFee: e.target.value })}
              />
            </label>
          </div>

          <label className="block text-sm text-gray-600">
            折扣說明（參考）
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5 min-h-[64px] font-mono text-xs"
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
              <div className="font-semibold mb-1">與當日 foodpanda 落單對照</div>
              <p>
                落單 {draft.match.orderCount} 件／收據餐點 {draft.match.receiptMealCount} 件／一致{" "}
                {draft.match.matched.length}
              </p>
              {draft.match.missingInReceipt.length > 0 && (
                <p className="mt-1 text-amber-800">
                  收據缺少：{draft.match.missingInReceipt.join("、")}
                </p>
              )}
              {draft.match.extraInReceipt.length > 0 && (
                <p className="mt-1 text-amber-800">
                  落單沒有：{draft.match.extraInReceipt.join("、")}
                </p>
              )}
              {draft.orderDishes.length === 0 && (
                <p className="mt-1 text-gray-600">該日沒有 foodpanda 落單（仍可儲存折扣後金額）</p>
              )}
            </div>
          )}

          <details className="text-xs text-gray-500">
            <summary>OCR 原文（除錯用）</summary>
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
              {saving ? "儲存中…" : "確認並套用至報銷表 B"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => draft && void refreshMatch(draft)}
              className="px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200"
            >
              重新對照
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
