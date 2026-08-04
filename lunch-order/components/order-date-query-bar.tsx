"use client"

import { useEffect, useState } from "react"

type OrderDateQueryBarProps = {
  todayKey: string
  /** 親が照会中の期日（同期用） */
  value?: string
  defaultDateKey?: string
  loading?: boolean
  onQuery: (dateKey: string) => void
}

function isValidDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export default function OrderDateQueryBar({
  todayKey,
  value,
  defaultDateKey,
  loading = false,
  onQuery,
}: OrderDateQueryBarProps) {
  const [inputDateKey, setInputDateKey] = useState(value ?? defaultDateKey ?? todayKey)

  useEffect(() => {
    if (value && isValidDateKey(value) && value !== inputDateKey) {
      setInputDateKey(value)
    }
  }, [value, inputDateKey])

  const handleDateChange = (dateKey: string) => {
    // カレンダー月移動などで空文字が来ると画面が消えるため無視
    if (!isValidDateKey(dateKey)) return
    setInputDateKey(dateKey)
    onQuery(dateKey)
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">期日</span>
        <input
          type="date"
          value={inputDateKey}
          max={todayKey}
          onChange={(e) => handleDateChange(e.target.value)}
          disabled={loading}
          className="px-3 py-2 border rounded-md min-w-[10.5rem] disabled:opacity-50"
        />
      </label>
      {loading && (
        <span className="text-sm text-gray-500 h-[42px] flex items-center self-end">查詢中…</span>
      )}
    </div>
  )
}
