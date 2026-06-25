"use client"

import { useEffect, useMemo, useState } from "react"

type OperatorSelectDialogProps = {
  open: boolean
  title: string
  options: string[]
  busy?: boolean
  onCancel: () => void
  onConfirm: (actorName: string) => void
}

export default function OperatorSelectDialog({
  open,
  title,
  options,
  busy = false,
  onCancel,
  onConfirm,
}: OperatorSelectDialogProps) {
  const normalizedOptions = useMemo(
    () => Array.from(new Set(options.map((x) => x.trim()).filter(Boolean))),
    [options],
  )
  const [selected, setSelected] = useState("")

  useEffect(() => {
    if (!open) return
    setSelected(normalizedOptions[0] ?? "")
  }, [open, normalizedOptions])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4 space-y-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">請選擇操作者姓名（取消只限本人）</p>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={busy}
          className="w-full border rounded-md px-3 py-2"
        >
          {normalizedOptions.map((name) => (
            <option key={name} value={name}>
              {name}
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
            onClick={() => selected && onConfirm(selected)}
            disabled={busy || !selected}
            className="px-4 py-2 border rounded-md bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
