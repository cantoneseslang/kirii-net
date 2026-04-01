"use client"

import { CURRENT_MENU } from "../data/menu-schedule"
import { MEMBERS } from "../data/members"
import type { EmployeeRecord, ManagedMenuItem } from "../types"

export const EMPLOYEES_STORAGE_KEY = "lunch-order-employees-v1"
export const MENU_ITEMS_STORAGE_KEY = "lunch-order-menu-items-v1"

const FIXED_MENU_NAMES = new Set(["粟米炒蛋飯", "什菇時菜飯", "時菜雜菇飯"])

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

export function getDefaultMenuItems(): ManagedMenuItem[] {
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
