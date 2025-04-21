import type { CantoneseDataItem } from "@/types/cantonese"

// 粤拼から子音部分を抽出する関数
export function extractInitial(jyutping: string): string {
  if (!jyutping) return ""

  // 子音のリスト（画像に基づいて更新）
  const initials = ["b", "p", "m", "f", "d", "t", "n", "l", "g", "gw", "k", "kw", "ng", "h", "z", "c", "s", "j", "w"]

  // 声調を除去
  const withoutTone = jyutping.replace(/[1-6]$/, "")

  // 子音を特定
  for (const initial of initials) {
    if (withoutTone.startsWith(initial)) {
      return initial
    }
  }

  return ""
}

// 粤拼から母音部分を抽出する関数
export function extractFinal(jyutping: string): string {
  if (!jyutping) return ""

  const initial = extractInitial(jyutping)
  // 声調を除去
  const withoutTone = jyutping.replace(/[1-6]$/, "")

  // 子音がある場合は、それを除いた部分が母音
  if (initial) {
    return withoutTone.substring(initial.length)
  }

  // 子音がない場合は、全体が母音
  return withoutTone
}

// 粤拼から声調を抽出する関数
export function extractTone(jyutping: string): string {
  if (!jyutping) return ""

  const lastChar = jyutping.charAt(jyutping.length - 1)
  return /[1-6]/.test(lastChar) ? lastChar : ""
}

// 定義された順序の子音リスト（画像に基づいて更新）
export const orderedInitials = [
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "g",
  "gw",
  "k",
  "kw",
  "ng",
  "h",
  "z",
  "c",
  "s",
  "j",
  "w",
]

// 定義された順序の母音リスト（画像に基づいて更新）
export const orderedFinals = [
  "aa",
  "aai",
  "aau",
  "aam",
  "aan",
  "aang",
  "aap",
  "aat",
  "aak",
  "a",
  "ai",
  "au",
  "am",
  "an",
  "ang",
  "ap",
  "at",
  "ak",
  "e",
  "ei",
  "eu",
  "em",
  "en",
  "eng",
  "ep",
  "et",
  "ek",
  "i",
  "iu",
  "im",
  "in",
  "ing",
  "ip",
  "it",
  "ik",
  "o",
  "oi",
  "ou",
  "on",
  "ong",
  "ot",
  "ok",
  "u",
  "ui",
  "un",
  "ung",
  "ut",
  "uk",
  "yu",
  "yun",
  "yut",
]

// データから一意の子音リストを取得する関数
export function getUniqueInitials(data: CantoneseDataItem[]): string[] {
  if (!data || !Array.isArray(data)) return []

  const initials = data
    .filter((item) => item && item.jyutping)
    .map((item) => extractInitial(item.jyutping))
    .filter(Boolean)

  const uniqueInitials = Array.from(new Set(initials))

  // 定義された順序でソート
  return orderedInitials.filter((initial) => uniqueInitials.includes(initial))
}

// データから一意の母音リストを取得する関数
export function getUniqueFinals(data: CantoneseDataItem[]): string[] {
  if (!data || !Array.isArray(data)) return []

  const finals = data
    .filter((item) => item && item.jyutping)
    .map((item) => extractFinal(item.jyutping))
    .filter(Boolean)

  const uniqueFinals = Array.from(new Set(finals))

  // 定義された順序でソート
  return orderedFinals.filter((final) => uniqueFinals.includes(final))
}

// データを母音と子音のマップに変換する関数
export function createPronunciationMap(data: CantoneseDataItem[]): Record<string, Record<string, CantoneseDataItem>> {
  if (!data || !Array.isArray(data)) return {}

  const map: Record<string, Record<string, CantoneseDataItem>> = {}

  data.forEach((item) => {
    if (!item || !item.jyutping) return

    const final = extractFinal(item.jyutping)
    const initial = extractInitial(item.jyutping)

    if (!final || !initial) return

    if (!map[final]) {
      map[final] = {}
    }

    map[final][initial] = item
  })

  return map
}
