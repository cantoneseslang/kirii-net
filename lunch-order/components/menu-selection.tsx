"use client"

import { useState, useEffect, useCallback } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"
import { MEMBERS } from "../data/members"

const DAILY_MENUS = {
  星期一: ["豉汁蒸排骨飯", "沙嗲雞球腸飯", "三寶飯", "蕃茄蛋牛肉飯", "時菜肉片炒河", "豆腐粟米飯", "什菇時菜飯"],
  星期二: ["梅菜蒸肉餅飯", "豉椒牛腩飯", "豆腐火腩飯", "椒鹽豬扒拼麥樂雞飯", "星洲炒米", "豆腐粟米飯", "什菇時菜飯"],
  星期三: ["鹹魚蒸肉餅飯", "冬瓜炆火腩飯", "咖喱雞球飯", "粟米斑腩飯", "乾炒黑椒牛河", "豆腐粟米飯", "什菇時菜飯"],
  星期四: ["鹹蛋蒸肉餅飯", "滷水雞脾飯", "蕃茄牛扒腸仔飯", "豉椒排骨飯", "肉絲炒麵", "豆腐粟米飯", "什菇時菜飯"],
  星期五: ["冬菜蒸鯇魚飯", "魚香茄子飯", "叉燒餐肉鹹蛋飯", "蝦仁火腿炒蛋飯", "肉醬意粉", "豆腐粟米飯", "什菇時菜飯"],
  星期六: ["雜菇蒸雞球飯", "蕃茄豬扒飯", "涼瓜牛肉飯", "雪菜肉絲炒米", "豆腐粟米飯", "什菇時菜飯"], 
  星期日: ["雜菇蒸雞球飯", "蕃茄豬扒飯", "涼瓜牛肉飯", "雪菜肉絲炒米", "豆腐粟米飯", "什菇時菜飯"] 
}

export const DRINKS = {
  hot: [
    { name: "熱奶茶", price: 16 },
    { name: "熱咖啡", price: 16 },
    { name: "熱鴛鴦", price: 16 },
    { name: "熱檸茶", price: 16 },
    { name: "熱菜蜜", price: 16 },
    { name: "熱可力", price: 16 },
    { name: "熱華田", price: 16 },
    { name: "熱檸水", price: 16 },
    { name: "熱杏仁霜", price: 16 }
  ],
  cold: [
    { name: "凍奶茶", price: 18 },
    { name: "凍咖啡", price: 18 },
    { name: "凍鴛鴦", price: 18 },
    { name: "凍檸茶", price: 18 },
    { name: "凍菜蜜", price: 18 },
    { name: "凍可力", price: 18 },
    { name: "凍華田", price: 18 },
    { name: "凍檸水", price: 18 },
    { name: "凍杏仁霜", price: 18 }
  ],
  other: [
    { name: "可樂", price: 12 },
    { name: "橙汁", price: 12 },
    { name: "雪碧", price: 12 },
    { name: "忌廉", price: 12 },
    { name: "涼茶", price: 15 }
  ]
};

export default function MenuSelection() {
  const [selectedDish, setSelectedDish] = useState("")
  const [selectedDrink, setSelectedDrink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currentMember, addOrder, hasOrdered, resetOrderStatus, modifyOrder, getWeekdayOrders, cancelOrder } =
    useOrders()

  const [weekday, setWeekday] = useState("")
  const [todayMenu, setTodayMenu] = useState<string[]>([])

  const fetchMenu = useCallback(() => {
    const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
    setWeekday(today)
    const menu = DAILY_MENUS[today as keyof typeof DAILY_MENUS] || []
    setTodayMenu(menu)
  }, [])

  const updateOrderStatus = useCallback(async () => {
    await resetOrderStatus()
  }, [resetOrderStatus])

  useEffect(() => {
    fetchMenu()
    updateOrderStatus()

    const intervalId = setInterval(() => {
      fetchMenu()
      updateOrderStatus()
    }, 60000) // 1分ごとに更新

    return () => clearInterval(intervalId)
  }, [fetchMenu, updateOrderStatus])

  useEffect(() => {
    if (currentMember && hasOrdered(currentMember)) {
      const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
      const todayOrders = getWeekdayOrders(today)
      const existingOrder = todayOrders.find((order) => order.member_id === currentMember)
      if (existingOrder) {
        console.log("既存の注文を読み込み:", existingOrder)
        setSelectedDish(existingOrder.dish !== "未選擇" ? existingOrder.dish : "")
        setSelectedDrink(existingOrder.drink !== "未選擇" ? existingOrder.drink : "")
      }
    } else {
      setSelectedDish("")
      setSelectedDrink("")
    }
  }, [currentMember, hasOrdered, getWeekdayOrders])

  const handleSubmit = async () => {
    if (!currentMember) {
      toast.error("請選擇訂餐人")
      return
    }

    if (!selectedDish && !selectedDrink) {
      toast.error("請至少選擇餐點或飲品")
      return
    }

    const member = MEMBERS.find((m) => m.id === currentMember)
    if (!member) {
      toast.error("無効な訂餐人")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("送信データ:", {
        member_id: currentMember,
        member_name: member.nameInChinese,
        dish: selectedDish || "未選擇",
        drink: selectedDrink || "未選擇",
      })

      const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
      const todayOrders = getWeekdayOrders(today)
      const existingOrder = todayOrders.find((order) => order.member_id === currentMember)

      if (existingOrder) {
        console.log("注文を修正:", existingOrder.id)
        await modifyOrder(existingOrder.id, {
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: selectedDish || "未選擇",
          drink: selectedDrink || "未選擇",
        })
        toast.success("訂單已成功修改")
      } else {
        console.log("新規注文を追加")
        await addOrder({
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: selectedDish || "未選擇",
          drink: selectedDrink || "未選擇",
        })
        toast.success("訂單已成功提交")
      }

      // 注文後にデータを再読み込み
      await updateOrderStatus()
    } catch (error) {
      console.error("Error submitting/modifying order:", error)
      toast.error("訂單提交/修改失敗，請稍後再試")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!currentMember) {
      toast.error("請先選擇訂餐人")
      return
    }

    try {
      setIsSubmitting(true)
      await cancelOrder(currentMember)
      setSelectedDish("")
      setSelectedDrink("")
      toast.success("訂單已取消")
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("訂單取消失敗，請稍後再試")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentMember) {
    return <div className="border rounded-md p-6 bg-gray-50 text-center text-gray-500">請先選擇訂餐人</div>
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <h3 className="font-bold text-lg mb-4">今日餐單 ({weekday})</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="no-dish"
              name="dish"
              value=""
              checked={selectedDish === ""}
              onChange={() => setSelectedDish("")}
              className="mr-2"
            />
            <label htmlFor="no-dish">不選擇餐點</label>
          </div>
          {todayMenu.map((dish, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`dish-${index}`}
                name="dish"
                value={dish}
                checked={selectedDish === dish}
                onChange={() => setSelectedDish(dish)}
                className="mr-2"
              />
              <label htmlFor={`dish-${index}`}>{dish}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-md p-4">
        <h3 className="font-bold text-lg mb-4">飲品選擇</h3>
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="radio"
              id="no-drink"
              name="drink"
              value=""
              checked={selectedDrink === ""}
              onChange={() => setSelectedDrink("")}
              className="mr-2"
            />
            <label htmlFor="no-drink">不選擇飲品</label>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">熱飲</h4>
              <div className="grid grid-cols-2 gap-2">
                {DRINKS.hot.map((drink, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`drink-hot-${index}`}
                      name="drink"
                      value={drink.name}
                      checked={selectedDrink === drink.name}
                      onChange={() => setSelectedDrink(drink.name)}
                      className="mr-2"
                    />
                    <label htmlFor={`drink-hot-${index}`}>{drink.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">凍飲</h4>
              <div className="grid grid-cols-2 gap-2">
                {DRINKS.cold.map((drink, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                      id={`drink-cold-${index}`}
                name="drink"
                      value={drink.name}
                      checked={selectedDrink === drink.name}
                      onChange={() => setSelectedDrink(drink.name)}
                className="mr-2"
              />
                    <label htmlFor={`drink-cold-${index}`}>{drink.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">其他飲品</h4>
              <div className="grid grid-cols-2 gap-2">
                {DRINKS.other.map((drink, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`drink-other-${index}`}
                      name="drink"
                      value={drink.name}
                      checked={selectedDrink === drink.name}
                      onChange={() => setSelectedDrink(drink.name)}
                      className="mr-2"
                    />
                    <label htmlFor={`drink-other-${index}`}>{drink.name}</label>
            </div>
          ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleSubmit}
          disabled={(!selectedDish && !selectedDrink) || isSubmitting}
          className={`w-full py-3 rounded-md text-white font-bold ${
            hasOrdered(currentMember) ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {isSubmitting ? "處理中..." : hasOrdered(currentMember) ? "修改落單" : "確認落單"}
        </button>

        {hasOrdered(currentMember) && (
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full py-3 rounded-md bg-gray-200 hover:bg-gray-300 font-bold disabled:opacity-50"
          >
            {isSubmitting ? "處理中..." : "取消落單"}
          </button>
        )}
      </div>
    </div>
  )
}
