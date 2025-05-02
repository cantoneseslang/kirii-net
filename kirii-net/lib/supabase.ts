import { createClient } from "@supabase/supabase-js"

// 創建一個標誌來表示我們是否處於預覽/演示模式
const isPreviewMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.anon

// 如果處於預覽模式，只在控制台顯示一次警告
if (isPreviewMode && typeof window !== "undefined") {
  console.warn(
    "Supabase 環境變量未設置。應用程序正在預覽模式下運行，Supabase 功能將不可用。\n" +
      "要啟用完整功能，請設置 NEXT_PUBLIC_SUPABASE_URL 和 anon 環境變量。",
  )
}

// 創建一個模擬的 Supabase 客戶端，用於預覽模式
const createMockClient = () => {
  // 返回一個帶有所有必要方法的模擬對象，但這些方法不執行任何實際操作
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () =>
        Promise.resolve({ error: { message: "預覽模式：認證功能不可用" }, data: { user: null, session: null } }),
      signUp: () =>
        Promise.resolve({ error: { message: "預覽模式：認證功能不可用" }, data: { user: null, session: null } }),
      signOut: () => Promise.resolve(),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  }
}

// 根據環境變量的可用性，創建真實或模擬的 Supabase 客戶端
export const supabase = isPreviewMode
  ? createMockClient()
  : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.anon!)

// 顧客資料的類型定義
export type CustomerProfile = {
  id: string
  user_id: string
  company_name: string
  company_id?: string
  contact_name: string
  contact_phone: string
  company_address: string
  created_at: string
}

// 送貨地址的類型定義
export type DeliveryLocation = {
  id: string
  user_id: string
  location_type: "address" | "map"
  address?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  location_description?: string
  recipient_name: string
  recipient_phone: string
  delivery_notes?: string
  created_at: string
}
