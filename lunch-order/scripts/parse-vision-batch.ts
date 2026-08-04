import fs from "fs"
import { parseReceiptText } from "../lib/receipt-parser"

const dir = process.argv[2] || "/tmp/receipt-vision-july"
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".txt")).sort()
const out = []
for (const f of files) {
  const text = fs.readFileSync(`${dir}/${f}`, "utf8")
  const p = parseReceiptText(text)
  out.push({
    file: f,
    dateKey: p.dateKey,
    platform: p.platform,
    foodSubtotal: p.foodSubtotal,
    deliveryFee: p.deliveryFee,
    serviceFee: p.serviceFee,
    originalBeforeDiscount: p.originalBeforeDiscount,
    finalPaid: p.finalPaid,
    itemCount: p.items.length,
    items: p.items.slice(0, 12).map((i) => i.name),
    discounts: p.discounts,
  })
}
process.stdout.write(JSON.stringify(out))
