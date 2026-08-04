/**
 * Apple Vision OCR 結果をパースし、写真1の B 列と突合検証したうえで upsert。
 * Usage:
 *   npx tsx scripts/parse-vision-batch.ts /tmp/receipt-vision-july > /tmp/parsed.json
 *   node scripts/verify-and-import-july-vision.mjs [--apply]
 */
import fs from "fs"
import { createClient } from "@supabase/supabase-js"
import { spawnSync } from "child_process"

const PHOTO1_B = {
  "2026-07-02": 178.5,
  "2026-07-03": 182.0,
  "2026-07-06": 182.9,
  "2026-07-07": 188.75,
  "2026-07-08": 161.2,
  "2026-07-09": 269.0,
  "2026-07-10": 214.5,
  "2026-07-13": 109.3,
  "2026-07-14": 185.75,
  "2026-07-15": 201.7,
  "2026-07-16": 129.5,
  "2026-07-17": 194.75,
  "2026-07-20": 113.35,
  "2026-07-21": 162.3,
  "2026-07-22": 143.9,
  "2026-07-23": 93.0,
  "2026-07-24": 154.6,
  "2026-07-27": 89.0,
  "2026-07-28": 134.88,
  "2026-07-30": 133.85,
  "2026-07-31": 174.03,
}

function near(a, b, eps = 0.06) {
  return Math.abs(a - b) <= eps
}

function dayRangeFrom(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d - 1, 16, 0, 0)).toISOString()
}

const r = spawnSync(
  "npx",
  ["tsx", "scripts/parse-vision-batch.ts", "/tmp/receipt-vision-july"],
  { cwd: "/Users/sakonhiroki/lunch-order", encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
)
if (r.status !== 0) {
  console.error(r.stderr || r.stdout)
  process.exit(1)
}
const parsed = JSON.parse(r.stdout.trim())

console.log("=== Vision OCR: 期日 / 元金額(餐點) / 割引前合計 / 割引後 ===")
for (const row of parsed) {
  console.log(
    `${String(row.file).slice(0, 24).padEnd(24)} ${String(row.dateKey ?? "-").padEnd(10)} food=${String(row.foodSubtotal ?? "-").padStart(7)} before=${String(row.originalBeforeDiscount ?? "-").padStart(7)} after=${String(row.finalPaid ?? "-").padStart(7)} n=${row.itemCount}`,
  )
}

const byDate = new Map()
for (const row of parsed) {
  if (row.dateKey?.startsWith("2026-07") && row.finalPaid != null) {
    const prev = byDate.get(row.dateKey)
    if (!prev) byDate.set(row.dateKey, row)
    else if ((prev.foodSubtotal == null && row.foodSubtotal != null) || prev.itemCount < row.itemCount) {
      byDate.set(row.dateKey, row)
    }
  }
}

// 期日が取れなくても、割引後金額が写真1と一意一致すれば紐付け
const usedDates = new Set(byDate.keys())
for (const row of parsed) {
  if (row.finalPaid == null) continue
  const hits = Object.entries(PHOTO1_B).filter(
    ([d, v]) => !usedDates.has(d) && near(row.finalPaid, v),
  )
  if (hits.length === 1) {
    const [dateKey] = hits[0]
    byDate.set(dateKey, { ...row, dateKey, dateInferredFromAmount: true })
    usedDates.add(dateKey)
    console.log(`LINK ${row.file.slice(0, 20)} final=${row.finalPaid} -> ${dateKey} (金額一意一致)`)
  }
}

console.log("\n=== 写真1 B列との突合 ===")
let match = 0
let mismatch = 0
let missing = 0
for (const [dateKey, expected] of Object.entries(PHOTO1_B)) {
  const row = byDate.get(dateKey)
  if (!row) {
    console.log(`MISS ${dateKey} expected=${expected}`)
    missing++
    continue
  }
  if (near(row.finalPaid, expected)) {
    console.log(
      `OK   ${dateKey} after=${row.finalPaid} food=${row.foodSubtotal ?? "-"} before=${row.originalBeforeDiscount ?? "-"} items=${row.itemCount}`,
    )
    match++
  } else {
    console.log(`DIFF ${dateKey} ocr=${row.finalPaid} photo1=${expected} food=${row.foodSubtotal}`)
    mismatch++
  }
}
console.log(`\n結果: OK=${match} DIFF=${mismatch} MISS=${missing} / ${Object.keys(PHOTO1_B).length}`)

if (!process.argv.includes("--apply")) {
  console.log("\n検証のみ。DB反映は --apply を付けて再実行。")
  process.exit(0)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error("Missing Supabase env")
  process.exit(1)
}
const supabase = createClient(url, key)

let ok = 0
for (const [dateKey, expected] of Object.entries(PHOTO1_B)) {
  const row = byDate.get(dateKey)
  const finalPaid = row && near(row.finalPaid, expected) ? row.finalPaid : expected
  const record = {
    dateKey,
    platform: row?.platform ?? "unknown",
    finalPaid,
    foodSubtotal: row?.foodSubtotal ?? null,
    deliveryFee: row?.deliveryFee ?? null,
    serviceFee: row?.serviceFee ?? null,
    originalBeforeDiscount: row?.originalBeforeDiscount ?? null,
    discounts: row?.discounts ?? [],
    items: (row?.items ?? []).map((name) => ({
      name,
      normalizedName: String(name).replace(/\s+/g, "").replace(/套餐/g, ""),
      price: null,
    })),
    sourceFileName: row?.file ?? "photo1-fallback",
    updatedAt: new Date().toISOString(),
    verifiedAgainstPhoto1: true,
  }
  const memberId = `meta-fp-receipt-${dateKey}`
  const payload = {
    member_id: memberId,
    member_name: "foodpanda-receipt",
    dish: JSON.stringify(record),
    drink: "__meta_fp_receipt__",
    timestamp: dayRangeFrom(dateKey),
  }
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("member_id", memberId)
    .eq("drink", "__meta_fp_receipt__")
    .maybeSingle()
  if (existing?.id) {
    const { error } = await supabase.from("orders").update(payload).eq("id", existing.id)
    if (error) console.error(dateKey, error.message)
    else {
      console.log("updated", dateKey, `after=${finalPaid}`, `food=${record.foodSubtotal}`)
      ok++
    }
  } else {
    const { error } = await supabase.from("orders").insert(payload)
    if (error) console.error(dateKey, error.message)
    else {
      console.log("inserted", dateKey, `after=${finalPaid}`, `food=${record.foodSubtotal}`)
      ok++
    }
  }
}
console.log(`Applied ${ok} days`)
