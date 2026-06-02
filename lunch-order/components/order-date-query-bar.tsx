"use client"

import { useState } from "react"

type OrderDateQueryBarProps = {
  todayKey: string
  defaultDateKey?: string
  loading?: boolean
  onQuery: (dateKey: string) => void
}

export default function OrderDateQueryBar({
  todayKey,
  defaultDateKey,
  loading = false,
  onQuery,
}: OrderDateQueryBarProps) {
  const [inputDateKey, setInputDateKey] = useState(defaultDateKey ?? todayKey)

  const handleQuery = (dateKey: string = inputDateKey) => {
    if (!dateKey) return
    onQuery(dateKey)
  }

  const handleDateChange = (dateKey: string) => {
    setInputDateKey(dateKey)
    if (dateKey) onQuery(dateKey)
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleQuery()
            }
          }}
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
