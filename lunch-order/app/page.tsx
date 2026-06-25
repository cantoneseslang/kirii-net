"use client"

import { useEffect, useRef } from "react"
import { useState } from "react"
import { OrderProvider, useOrders } from "../context/order-context"
import MemberGrid from "../components/member-grid"
import MenuSelection from "../components/menu-selection"
import AdminPanel from "../components/admin-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurrentDateTime from "@/components/current-date-time"

const PORTFOLIO_ENTRY_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_ENTRY_URL?.trim() || "https://kirii-portfolio-1.vercel.app/"

const MEMBER_ID_BY_EMAIL: Record<string, string> = {
  "hiroki.sakon@kirii.com.hk": "1",
}

function normalizeName(input?: string | null): string {
  return String(input ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase()
}

function resolveBridgeMemberId(
  params: { get: (key: string) => string | null },
  employees: Array<{ id: string; nameInChinese: string; nameInEnglish: string }>,
): string | null {
  const byId = params.get("member_id")
  if (byId && employees.some((e) => String(e.id) === String(byId))) return byId

  const fullName = normalizeName(params.get("full_name"))
  if (fullName) {
    const hit = employees.find(
      (e) => normalizeName(e.nameInChinese) === fullName || normalizeName(e.nameInEnglish) === fullName,
    )
    if (hit) return hit.id
  }

  const email = String(params.get("email") ?? "").trim().toLowerCase()
  if (email && MEMBER_ID_BY_EMAIL[email]) return MEMBER_ID_BY_EMAIL[email]
  return null
}

function MainTabs() {
  const { employees, currentMember, setCurrentMember, bindAuthMember } = useOrders()
  const bridgeCheckedRef = useRef(false)
  const [accessAllowed, setAccessAllowed] = useState<boolean>(false)
  const [checkingBridge, setCheckingBridge] = useState(true)
  const [redirectIn, setRedirectIn] = useState(5)

  useEffect(() => {
    if (bridgeCheckedRef.current) return
    bridgeCheckedRef.current = true
    if (typeof window === "undefined") return
    const raw = window.location.search.replace(/^\?/, "")
    const params = new URLSearchParams(raw)
    const source = params.get("source")
    const memberId = resolveBridgeMemberId(params, employees)

    if (source === "kirii-portfolio" && memberId) {
      bindAuthMember(memberId)
      if (currentMember !== memberId) {
        setCurrentMember(memberId)
      }
      setAccessAllowed(true)
      setCheckingBridge(false)
      return
    }

    setAccessAllowed(false)
    setCheckingBridge(false)
  }, [employees, currentMember, setCurrentMember, bindAuthMember])

  useEffect(() => {
    if (checkingBridge || accessAllowed) return
    if (typeof window === "undefined") return

    setRedirectIn(5)
    const interval = window.setInterval(() => {
      setRedirectIn((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    const timer = window.setTimeout(() => {
      window.location.href = PORTFOLIO_ENTRY_URL
    }, 5000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timer)
    }
  }, [checkingBridge, accessAllowed])

  if (checkingBridge) {
    return <div className="rounded-md border p-4 text-sm text-gray-600">檢查入口中...</div>
  }

  if (!accessAllowed) {
    return (
      <div className="rounded-md border p-4 space-y-3">
        <div className="text-sm text-red-600">
          請勿直接輸入此網址。請先由公司 Portfolio 入口進入午餐訂購系統。
        </div>
        <div className="text-sm text-gray-700">如果忘記咗，請喺 WhatsApp 聯絡佐近先生，重新查詢用戶名稱同密碼。</div>
        <div className="text-sm text-gray-700">由於之前任何人（包括公司以外人士）都可以進入，現已改為只限本公司員工查閱。</div>
        <div className="text-sm text-gray-700">{redirectIn} 秒後會自動跳轉到公司平台(Portfolio)</div>
        <a
          href={PORTFOLIO_ENTRY_URL}
          className="inline-block px-3 py-2 text-sm rounded-md border bg-gray-100 hover:bg-gray-200"
        >
          立即前往公司 Portfolio
        </a>
      </div>
    )
  }

  return (
    <Tabs defaultValue="order" className="space-y-4">
      <TabsList className="w-full grid grid-cols-2 h-12 mb-4">
        <TabsTrigger value="order" className="text-lg">
          落單
        </TabsTrigger>
        <TabsTrigger value="admin" className="text-lg">
          管理
        </TabsTrigger>
      </TabsList>

      <TabsContent value="order" className="space-y-6">
        <div>
          <h2 className="text-lg mb-4">選擇訂餐人</h2>
          <MemberGrid />
        </div>
        <MenuSelection />
      </TabsContent>

      <TabsContent value="admin">
        <AdminPanel />
      </TabsContent>
    </Tabs>
  )
}

export default function Page() {
  return (
    <OrderProvider>
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="flex justify-between items-center mb-6 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="h-10">
              <img src="/images/kirii-logo.png" alt="KIRII" className="h-full" />
            </div>
            <h1 className="text-xl">午餐訂購系統</h1>
          </div>
          <CurrentDateTime />
        </div>

        <MainTabs />
      </div>
    </OrderProvider>
  )
}
