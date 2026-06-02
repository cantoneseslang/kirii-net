import { NextResponse } from "next/server";

import {
  getMenuSwitchSettings,
  saveMenuSwitchSettings,
} from "@/lib/menu-switch-settings";
import type { MenuSchedule } from "@/data/menu-schedule";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"] as const;

function isMenusLike(value: unknown): value is MenuSchedule["menus"] {
  if (!value || typeof value !== "object") return false;
  return WEEKDAYS.every((day) => {
    const v = (value as Record<string, unknown>)[day];
    return Array.isArray(v) && v.length > 0 && v.every((item) => typeof item === "string");
  });
}

async function sendByResend(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MENU_ALERT_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
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
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API failed: ${res.status} ${body}`);
  }
}

export async function GET() {
  const settings = await getMenuSwitchSettings();
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const switchAtHk =
      typeof body?.switchAtHk === "string" ? body.switchAtHk.trim() : "";
    const targetEmail =
      typeof body?.targetEmail === "string" ? body.targetEmail.trim() : "";
    const preNotifyMinutes =
      typeof body?.preNotifyMinutes === "number" ? body.preNotifyMinutes : 10;
    const nextMenus = isMenusLike(body?.nextMenus) ? body.nextMenus : undefined;

    if (!switchAtHk) {
      return NextResponse.json(
        { success: false, error: "switchAtHk is required" },
        { status: 400 },
      );
    }
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: "targetEmail is required" },
        { status: 400 },
      );
    }
    if (Number.isNaN(new Date(switchAtHk).getTime())) {
      return NextResponse.json(
        { success: false, error: "switchAtHk is invalid datetime" },
        { status: 400 },
      );
    }

    const saved = await saveMenuSwitchSettings({
      switchAtHk,
      targetEmail,
      preNotifyMinutes,
      nextMenus,
    });

    let mailSent = false;
    let mailError: string | null = null;
    try {
      await sendByResend(
        saved.targetEmail,
        "[Menu Switch Setup Completed] 設定完了",
        `
          <h2>Menu switch setup completed</h2>
          <p>Switch at (HK): ${saved.switchAtHk}</p>
          <p>Pre-notify minutes: ${saved.preNotifyMinutes}</p>
          <p>Updated at: ${saved.updatedAt}</p>
        `,
      );
      mailSent = true;
    } catch (error) {
      mailError = error instanceof Error ? error.message : "Unknown email error";
    }

    return NextResponse.json({
      success: true,
      data: saved,
      mailSent,
      mailError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
