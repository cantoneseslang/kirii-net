import { getActiveMenuSchedule } from "@/lib/menu-switch-settings";

/**
 * CRITICAL MENU UPDATE GUARD (DO NOT WEAKEN)
 *
 * Priority: Highest
 * Why:
 * - Lunch menu must update reliably every month.
 * - Even when cron/status sync is delayed, menu switching must still happen by scheduled time.
 *
 * Rules:
 * 1) Keep remote menu source enabled.
 * 2) Keep time-based activation fallback:
 *    use remote menus when switchAt has passed, even if status is not "applied" yet.
 * 3) Never remove local fallback (getActiveMenuSchedule) for resilience.
 */

type RemoteMenuPayload = {
  success?: boolean;
  data?: {
    status?: "scheduled" | "applied";
    switchAt?: string;
    timezone?: string;
    menus?: Record<string, string[]>;
  };
};

const REMOTE_MENU_ENDPOINT =
  "https://kirii-portfolio-1.vercel.app/api/lunch-menu-setting";

export async function getEffectiveMenus(): Promise<Record<string, string[]>> {
  try {
    const res = await fetch(REMOTE_MENU_ENDPOINT, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as RemoteMenuPayload;
      const remoteData = json?.data;
      const hasRemoteMenus = !!remoteData?.menus && typeof remoteData.menus === "object";
      const switchAtMs =
        typeof remoteData?.switchAt === "string" ? new Date(remoteData.switchAt).getTime() : NaN;
      const hasReachedSwitchTime = Number.isFinite(switchAtMs) && Date.now() >= switchAtMs;
      if (
        json?.success &&
        hasRemoteMenus &&
        (remoteData?.status === "applied" || hasReachedSwitchTime)
      ) {
        return remoteData.menus as Record<string, string[]>;
      }
    }
  } catch {
    // Fall back to local source when remote is unavailable.
  }

  const local = await getActiveMenuSchedule();
  return local.menus as Record<string, string[]>;
}

