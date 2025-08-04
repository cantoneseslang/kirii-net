import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数の存在チェック
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase環境変数が設定されていません。デモモードで実行します。')
  console.warn('実際のメール機能を使用するには、.env.localファイルに以下を設定してください:')
  console.warn('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.warn('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
}

// デフォルト値を設定（デモモード用）
const defaultUrl = 'https://demo.supabase.co'
const defaultKey = 'demo-key'

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
)

// サーバーサイド用（Service Role Key使用）
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl || defaultUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// データベーススキーマの型定義
export interface Email {
  id: string
  user_id: string
  from_name: string
  from_email: string
  to_emails: string[]
  cc_emails?: string[]
  bcc_emails?: string[]
  subject: string
  body: string
  html_body?: string
  message_id: string
  thread_id?: string
  folder: string
  read: boolean
  starred: boolean
  important: boolean
  labels: string[]
  attachments?: EmailAttachment[]
  created_at: string
  updated_at: string
}

export interface EmailAttachment {
  id: string
  email_id: string
  filename: string
  size: number
  mime_type: string
  content_id?: string
  url?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  access_token?: string
  refresh_token?: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom'
  unread_count: number
  created_at: string
  updated_at: string
} 