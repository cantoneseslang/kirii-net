"use client"

import { CURRENT_MENU } from "../data/menu-schedule"
import { MEMBERS } from "../data/members"
import type { EmployeeRecord, ManagedMenuItem } from "../types"

const FIXED_MENU_NAMES = new Set(["粟米炒蛋飯", "什菇時菜飯", "時菜雜菇飯"])

/**
 * 初回・localStorage なし時だけの表示用（携帯で空メニューになるのを防ぐ）。
 * Supabase に一度でも載った／保存したあとは order-context 側で上書きしない。
 */
export function getDefaultMenuItemsFromSchedule(): ManagedMenuItem[] {
  return Object.entries(CURRENT_MENU.menus).flatMap(([weekday, dishes]) =>
    dishes.map((dishName, index) => ({
      id: `${weekday}-${index + 1}`,
      weekday,
      sortOrder: index,
      dishName,
      isFixed: FIXED_MENU_NAMES.has(dishName),
    })),
  )
}

/** Stable UI / export order: matches `MEMBERS`; unknown ids (e.g. admin-added) sort after. */
const MEMBER_ORDER_INDEX: Record<string, number> = Object.fromEntries(
  MEMBERS.map((m, i) => [m.id, i]),
)

export function sortEmployeesByMembersOrder(employees: EmployeeRecord[]): EmployeeRecord[] {
  const tail = MEMBERS.length + 1
  return [...employees].sort((a, b) => {
    const ia = MEMBER_ORDER_INDEX[a.id] ?? tail
    const ib = MEMBER_ORDER_INDEX[b.id] ?? tail
    if (ia !== ib) return ia - ib
    return a.id.localeCompare(b.id, undefined, { numeric: true })
  })
}

/** Align `id` with `MEMBERS` when 中文名 matches, so Supabase rows never sort to the tail due to UUID drift. */
export function reconcileEmployeeRecordWithMembers(record: EmployeeRecord): EmployeeRecord {
  const id = String(record.id ?? "").trim()
  const name = record.nameInChinese?.trim()
  if (name) {
    const match = MEMBERS.find((m) => m.nameInChinese === name)
    if (match) return { ...record, id: match.id }
  }
  return { ...record, id: id || record.id }
}

export function dedupeEmployeesById(employees: EmployeeRecord[]): EmployeeRecord[] {
  const map = new Map<string, EmployeeRecord>()
  for (const e of employees) {
    map.set(e.id, e)
  }
  return Array.from(map.values())
}

export const EMPLOYEES_STORAGE_KEY = "lunch-order-employees-v1"
export const MENU_ITEMS_STORAGE_KEY = "lunch-order-menu-items-v1"

/** 管理菜單のローカルバックアップ（Supabase 空読み時も menu-schedule.ts には戻さない） */
export function readStoredMenuItems(): ManagedMenuItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(MENU_ITEMS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as ManagedMenuItem[]
  } catch {
    return []
  }
}

export function writeStoredMenuItems(items: ManagedMenuItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* quota / private mode */
  }
}

export function getDefaultEmployees(): EmployeeRecord[] {
  return MEMBERS.map((member) => ({
    id: member.id,
    nameInChinese: member.nameInChinese,
    nameInEnglish: member.nameInEnglish,
    group: member.group === "B" ? "B" : "A",
    isActive: true,
    joinedOn: "",
    leftOn: "",
  }))
}

/**
 * Supabase のメタ行が欠けた／reconcile で id が潰れた場合でも、`MEMBERS` の全員を常に揃える。
 * DB にある行は `getDefaultEmployees()` より優先（名前・組・在職など）。
 * `MEMBERS` に無い id（管理画面で追加）は末尾に残す。
 */
export function mergeEmployeesWithDefaults(loaded: EmployeeRecord[]): EmployeeRecord[] {
  const defaults = getDefaultEmployees()
  const memberIds = new Set(MEMBERS.map((m) => m.id))
  const byId = new Map<string, EmployeeRecord>()
  for (const e of loaded) {
    const id = String(e.id ?? "").trim()
    if (id) byId.set(id, { ...e, id })
  }

  const merged: EmployeeRecord[] = defaults.map((def) => {
    const row = byId.get(def.id)
    if (!row) return def
    return { ...def, ...row, id: def.id }
  })

  for (const e of loaded) {
    const id = String(e.id ?? "").trim()
    if (id && !memberIds.has(id)) {
      merged.push({ ...e, id })
    }
  }
  return merged
}

