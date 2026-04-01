"use client"

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useOrders } from "../context/order-context"
import type { EmployeeRecord } from "../types"

function createEmptyEmployee(): EmployeeRecord {
  return {
    id: crypto.randomUUID(),
    nameInChinese: "",
    nameInEnglish: "",
    group: "A",
    isActive: true,
    joinedOn: "",
    leftOn: "",
  }
}

export default function EmployeeListManager() {
  const { employees, saveEmployees, deleteEmployeePermanently } = useOrders()
  const [draft, setDraft] = useState<EmployeeRecord[]>(employees)

  useEffect(() => {
    setDraft(employees)
  }, [employees])

  const updateRow = (id: string, patch: Partial<EmployeeRecord>) => {
    setDraft((prev) => prev.map((employee) => (employee.id === id ? { ...employee, ...patch } : employee)))
  }

  const addRow = () => {
    setDraft((prev) => [...prev, createEmptyEmployee()])
  }

  const save = async () => {
    try {
      await saveEmployees(draft)
      toast.success("員工名單已儲存")
    } catch (err) {
      console.error(err)
      toast.error("員工名單儲存失敗")
    }
  }

  const remove = async (id: string) => {
    const first = window.confirm("你係咪確定要喺員工名單刪除此員工？")
    if (!first) return
    const second = window.confirm("最後確認：刪除後將會喺員工名單完全移除此員工，是否繼續？")
    if (!second) return
    try {
      await deleteEmployeePermanently(id)
      toast.success("員工已刪除")
    } catch (err) {
      console.error(err)
      toast.error("刪除員工失敗")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">員工名單</h3>
        <div className="space-x-2">
          <button onClick={addRow} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            新增員工
          </button>
          <button onClick={save} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
            儲存
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 border-b">中文名</th>
              <th className="text-left p-2 border-b">英文名</th>
              <th className="text-left p-2 border-b">組別</th>
              <th className="text-left p-2 border-b">在職</th>
              <th className="text-left p-2 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="p-2">
                  <input
                    value={employee.nameInChinese}
                    onChange={(e) => updateRow(employee.id, { nameInChinese: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={employee.nameInEnglish}
                    onChange={(e) => updateRow(employee.id, { nameInEnglish: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={employee.group}
                    onChange={(e) => updateRow(employee.id, { group: e.target.value as "A" | "B" })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={employee.isActive}
                    onChange={(e) => updateRow(employee.id, { isActive: e.target.checked })}
                  />
                </td>
                <td className="p-2">
                  <button onClick={() => remove(employee.id)} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
