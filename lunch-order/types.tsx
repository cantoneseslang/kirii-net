export interface Order {
  id: string
  member_id: string
  member_name: string
  dish: string
  drink: string
  timestamp: string
}

export interface DailyOrders {
  [weekday: string]: Order[]
}
