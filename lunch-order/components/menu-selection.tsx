"use client"

import { useState, useEffect, useCallback } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"
import { MEMBERS } from "../data/members"
import { getCurrentMenu, DRINKS } from "../data/menu-schedule"
import OrderConfirmationCard from "./order-confirmation-card"

export default function MenuSelection() {
  const [selectedDish, setSelectedDish] = useState("")
  const [selectedDrink, setSelectedDrink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedDish, setConfirmedDish] = useState("")
  const [confirmedDrink, setConfirmedDrink] = useState("")
  const [isModified, setIsModified] = useState(false)
  const { currentMember, addOrder, hasOrdered, resetOrderStatus, modifyOrder, getWeekdayOrders, cancelOrder } =
    useOrders()

  const [weekday, setWeekday] = useState("")
  const [todayMenu, setTodayMenu] = useState<string[]>([])

  const fetchMenu = useCallback(() => {
    const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
    setWeekday(today)
    const { menus } = getCurrentMenu()
    const menu = menus[today as keyof typeof menus] || []
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
        const dish = existingOrder.dish !== "未選擇" ? existingOrder.dish : ""
        const drink = existingOrder.drink !== "未選擇" ? existingOrder.drink : ""
        setSelectedDish(dish)
        setSelectedDrink(drink)
        // 既存の注文がある場合も確認カードを表示
        if (dish || drink) {
          setConfirmedDish(existingOrder.dish)
          setConfirmedDrink(existingOrder.drink)
          setShowConfirmation(true)
          setIsModified(false) // 既存注文の表示時は修正ではない
        }
      }
    } else {
      setSelectedDish("")
      setSelectedDrink("")
      setShowConfirmation(false)
      setConfirmedDish("")
      setConfirmedDrink("")
      setIsModified(false)
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

      const finalDish = selectedDish || "未選擇"
      const finalDrink = selectedDrink || "未選擇"

      if (existingOrder) {
        console.log("注文を修正:", existingOrder.id)
        await modifyOrder(existingOrder.id, {
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: finalDish,
          drink: finalDrink,
        })
        toast.success("訂單已成功修改")
        // 修正時は isModified を true に設定
        setIsModified(true)
      } else {
        console.log("新規注文を追加")
        await addOrder({
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: finalDish,
          drink: finalDrink,
        })
        toast.success("訂單已成功提交")
        // 新規注文時は isModified を false に設定
        setIsModified(false)
      }

      // 注文確認カードを表示
      setConfirmedDish(finalDish)
      setConfirmedDrink(finalDrink)
      setShowConfirmation(true)

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
      setShowConfirmation(false)
      setConfirmedDish("")
      setConfirmedDrink("")
      setIsModified(false)
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
      {/* 注文確認カード */}
      {showConfirmation && (confirmedDish !== "未選擇" || confirmedDrink !== "未選擇") && (
        <OrderConfirmationCard
          dish={confirmedDish}
          drink={confirmedDrink}
          memberName={MEMBERS.find(m => m.id === currentMember)?.nameInChinese}
          isModified={isModified}
        />
      )}
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
