import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const HK_TIMEZONE = "Asia/Hong_Kong"
const TARGET_EMAIL = "bestinksalesman@gmail.com"
const SWITCH_AT_HK = "2026-03-03T12:00:00+08:00"
const PRE_NOTIFY_AT_HK = "2026-03-03T11:50:00+08:00"

function getHkDateParts(date: Date): { yyyyMmDd: string; hhMm: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: HK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })

  const parts = formatter.formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    yyyyMmDd: `${get("year")}-${get("month")}-${get("day")}`,
    hhMm: `${get("hour")}:${get("minute")}`,
  }
}

async function sendByResend(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MENU_ALERT_FROM_EMAIL || "onboarding@resend.dev"

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing")
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [TARGET_EMAIL],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend API failed: ${res.status} ${body}`)
  }
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET
  const auth = request.headers.get("authorization")
  const actualToken = auth?.startsWith("Bearer ") ? auth.slice(7) : ""

  if (expectedSecret && actualToken !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const hk = getHkDateParts(now)

  // 2026-03-03 の 11:50 と 12:00 だけ送信（HK時間）
  const isTargetDay = hk.yyyyMmDd === "2026-03-03"
  const isPre = isTargetDay && hk.hhMm === "11:50"
  const isPost = isTargetDay && hk.hhMm === "12:00"

  if (!isPre && !isPost) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: "Outside notification window",
      hkNow: `${hk.yyyyMmDd} ${hk.hhMm}`,
    })
  }

  const subject = isPre
    ? "[Menu Switch Alert] 10 minutes before switch (HK 11:50)"
    : "[Menu Switch Alert] Menu switched now (HK 12:00)"

  const html = `
    <h2>Menu Switch Notification</h2>
    <p>Timezone: Asia/Hong_Kong</p>
    <p>Current HK Time: ${hk.yyyyMmDd} ${hk.hhMm}</p>
    <p>Switch time: ${SWITCH_AT_HK}</p>
    <p>Pre-notify time: ${PRE_NOTIFY_AT_HK}</p>
    <p>Status: ${isPre ? "10 minutes before switch" : "switch time reached"}</p>
  `

  try {
    await sendByResend(subject, html)
    return NextResponse.json({
      ok: true,
      sent: true,
      stage: isPre ? "pre" : "post",
      to: TARGET_EMAIL,
      hkNow: `${hk.yyyyMmDd} ${hk.hhMm}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown send error",
        hkNow: `${hk.yyyyMmDd} ${hk.hhMm}`,
      },
      { status: 500 },
    )
  }
}
