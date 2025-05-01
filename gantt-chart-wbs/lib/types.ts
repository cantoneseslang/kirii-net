export interface Task {
  id: string
  title: string
  startDate: string
  endDate: string
  progress: number
  salesman: string // 担当営業
  client: string
  project: string
  description?: string
  priority?: "low" | "medium" | "high"
  dependencies?: string[]
  // 営業フロー固有のフィールド
  taskType?: TaskType
  amount?: number // 金額
  totalAmount?: number // プロジェクト全体の金額
  amountProgress?: number // 金額ベースの進捗率（％）
  details?: string // 詳細情報（自由記述）
  status?: TaskStatus
}

export type TaskType =
  | "meeting_designer" // 設計師との面会
  | "meeting_developer" // デベロッパーとの面会
  | "proposal" // 提案
  | "quotation" // 見積もり
  | "deal_closed" // 商談成立
  | "bid_won" // 入札成立
  | "deal_scale" // 商談スケール決定
  | "site_support" // 工事現場対応
  | "delivery" // 納品
  | "complaint" // クレーム対応
  | "change" // 変更対応
  | "other" // その他
  | "deal_date" // 商談が決まった日
  | "bid_date" // 入札決まった日
  | "contract_date" // 契約締結した日

export type TaskStatus =
  | "not_started" // 未開始
  | "in_progress" // 進行中
  | "completed" // 完了
  | "delayed" // 遅延
  | "on_hold" // 保留中
  | "cancelled" // キャンセル

export interface Project {
  id: string
  name: string
  client: string
  totalAmount: number // プロジェクト全体の金額
  startDate: string
  endDate: string
  tasks: Task[]
  amountProgress: number // 金額ベースの進捗率（％）
  salesmen?: string[] // プロジェクトに関連する営業担当者のリスト
}
