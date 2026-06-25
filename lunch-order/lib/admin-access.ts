export const ADMIN_MEMBER_IDS = ["1", "11", "13"] as const
const ADMIN_NAME_KEYS = [
  "sakonhiroki",
  "佐近宏樹",
  "tina",
  "楊兆端",
  "ada",
  "潘曉誼",
] as const

function normalizeName(name?: string | null): string {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase()
}

export function isAdminMemberId(memberId?: string | null): boolean {
  const normalized = String(memberId ?? "").trim()
  if (!normalized) return false
  return ADMIN_MEMBER_IDS.includes(normalized as (typeof ADMIN_MEMBER_IDS)[number])
}

export function isAdminMember(record?: {
  id?: string | number | null
  nameInChinese?: string | null
  nameInEnglish?: string | null
} | null): boolean {
  if (!record) return false
  if (isAdminMemberId(String(record.id ?? ""))) return true
  const zh = normalizeName(record.nameInChinese)
  const en = normalizeName(record.nameInEnglish)
  return (
    ADMIN_NAME_KEYS.includes(zh as (typeof ADMIN_NAME_KEYS)[number]) ||
    ADMIN_NAME_KEYS.includes(en as (typeof ADMIN_NAME_KEYS)[number])
  )
}
