export interface Order {
  id: string
  member_id: string
  member_name: string
  dish: string
  drink: string
  timestamp: string
}

export interface FoodpandaOrder {
  id: string
  member_id: string
  member_name: string
  dish: string
  noodle: string
  addOns: string[]
  drink: string
  timestamp: string
}

export interface DailyOrders {
  [weekday: string]: Order[]
}
