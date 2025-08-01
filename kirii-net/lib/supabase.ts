import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 顧客情報の型定義
export interface Customer {
  id?: string
  email: string
  company_name: string
  company_id?: string
  contact_name: string
  contact_phone: string
  company_address: string
  delivery_address?: string
  delivery_address_detail?: string
  location_description?: string
  recipient_name?: string
  recipient_phone?: string
  delivery_notes?: string
  location_lat?: number
  location_lng?: number
  location_type?: 'address' | 'map'
  created_at?: string
  updated_at?: string
}

// ローカルストレージキー
const CUSTOMERS_STORAGE_KEY = 'kirii-customers'

// 顧客情報を保存（ローカルストレージを使用）
export async function saveCustomer(customerData: Customer) {
  try {
         // 從本地儲存取得現有顧客資料
     const existingCustomers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]')
    
         // 檢查現有顧客資料
     const existingCustomer = existingCustomers.find((c: Customer) => c.email === customerData.email)
     if (existingCustomer) {
       throw new Error('此電郵地址已登記')
     }

         // 新的顧客資料
     const newCustomer = {
       ...customerData,
       id: crypto.randomUUID(),
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString(),
     }

         // 儲存到本地儲存
     existingCustomers.push(newCustomer)
     localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(existingCustomers))

    return { success: true, data: newCustomer }
     } catch (error) {
     console.error('顧客資料儲存錯誤:', error)
     return { success: false, error }
   }
}

// 顧客情報を取得（メールアドレスで）
export async function getCustomerByEmail(email: string) {
     try {
     // 從本地儲存取得顧客資料
     const customers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]')
     const customer = customers.find((c: Customer) => c.email === email)
    
    return customer || null
     } catch (error) {
     console.error('顧客資料取得錯誤:', error)
     return null
   }
}

// 顧客情報を更新
export async function updateCustomer(id: string, customerData: Partial<Customer>) {
     try {
     // 從本地儲存取得顧客資料
     const customers = JSON.parse(localStorage.getItem(CUSTOMERS_STORAGE_KEY) || '[]')
     const customerIndex = customers.findIndex((c: Customer) => c.id === id)
    
         if (customerIndex === -1) {
       throw new Error('找不到顧客資料')
     }

         // 更新顧客資料
     customers[customerIndex] = {
       ...customers[customerIndex],
       ...customerData,
       updated_at: new Date().toISOString(),
     }

     // 儲存到本地儲存
     localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers))

    return { success: true, data: customers[customerIndex] }
     } catch (error) {
     console.error('顧客資料更新錯誤:', error)
     return { success: false, error }
   }
}
