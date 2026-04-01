"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { useOrders } from "../context/order-context"
import type { ManagedMenuItem } from "../types"

const WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]

export default function MenuListManager() {
  const { menuItems, saveMenuItems } = useOrders()
  const [selectedWeekday, setSelectedWeekday] = useState("星期一")
  const [draft, setDraft] = useState<ManagedMenuItem[]>(menuItems)

  useEffect(() => {
    setDraft(menuItems)
  }, [menuItems])

  const weekdayItems = useMemo(
    () =>
      draft
        .filter((item) => item.weekday === selectedWeekday)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [draft, selectedWeekday],
  )

  const updateItem = (id: string, patch: Partial<ManagedMenuItem>) => {
    setDraft((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const addItem = () => {
    const nextOrder = weekdayItems.length
    setDraft((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        weekday: selectedWeekday,
        sortOrder: nextOrder,
        dishName: "",
        isFixed: false,
      },
    ])
  }

  const moveItem = (id: string, direction: -1 | 1) => {
    const items = [...weekdayItems]
    const index = items.findIndex((item) => item.id === id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return
    const current = items[index]
    const next = items[nextIndex]
    updateItem(current.id, { sortOrder: next.sortOrder })
    updateItem(next.id, { sortOrder: current.sortOrder })
  }

  const removeItem = (id: string) => {
    setDraft((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item) =>
          item.weekday === selectedWeekday && item.sortOrder > weekdayItems.find((entry) => entry.id === id)!.sortOrder
            ? { ...item, sortOrder: item.sortOrder - 1 }
            : item,
        ),
    )
  }

  const save = async () => {
    try {
      await saveMenuItems(draft)
      toast.success("菜單名單已保存")
    } catch (err) {
      console.error(err)
      toast.error("菜單名單保存失敗")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">菜單名單</h3>
        <div className="space-x-2">
          <button onClick={addItem} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            新增菜單
          </button>
          <button onClick={save} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
            保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((weekday) => (
          <button
            key={weekday}
            onClick={() => setSelectedWeekday(weekday)}
            className={`px-3 py-2 rounded-md border text-sm ${selectedWeekday === weekday ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            {weekday}
          </button>
        ))}
      </div>

      <div className="space-y-3 border rounded-md p-4">
        {weekdayItems.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
            <input
              value={item.dishName}
              onChange={(e) => updateItem(item.id, { dishName: e.target.value })}
              className="border rounded px-3 py-2"
              placeholder="菜單名稱"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.isFixed}
                onChange={(e) => updateItem(item.id, { isFixed: e.target.checked })}
              />
              固定
            </label>
            <div className="flex gap-1">
              <button onClick={() => moveItem(item.id, -1)} disabled={index === 0} className="px-2 py-1 border rounded disabled:opacity-50">
                ↑
              </button>
              <button onClick={() => moveItem(item.id, 1)} disabled={index === weekdayItems.length - 1} className="px-2 py-1 border rounded disabled:opacity-50">
                ↓
              </button>
            </div>
            <button onClick={() => removeItem(item.id)} className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600">
              刪除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
