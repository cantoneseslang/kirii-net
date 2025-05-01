import { OrderProvider } from "../context/order-context"
import MemberGrid from "../components/member-grid"
import MenuSelection from "../components/menu-selection"
import AdminPanel from "../components/admin-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CurrentDateTime from "@/components/current-date-time"
import Link from "next/link"

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
            <div className="space-y-6">
              <Link 
                href="/monthly-summary" 
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                每月訂單統計
              </Link>
              <AdminPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrderProvider>
  )
}
