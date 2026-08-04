"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useOrders } from "../context/order-context"
import type { FoodpandaOrder, Order } from "../types"
import { toast } from "react-hot-toast"
import OrderSummaryPreview from "./order-summary-preview"
import EmployeeListManager from "./employee-list-manager"
import MenuListManager from "./menu-list-manager"
import OperatorSelectDialog from "./operator-select-dialog"
import Link from "next/link"
import { formatHongKongPeriodDate, getHongKongDateKey } from "../lib/hong-kong-calendar"
import OrderDateQueryBar from "./order-date-query-bar"
import ReimbursementReport from "./reimbursement-report"
import ReceiptScanPanel from "./receipt-scan-panel"
import { ADMIN_MEMBER_IDS, isAdminMember } from "../lib/admin-access"
import { isProxyOrder } from "../lib/order-operator"
import type { AuditLogEntry } from "../context/order-context"

type AdminTab = "tingkok" | "foodpanda"
type AdminSubview = "orders" | "employees" | "menus" | "audit" | "reimbursement" | "receipt-scan"

function OperatorBadge({
  order,
}: {
  order: {
    member_id: string
    member_name: string
    operator_member_id?: string | null
    operator_member_name?: string | null
  }
}) {
  if (!isProxyOrder(order) || !order.operator_member_name) return null
  return <p className="text-sm text-amber-700 mt-1">操作者: {order.operator_member_name}</p>
}

export default function AdminPanel() {
  const {
    fetchOrdersForDate,
    fetchFoodpandaOrdersForDate,
    fetchAuditLogs,
    employees,
    currentMember,
    setCurrentMember,
    bindAuthMember,
    exportToCSV,
    resetOrders,
    resetOrderStatus,
    lastResetTime,
    resetFpOrders,
  } = useOrders()
  const [isResetting, setIsResetting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [adminTab, setAdminTab] = useState<AdminTab>("tingkok")
  const [adminSubview, setAdminSubview] = useState<AdminSubview>("orders")
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [operatorDialogOpen, setOperatorDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<"reset-tingkok" | "reset-foodpanda" | null>(null)
  const currentEmployeeRecord = employees.find((e) => String(e.id) === String(currentMember ?? ""))
  const hasAdminAccess = isAdminMember(currentEmployeeRecord)

  const operatorOptions = employees
    .filter((e) => ADMIN_MEMBER_IDS.includes(e.id as (typeof ADMIN_MEMBER_IDS)[number]))
    .map((e) => ({
      value: String(e.id),
      label: e.nameInChinese || e.nameInEnglish,
    }))
    .filter((option) => !!option.label)
  const adminCandidates = employees.filter((e) =>
    ADMIN_MEMBER_IDS.includes(String(e.id) as (typeof ADMIN_MEMBER_IDS)[number]),
  )

  const loadAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true)
      const logs = await fetchAuditLogs(200)
      setAuditLogs(logs)
    } catch (error) {
      console.error("Error loading audit logs:", error)
      toast.error("操作記錄載入失敗")
    } finally {
      setAuditLoading(false)
    }
  }, [fetchAuditLogs])

  const handleReset = async () => {
    if (!hasAdminAccess) {
      toast.error("你冇管理權限")
      return
    }
    setPendingAction(adminTab === "tingkok" ? "reset-tingkok" : "reset-foodpanda")
    setOperatorDialogOpen(true)
  }

  const executeResetWithOperator = async (actorName: string) => {
    if (!hasAdminAccess) {
      toast.error("你冇管理權限")
      return
    }
    if (!pendingAction) return
    try {
      setIsResetting(true)
      if (pendingAction === "reset-tingkok") {
        await resetOrders({ actorName })
      } else {
        await resetFpOrders({ actorName })
      }
      toast.success("訂單記錄已重設")
      setShowConfirmReset(false)
      setOperatorDialogOpen(false)
      setPendingAction(null)
      await loadAuditLogs()
      await runDateQuery(todayKey)
    } catch (error) {
      console.error("Error resetting orders:", error)
      toast.error("重設失敗")
    } finally {
      setIsResetting(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await resetOrderStatus()
      toast.success("訂單狀態已更新")
    } catch (error) {
      console.error("Error refreshing orders:", error)
      toast.error("更新失敗")
    } finally {
      setIsRefreshing(false)
    }
  }

  const todayKey = getHongKongDateKey()
  const [queriedDateKey, setQueriedDateKey] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([])
  const [selectedFpOrders, setSelectedFpOrders] = useState<FoodpandaOrder[]>([])
  const [loadingDate, setLoadingDate] = useState(false)
  const [hasQueried, setHasQueried] = useState(false)

  const runDateQuery = useCallback(
    async (dateKey: string) => {
      setLoadingDate(true)
      setQueriedDateKey(dateKey)
      setHasQueried(true)
      try {
        const [tingkok, fp] = await Promise.all([
          fetchOrdersForDate(dateKey),
          fetchFoodpandaOrdersForDate(dateKey),
        ])
        setSelectedOrders(tingkok)
        setSelectedFpOrders(fp)
      } catch {
        setSelectedOrders([])
        setSelectedFpOrders([])
        toast.error("查詢失敗，請稍後再試")
      } finally {
        setLoadingDate(false)
      }
    },
    [fetchOrdersForDate, fetchFoodpandaOrdersForDate],
  )

  const didInitialQuery = useRef(false)
  useEffect(() => {
    if (didInitialQuery.current) return
    didInitialQuery.current = true
    void runDateQuery(todayKey)
  }, [runDateQuery, todayKey])

  useEffect(() => {
    if (adminSubview !== "audit") return
    void loadAuditLogs()
  }, [adminSubview, loadAuditLogs])

  if (showPreview) {
    return <OrderSummaryPreview onBack={() => setShowPreview(false)} restaurant={adminTab} />
  }

  if (!hasAdminAccess) {
    return (
      <div className="rounded-md border p-4 space-y-3">
        <div className="text-sm text-red-600">你冇管理權限（只限: Sakon Hiroki / Tina / Ada）</div>
        <div className="text-sm text-gray-600">如你係管理者，請喺下面揀返身份：</div>
        <div className="flex flex-wrap gap-2">
          {adminCandidates.map((m) => (
            <button
              key={m.id}
              className="px-3 py-1.5 text-sm rounded-md border bg-gray-100 hover:bg-gray-200"
              onClick={() => {
                bindAuthMember(String(m.id))
                setCurrentMember(String(m.id))
              }}
            >
              {m.nameInChinese} ({m.nameInEnglish})
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/monthly-summary"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          每月訂單統計
        </Link>
        <button
          onClick={() => setAdminSubview("employees")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "employees" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          員工名單
        </button>
        <button
          onClick={() => setAdminSubview("menus")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "menus" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          菜單名單
        </button>
        <button
          onClick={() => setAdminSubview("orders")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "orders" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          落單管理
        </button>
        <button
          onClick={() => setAdminSubview("audit")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "audit" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          操作記錄
        </button>
        <button
          onClick={() => setAdminSubview("reimbursement")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "reimbursement" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          報銷表
        </button>
        <button
          onClick={() => setAdminSubview("receipt-scan")}
          className={`px-4 py-2 border rounded-md ${adminSubview === "receipt-scan" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          收據掃描
        </button>
      </div>

      {adminSubview === "orders" && (
        <>
      <div className="grid grid-cols-2 gap-0 border rounded-md overflow-hidden mb-4">
        <button
          onClick={() => setAdminTab("tingkok")}
          className={`py-3 text-center font-bold transition-colors ${
            adminTab === "tingkok" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          汀角路茶座
        </button>
        <button
          onClick={() => setAdminTab("foodpanda")}
          className={`py-3 text-center font-bold transition-colors ${
            adminTab === "foodpanda" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={adminTab === "foodpanda" ? { backgroundColor: "#d70f64" } : {}}
        >
          🐼 foodpanda
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            更新
          </button>
          <button onClick={() => setShowPreview(true)} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            導出落單表
          </button>
        </div>
        {showConfirmReset ? (
          <div className="flex space-x-2">
            <button onClick={() => setShowConfirmReset(false)} className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
              取消重設
            </button>
            <button onClick={handleReset} disabled={isResetting} className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50">
              重設
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConfirmReset(true)} className="px-4 py-2 border rounded-md bg-red-500 hover:bg-red-600 text-white">
            重設
          </button>
        )}
      </div>

      {lastResetTime && adminTab === "tingkok" && <p className="text-sm text-gray-500">最後重設時間: {lastResetTime.toLocaleString("zh-HK")}</p>}

      <div className="mb-4">
        <OrderDateQueryBar
          todayKey={todayKey}
          defaultDateKey={todayKey}
          loading={loadingDate}
          onQuery={runDateQuery}
        />
      </div>

      {adminTab === "tingkok" && (
        <>
          {!hasQueried || loadingDate ? (
            <div className="border rounded-md p-8 text-center text-gray-500">
              {loadingDate ? "查詢中…" : "請選擇期日"}
            </div>
          ) : selectedOrders.length === 0 && queriedDateKey ? (
            <div className="border rounded-md p-8 text-center text-gray-500">
              {formatHongKongPeriodDate(queriedDateKey)} 沒有落單記錄
            </div>
          ) : queriedDateKey ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-4">
                  {formatHongKongPeriodDate(queriedDateKey)} 嘅落單（{selectedOrders.length}單）
                </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrders.map((order) => (
                        <div key={order.id} className="border rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between">
                            <h4 className="font-bold">{order.member_name}</h4>
                            <span className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleTimeString("zh-HK")}</span>
                          </div>
                          <div className="mt-2">
                            <p><span className="font-medium">餐點:</span> {order.dish}</p>
                            <p><span className="font-medium">飲品:</span> {order.drink}</p>
                            <OperatorBadge order={order} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h4 className="font-bold mb-2">統計</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-1">餐點:</h5>
                          <ul className="space-y-1">
                            {Object.entries(selectedOrders.reduce((acc, order) => { acc[order.dish] = (acc[order.dish] || 0) + 1; return acc }, {} as Record<string, number>)).map(([dish, count]) => (
                              <li key={dish}>{dish}: {count}件</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">飲品:</h5>
                          <ul className="space-y-1">
                            {Object.entries(selectedOrders.reduce((acc, order) => { acc[order.drink] = (acc[order.drink] || 0) + 1; return acc }, {} as Record<string, number>)).map(([drink, count]) => (
                              <li key={drink}>{drink}: {count}件</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {adminTab === "foodpanda" && (
        <div className="space-y-4">
          {!hasQueried || loadingDate ? (
            <div className="border rounded-md p-8 text-center text-gray-500">
              {loadingDate ? "查詢中…" : "請選擇期日"}
            </div>
          ) : selectedFpOrders.length === 0 && queriedDateKey ? (
            <div className="border rounded-md p-8 text-center text-gray-500">
              {formatHongKongPeriodDate(queriedDateKey)} 沒有 foodpanda 落單記錄
            </div>
          ) : queriedDateKey ? (
            <>
          <h3 className="font-bold text-lg" style={{ color: '#d70f64' }}>
            🐼 foodpanda 落單（{selectedFpOrders.length}單）— {formatHongKongPeriodDate(queriedDateKey)}
          </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFpOrders.map((order) => (
                  <div key={order.id} className="border rounded-md p-4" style={{ backgroundColor: '#fff0f5', borderColor: '#d70f64' }}>
                    <div className="flex justify-between">
                      <h4 className="font-bold">{order.member_name}</h4>
                      <span className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleTimeString("zh-HK")}</span>
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                      <p><span className="font-medium">餐點:</span> {order.dish}</p>
                      {order.noodle && <p><span className="font-medium">麵類:</span> {order.noodle}</p>}
                      {order.addOns.length > 0 && <p><span className="font-medium">追加:</span> {order.addOns.join(", ")}</p>}
                      <p><span className="font-medium">飲品:</span> {order.drink}</p>
                      <OperatorBadge order={order} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-md" style={{ backgroundColor: '#fff0f5' }}>
                <h4 className="font-bold mb-2" style={{ color: '#d70f64' }}>統計</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-1">餐點:</h5>
                    <ul className="space-y-1">
                      {Object.entries(selectedFpOrders.reduce((acc, o) => { acc[o.dish] = (acc[o.dish] || 0) + 1; return acc }, {} as Record<string, number>)).map(([dish, count]) => (
                        <li key={dish}>{dish}: {count}件</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">飲品:</h5>
                    <ul className="space-y-1">
                      {Object.entries(selectedFpOrders.reduce((acc, o) => { acc[o.drink] = (acc[o.drink] || 0) + 1; return acc }, {} as Record<string, number>)).map(([drink, count]) => (
                        <li key={drink}>{drink}: {count}件</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            </>
          ) : null}
        </div>
      )}
        </>
      )}

      {adminSubview === "employees" && <EmployeeListManager />}
      {adminSubview === "menus" && <MenuListManager />}
      {adminSubview === "reimbursement" && <ReimbursementReport />}
      {adminSubview === "receipt-scan" && <ReceiptScanPanel />}
      {adminSubview === "audit" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">操作記錄（最新200項）</h3>
            <button
              onClick={() => void loadAuditLogs()}
              disabled={auditLoading}
              className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              重新載入
            </button>
          </div>
          {auditLoading ? (
            <div className="border rounded-md p-8 text-center text-gray-500">載入中…</div>
          ) : auditLogs.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-gray-500">暫無操作記錄</div>
          ) : (
            <div className="overflow-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">時間</th>
                    <th className="text-left p-2">動作</th>
                    <th className="text-left p-2">操作者</th>
                    <th className="text-left p-2">對象</th>
                    <th className="text-left p-2">代理</th>
                    <th className="text-left p-2">內容</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("zh-HK")}</td>
                      <td className="p-2">{log.action}</td>
                      <td className="p-2">{log.actorName || "-"}</td>
                      <td className="p-2">
                        {log.targetMemberName || "-"}
                        {log.targetMemberId ? ` (${log.targetMemberId})` : ""}
                      </td>
                      <td className="p-2">{log.isProxyOrder ? "是" : "-"}</td>
                      <td className="p-2">{log.summary || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <OperatorSelectDialog
        open={operatorDialogOpen}
        title={pendingAction === "reset-tingkok" ? "汀角路 重設" : "foodpanda 重設"}
        options={operatorOptions}
        preferredValue={currentEmployeeRecord?.id || ""}
        busy={isResetting}
        onCancel={() => {
          if (isResetting) return
          setOperatorDialogOpen(false)
          setPendingAction(null)
        }}
        onConfirm={(actorName) => {
          void executeResetWithOperator(actorName)
        }}
      />
    </div>
  )
}
