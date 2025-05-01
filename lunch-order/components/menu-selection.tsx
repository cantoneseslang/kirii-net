"use client"

import { useState, useEffect, useCallback } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"
import { MEMBERS } from "../data/members"

const DAILY_MENUS = {
  星期一: ["鹹蛋蒸肉餅飯", "蕃茄蛋牛肉飯", "三寶飯", "椒鹽豬扒拼麥樂雞飯", "肉絲炒麵", "豆腐粟米飯", "什菇時菜飯"],
  星期二: ["梅菜蒸腩肉飯", "咖喱火腩腸仔飯", "蝦仁火腿炒蛋飯", "涼瓜牛肉飯", "黑椒上海粗炒", "豆腐粟米飯", "什菇時菜飯"],
  星期三: ["鹹魚蒸肉餅飯", "印度楊州炒飯", "魚香茄子飯", "腸仔、餐肉、炒蛋飯", "沙嗲牛肉炒河", "豆腐粟米飯", "什菇時菜飯"],
  星期四: ["豉汁蒸排骨飯", "時菜豬手飯", "沙嗲雜腸飯", "滷水雞髀飯", "星洲炒米", "豆腐粟米飯", "什菇時菜飯"],
  星期五: ["冬菜蒸鯇魚飯", "豆腐火腩飯", "咖喱雞球飯", "時菜肉片腸仔飯", "乾炒叉燒意粉", "豆腐粟米飯", "什菇時菜飯"],
  星期六: ["雜菇蒸雞球飯", "粟米斑腩飯", "叉燒炒蛋飯", "雪菜雞絲炆米", "豆腐粟米飯", "什菇時菜飯"],
  星期日: ["雜菇蒸雞球飯", "粟米斑腩飯", "叉燒炒蛋飯", "雪菜雞絲炆米", "豆腐粟米飯", "什菇時菜飯"],
}

const DRINKS = [
  "熱奶茶",
  "熱咖啡",
  "熱鴛鴦",
  "熱檸茶",
  "熱菜蜜",
  "熱可力",
  "熱華田",
  "熱檸水",
  "熱杏仁霜",
  "凍奶茶",
  "凍咖啡",
  "凍鴛鴦",
  "凍檸茶",
  "凍菜蜜",
  "凍可力",
  "凍華田",
  "凍檸水",
  "凍杏仁霜",
  "可樂",
  "橙汁",
  "雪碧",
  "忌廉",
  "涼茶",
]

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
        <div className="grid grid-cols-2 gap-2">
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
          {DRINKS.map((drink, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`drink-${index}`}
                name="drink"
                value={drink}
                checked={selectedDrink === drink}
                onChange={() => setSelectedDrink(drink)}
                className="mr-2"
              />
              <label htmlFor={`drink-${index}`}>{drink}</label>
            </div>
          ))}
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
