export interface Order {
  id: string
  member_id: string
  member_name: string
  dish: string
  drink: string
  timestamp: string
  operator_member_id?: string | null
  operator_member_name?: string | null
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
  operator_member_id?: string | null
  operator_member_name?: string | null
}

export interface EmployeeRecord {
  id: string
  nameInChinese: string
  nameInEnglish: string
  group: "A" | "B"
  isActive: boolean
  joinedOn: string
  leftOn: string
}

export interface ManagedMenuItem {
  id: string
  weekday: string
  sortOrder: number
  dishName: string
  isFixed: boolean
}

/** 香港暦日キー YYYY-MM-DD → その日の注文 */
export interface DailyOrders {
  [dateKey: string]: Order[]
}

/** 香港暦日キー YYYY-MM-DD → その日の foodpanda 注文 */
export interface DailyFoodpandaOrders {
  [dateKey: string]: FoodpandaOrder[]
}
