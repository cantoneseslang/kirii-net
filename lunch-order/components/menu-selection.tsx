"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const isJustModifiedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const showConfirmationRef = useRef(false)
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
    // 修正直後の場合は、useEffectでisModifiedをリセットしない
    if (isJustModifiedRef.current) {
      console.log("修正直後のため、useEffectをスキップ（isModifiedを保持）")
      // 確認カードを確実に表示する
      if (!showConfirmation) {
        setShowConfirmation(true)
      }
      // 既存のタイムアウトをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // リセットは3秒後に行う（確認カードが表示される時間を確保）
      timeoutRef.current = setTimeout(() => {
        isJustModifiedRef.current = false
        console.log("isJustModifiedRefをリセット")
        timeoutRef.current = null
      }, 3000)
      return
    }

    // 確認カードが表示されている場合は、その状態を保持する（注文送信直後など）
    if (showConfirmationRef.current) {
      console.log("確認カードが表示中のため、状態を保持")
      // showConfirmationの状態も確実にtrueにする
      if (!showConfirmation) {
        setShowConfirmation(true)
      }
      // 選択状態と確認カードの内容を更新する（注文データが更新された場合）
      if (currentMember && hasOrdered(currentMember)) {
        const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
        const todayOrders = getWeekdayOrders(today)
        const existingOrder = todayOrders.find((order) => order.member_id === currentMember)
        if (existingOrder) {
          const dish = existingOrder.dish !== "未選擇" ? existingOrder.dish : ""
          const drink = existingOrder.drink !== "未選擇" ? existingOrder.drink : ""
          setSelectedDish(dish)
          setSelectedDrink(drink)
          // 確認カードの内容も更新（注文が修正された場合）
          if (dish || drink) {
            setConfirmedDish(existingOrder.dish)
            setConfirmedDrink(existingOrder.drink)
          }
        }
      }
      return
    }

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
          showConfirmationRef.current = true
          setIsModified(false) // 既存注文の表示時は修正ではない
        }
      }
    } else {
      // currentMemberがnullまたは注文がない場合のみ、確認カードを非表示にする
      if (!currentMember) {
        setSelectedDish("")
        setSelectedDrink("")
        setShowConfirmation(false)
        showConfirmationRef.current = false
        setConfirmedDish("")
        setConfirmedDrink("")
        setIsModified(false)
      }
    }
  }, [currentMember, hasOrdered, getWeekdayOrders])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

      // 注文確認カードを先に表示（loadOrders完了前に表示状態を設定）
      setConfirmedDish(finalDish)
      setConfirmedDrink(finalDrink)
      setShowConfirmation(true)
      showConfirmationRef.current = true

      if (existingOrder) {
        console.log("注文を修正:", existingOrder.id)
        // 修正直後であることをマーク（modifyOrder内でloadOrdersが呼ばれる前に設定）
        isJustModifiedRef.current = true
        setIsModified(true)
        await modifyOrder(existingOrder.id, {
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: finalDish,
          drink: finalDrink,
        })
        toast.success("訂單已成功修改")
      } else {
        console.log("新規注文を追加")
        isJustModifiedRef.current = false
        setIsModified(false)
        await addOrder({
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: finalDish,
          drink: finalDrink,
        })
        toast.success("訂單已成功提交")
      }

      console.log("確認カードを表示:", { dish: finalDish, drink: finalDrink, isModified: isJustModifiedRef.current })

      // 注文後にデータを再読み込み
      // modifyOrder/addOrder内で既にloadOrdersが呼ばれるため、updateOrderStatusは不要
      // ただし、リアルタイム更新のタイミングを考慮して少し待つ
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log("注文処理完了、isJustModifiedRef:", isJustModifiedRef.current)
      
      // loadOrders完了後も確認カードを確実に表示する
      setShowConfirmation(true)
      showConfirmationRef.current = true
      setConfirmedDish(finalDish)
      setConfirmedDrink(finalDrink)
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
      showConfirmationRef.current = false
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

  // デバッグ: 確認カードの表示条件をすべてログ出力
  console.log("=== 確認カード表示条件 ===", {
    showConfirmation,
    showConfirmationRef: showConfirmationRef.current,
    confirmedDish,
    confirmedDrink,
    isModified,
    condition1: showConfirmation || showConfirmationRef.current,
    condition2: confirmedDish !== "未選擇" || confirmedDrink !== "未選擇",
    shouldShow: (showConfirmation || showConfirmationRef.current) && (confirmedDish !== "未選擇" || confirmedDrink !== "未選擇")
  })

  return (
    <div className="space-y-6">
      {/* 注文確認カード */}
      {(showConfirmation || showConfirmationRef.current) && (confirmedDish !== "未選擇" || confirmedDrink !== "未選擇") && (
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
