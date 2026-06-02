import { NextResponse } from "next/server"
import { getMenuSwitchSettings } from "@/lib/menu-switch-settings"

export const dynamic = "force-dynamic"

const HK_TIMEZONE = "Asia/Hong_Kong"

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

async function sendByResend(to: string, subject: string, html: string): Promise<void> {
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
      to: [to],
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

  const settings = await getMenuSwitchSettings()
  const switchDate = new Date(settings.switchAtHk)
  if (Number.isNaN(switchDate.getTime())) {
    return NextResponse.json(
      { ok: false, error: "Invalid switchAtHk in settings" },
      { status: 500 },
    )
  }

  const preNotifyDate = new Date(
    switchDate.getTime() - Math.max(0, settings.preNotifyMinutes) * 60 * 1000,
  )
  const switchHk = getHkDateParts(switchDate)
  const preHk = getHkDateParts(preNotifyDate)
  const isPre = hk.yyyyMmDd === preHk.yyyyMmDd && hk.hhMm === preHk.hhMm
  const isPost = hk.yyyyMmDd === switchHk.yyyyMmDd && hk.hhMm === switchHk.hhMm

  if (!isPre && !isPost) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: "Outside notification window",
      hkNow: `${hk.yyyyMmDd} ${hk.hhMm}`,
      switchAtHk: settings.switchAtHk,
      preNotifyMinutes: settings.preNotifyMinutes,
    })
  }

  const subject = isPre
    ? `[Menu Switch Alert] ${settings.preNotifyMinutes} minutes before switch`
    : "[Menu Switch Alert] Menu switched now"

  const html = `
    <h2>Menu Switch Notification</h2>
    <p>Timezone: Asia/Hong_Kong</p>
    <p>Current HK Time: ${hk.yyyyMmDd} ${hk.hhMm}</p>
    <p>Switch time: ${settings.switchAtHk}</p>
    <p>Pre-notify minutes: ${settings.preNotifyMinutes}</p>
    <p>Status: ${isPre ? "10 minutes before switch" : "switch time reached"}</p>
  `

  try {
    await sendByResend(settings.targetEmail, subject, html)
    return NextResponse.json({
      ok: true,
      sent: true,
      stage: isPre ? "pre" : "post",
      to: settings.targetEmail,
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
