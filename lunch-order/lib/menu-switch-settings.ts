import { promises as fs } from "fs";
import path from "path";

import { CURRENT_MENU, NEXT_MENU, type MenuSchedule } from "@/data/menu-schedule";

const SETTINGS_PATH = path.join(process.cwd(), "data", "menu-switch-settings.json");

export interface MenuSwitchSettings {
  switchAtHk: string;
  preNotifyMinutes: number;
  targetEmail: string;
  nextMenus: MenuSchedule["menus"] | null;
  updatedAt: string;
}

const DEFAULT_SETTINGS: MenuSwitchSettings = {
  switchAtHk: NEXT_MENU.startDate || "2026-03-03T12:00:00+08:00",
  preNotifyMinutes: 10,
  targetEmail: "bestinksalesman@gmail.com",
  nextMenus: null,
  updatedAt: new Date(0).toISOString(),
};

const WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"] as const;

function isMenusLike(value: unknown): value is MenuSchedule["menus"] {
  if (!value || typeof value !== "object") return false;
  return WEEKDAYS.every((day) => {
    const v = (value as Record<string, unknown>)[day];
    return Array.isArray(v) && v.length > 0 && v.every((item) => typeof item === "string");
  });
}

function parseSettings(raw: unknown): MenuSwitchSettings {
  const value = raw as Partial<MenuSwitchSettings> | null;
  return {
    switchAtHk:
      typeof value?.switchAtHk === "string" && value.switchAtHk.length > 0
        ? value.switchAtHk
        : DEFAULT_SETTINGS.switchAtHk,
    preNotifyMinutes:
      typeof value?.preNotifyMinutes === "number" && value.preNotifyMinutes >= 0
        ? Math.floor(value.preNotifyMinutes)
        : DEFAULT_SETTINGS.preNotifyMinutes,
    targetEmail:
      typeof value?.targetEmail === "string" && value.targetEmail.length > 0
        ? value.targetEmail
        : DEFAULT_SETTINGS.targetEmail,
    nextMenus: isMenusLike(value?.nextMenus) ? value.nextMenus : null,
    updatedAt:
      typeof value?.updatedAt === "string" && value.updatedAt.length > 0
        ? value.updatedAt
        : new Date().toISOString(),
  };
}

export async function getMenuSwitchSettings(): Promise<MenuSwitchSettings> {
  try {
    const file = await fs.readFile(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(file);
    return parseSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveMenuSwitchSettings(
  input: Pick<MenuSwitchSettings, "switchAtHk" | "preNotifyMinutes" | "targetEmail"> &
    Partial<Pick<MenuSwitchSettings, "nextMenus">>,
): Promise<MenuSwitchSettings> {
  const current = await getMenuSwitchSettings();
  const next = parseSettings({
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  });
  await fs.writeFile(SETTINGS_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

export async function getActiveMenuSchedule(now: Date = new Date()) {
  const settings = await getMenuSwitchSettings();
  const switchMs = new Date(settings.switchAtHk).getTime();
  const nowMs = now.getTime();
  const schedule = Number.isFinite(switchMs) && nowMs >= switchMs ? NEXT_MENU : CURRENT_MENU;
  const menus = Number.isFinite(switchMs) && nowMs >= switchMs && settings.nextMenus
    ? settings.nextMenus
    : schedule.menus;
  return {
    schedule,
    menus,
    settings,
  };
}
