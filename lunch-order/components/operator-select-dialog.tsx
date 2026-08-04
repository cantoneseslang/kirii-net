"use client"

import { useEffect, useMemo, useState } from "react"

type OperatorOption = {
  value: string
  label: string
}

type OperatorSelectDialogProps = {
  open: boolean
  title: string
  options: OperatorOption[]
  preferredValue?: string
  busy?: boolean
  onCancel: () => void
  onConfirm: (actorName: string) => void
}

export default function OperatorSelectDialog({
  open,
  title,
  options,
  preferredValue,
  busy = false,
  onCancel,
  onConfirm,
}: OperatorSelectDialogProps) {
  const normalizedOptions = useMemo(() => {
    const seen = new Set<string>()
    const deduped: OperatorOption[] = []
    for (const item of options) {
      const value = String(item.value ?? "").trim()
      const label = String(item.label ?? "").trim()
      if (!value || !label || seen.has(value)) continue
      seen.add(value)
      deduped.push({ value, label })
    }
    return deduped
  }, [options])
  const [selectedValue, setSelectedValue] = useState("")
  const [userChanged, setUserChanged] = useState(false)

  useEffect(() => {
    if (!open) {
      setUserChanged(false)
      return
    }
    setUserChanged(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    setSelectedValue((prev) => {
      const hasPreferred =
        !!preferredValue && normalizedOptions.some((option) => option.value === preferredValue)
      if (hasPreferred && !userChanged) {
        return preferredValue
      }
      if (prev && normalizedOptions.some((option) => option.value === prev)) return prev
      return normalizedOptions[0]?.value ?? ""
    })
  }, [open, normalizedOptions, preferredValue, userChanged])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4 space-y-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">請選擇操作者姓名（取消只限本人或代理操作者）</p>
        <select
          value={selectedValue}
          onChange={(e) => {
            setUserChanged(true)
            setSelectedValue(e.target.value)
          }}
          disabled={busy}
          className="w-full border rounded-md px-3 py-2"
        >
          {normalizedOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={() => {
              const selected = normalizedOptions.find((option) => option.value === selectedValue)
              if (!selected) return
              onConfirm(selected.label)
            }}
            disabled={busy || !selectedValue}
            className="px-4 py-2 border rounded-md bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
