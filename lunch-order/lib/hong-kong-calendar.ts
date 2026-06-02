const HK_TIME_ZONE = "Asia/Hong_Kong"

/**
 * ブラウザ／サーバーの `Date` を、香港の暦日・曜日として解釈する。
 * ランチ注文の締め・メニュー切替と同じ基準に揃える。
 */
export function isWeekendHongKong(now: Date = new Date()): boolean {
  const weekday = now.toLocaleDateString("en-US", {
    timeZone: HK_TIME_ZONE,
    weekday: "long",
  })
  return weekday === "Saturday" || weekday === "Sunday"
}

/** 香港暦日の YYYY-MM-DD（注文の日付キー） */
export function getHongKongDateKey(ref: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ref)
}

/** 香港暦日が同一か */
export function isSameHongKongCalendarDay(iso: string, ref: Date = new Date()): boolean {
  return getHongKongDateKey(new Date(iso)) === getHongKongDateKey(ref)
}

/** 落單表ヘッダー用: 期日:6月2號星期二 */
export function formatHongKongPeriodDate(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number)
  const [y] = dateKey.split("-").map(Number)
  const noonHk = new Date(Date.UTC(y, m - 1, d, 4, 0, 0))
  const weekdayNames = ["日", "一", "二", "三", "四", "五", "六"]
  const dayOfWeek = new Intl.DateTimeFormat("en-US", { timeZone: HK_TIME_ZONE, weekday: "short" }).format(noonHk)
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return `期日:${m}月${d}號星期${weekdayNames[map[dayOfWeek] ?? 0]}`
}

/** Supabase 照会用: 香港暦日 00:00〜翌日 00:00（UTC ISO） */
export function getHongKongDayRange(dateKey: string): { from: string; to: string } {
  const [y, m, d] = dateKey.split("-").map(Number)
  const from = new Date(Date.UTC(y, m - 1, d - 1, 16, 0, 0))
  const to = new Date(Date.UTC(y, m - 1, d, 16, 0, 0))
  return { from: from.toISOString(), to: to.toISOString() }
}

/** 過去 N 日分の日付キー（新しい順） */
export function listRecentHongKongDateKeys(days: number, ref: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(ref)
    d.setDate(d.getDate() - i)
    keys.push(getHongKongDateKey(d))
  }
  return keys
}
