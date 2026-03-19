"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"
import { MEMBERS } from "../data/members"
import { DRINKS } from "../data/menu-schedule"
import { FOODPANDA_RESTAURANT } from "../data/foodpanda-menu"
import OrderConfirmationCard from "./order-confirmation-card"

type RestaurantTab = "tingkok" | "foodpanda"

export default function MenuSelection() {
  const [activeTab, setActiveTab] = useState<RestaurantTab>("tingkok")

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

  const [selectedFpDish, setSelectedFpDish] = useState("")
  const [selectedFpNoodle, setSelectedFpNoodle] = useState("")
  const [selectedFpAddOns, setSelectedFpAddOns] = useState<string[]>(["不用加配"])
  const [selectedFpDrink, setSelectedFpDrink] = useState("")

  const {
    currentMember, addOrder, hasOrdered, resetOrderStatus, modifyOrder, getWeekdayOrders, cancelOrder,
    addFpOrder, hasFpOrdered, cancelFpOrder,
  } = useOrders()

  const [weekday, setWeekday] = useState("")
  const [todayMenu, setTodayMenu] = useState<string[]>([])

  const fetchMenu = useCallback(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" })
        const json = await res.json()
        if (!res.ok || !json?.success) {
          throw new Error(
            json?.error ||
              "❌ CRITICAL ERROR: Failed to load menu data from data/menu-schedule.ts. " +
                "The file data/menu-schedule.ts must exist and contain valid menu data. " +
                "Do not use any fallback or default menu data.",
          )
        }
        const nextWeekday = json?.data?.weekday ?? ""
        const dishes = Array.isArray(json?.data?.dishes) ? json.data.dishes : []
        if (!nextWeekday || dishes.length === 0) {
          throw new Error(
            "❌ CRITICAL ERROR: Menu API returned invalid data. " +
              "The file data/menu-schedule.ts must contain valid menu data.",
          )
        }
        setWeekday(nextWeekday)
        setTodayMenu(dishes)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "❌ CRITICAL ERROR: Failed to load menu data."
        console.error(errorMsg, error)
        toast.error(errorMsg)
        setTodayMenu([])
      }
    }
    void load()
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
    }, 60000)
    return () => clearInterval(intervalId)
  }, [fetchMenu, updateOrderStatus])

  useEffect(() => {
    if (isJustModifiedRef.current) {
      if (!showConfirmation) setShowConfirmation(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isJustModifiedRef.current = false
        timeoutRef.current = null
      }, 3000)
      return
    }
    if (showConfirmationRef.current) {
      if (!showConfirmation) setShowConfirmation(true)
      if (currentMember && hasOrdered(currentMember)) {
        const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
        const todayOrders = getWeekdayOrders(today)
        const existingOrder = todayOrders.find((order) => order.member_id === currentMember)
        if (existingOrder) {
          const dish = existingOrder.dish !== "未選擇" ? existingOrder.dish : ""
          const drink = existingOrder.drink !== "未選擇" ? existingOrder.drink : ""
          setSelectedDish(dish)
          setSelectedDrink(drink)
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
        const dish = existingOrder.dish !== "未選擇" ? existingOrder.dish : ""
        const drink = existingOrder.drink !== "未選擇" ? existingOrder.drink : ""
        setSelectedDish(dish)
        setSelectedDrink(drink)
        if (dish || drink) {
          setConfirmedDish(existingOrder.dish)
          setConfirmedDrink(existingOrder.drink)
          setShowConfirmation(true)
          showConfirmationRef.current = true
          setIsModified(false)
        }
      }
    } else {
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

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const handleSubmit = async () => {
    if (!currentMember) { toast.error("請選擇訂餐人"); return }
    if (!selectedDish && !selectedDrink) { toast.error("請至少選擇餐點或飲品"); return }
    const member = MEMBERS.find((m) => m.id === currentMember)
    if (!member) { toast.error("無効な訂餐人"); return }
    try {
      setIsSubmitting(true)
      const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
      const todayOrders = getWeekdayOrders(today)
      const existingOrder = todayOrders.find((order) => order.member_id === currentMember)
      const finalDish = selectedDish || "未選擇"
      const finalDrink = selectedDrink || "未選擇"
      setConfirmedDish(finalDish)
      setConfirmedDrink(finalDrink)
      setShowConfirmation(true)
      showConfirmationRef.current = true
      if (existingOrder) {
        isJustModifiedRef.current = true
        setIsModified(true)
        await modifyOrder(existingOrder.id, { member_id: currentMember, member_name: member.nameInChinese, dish: finalDish, drink: finalDrink })
        toast.success("訂單已成功修改")
      } else {
        isJustModifiedRef.current = false
        setIsModified(false)
        await addOrder({ member_id: currentMember, member_name: member.nameInChinese, dish: finalDish, drink: finalDrink })
        toast.success("訂單已成功提交")
      }
      await new Promise(resolve => setTimeout(resolve, 100))
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
    if (!currentMember) { toast.error("請先選擇訂餐人"); return }
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

  const handleFpSubmit = () => {
    if (!currentMember) { toast.error("請選擇訂餐人"); return }
    if (!selectedFpDish && !selectedFpDrink) { toast.error("請至少選擇餐點或飲品"); return }
    const member = MEMBERS.find((m) => m.id === currentMember)
    if (!member) { toast.error("無効な訂餐人"); return }
    addFpOrder({
      member_id: currentMember,
      member_name: member.nameInChinese,
      dish: selectedFpDish || "未選擇",
      noodle: selectedFpNoodle,
      addOns: selectedFpAddOns.filter(a => a !== "不用加配"),
      drink: selectedFpDrink || "未選擇",
    })
    toast.success("foodpanda 訂單已提交")
  }

  const handleFpCancel = () => {
    if (!currentMember) { toast.error("請先選擇訂餐人"); return }
    cancelFpOrder(currentMember)
    setSelectedFpDish("")
    setSelectedFpNoodle("")
    setSelectedFpAddOns(["不用加配"])
    setSelectedFpDrink("")
    toast.success("foodpanda 訂單已取消")
  }

  const toggleAddOn = (name: string) => {
    if (name === "不用加配") {
      setSelectedFpAddOns(["不用加配"])
    } else {
      setSelectedFpAddOns(prev => {
        const without = prev.filter(a => a !== "不用加配")
        if (without.includes(name)) return without.filter(a => a !== name)
        return [...without, name]
      })
    }
  }

  if (!currentMember) {
    return <div className="border rounded-md p-6 bg-gray-50 text-center text-gray-500">請先選擇訂餐人</div>
  }

  const shouldShowConfirmationCard =
    activeTab === "tingkok" &&
    (showConfirmation || showConfirmationRef.current) &&
    (confirmedDish !== "未選擇" || confirmedDrink !== "未選擇")

  return (
    <>
      {shouldShowConfirmationCard && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="w-full max-w-md drop-shadow-2xl">
            <OrderConfirmationCard
              dish={confirmedDish}
              drink={confirmedDrink}
              memberName={MEMBERS.find((m) => m.id === currentMember)?.nameInChinese}
              isModified={isModified}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-0 border rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTab("tingkok")}
            className={`py-3 text-center font-bold transition-colors ${
              activeTab === "tingkok" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            汀角路茶座
          </button>
          <button
            onClick={() => setActiveTab("foodpanda")}
            className={`py-3 text-center font-bold transition-colors ${
              activeTab === "foodpanda" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={activeTab === "foodpanda" ? { backgroundColor: '#d70f64' } : {}}
          >
            🐼 foodpanda
          </button>
        </div>

        {activeTab === "tingkok" && (
          <>
            <div className="border rounded-md p-4">
              <h3 className="font-bold text-lg mb-4">汀角路茶座 - 今日餐單 ({weekday})</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="no-dish" name="dish" value="" checked={selectedDish === ""} onChange={() => setSelectedDish("")} className="mr-2" />
                  <label htmlFor="no-dish">不選擇餐點</label>
                </div>
                {todayMenu.map((dish, index) => (
                  <div key={index} className="flex items-center">
                    <input type="radio" id={`dish-${index}`} name="dish" value={dish} checked={selectedDish === dish} onChange={() => setSelectedDish(dish)} className="mr-2" />
                    <label htmlFor={`dish-${index}`}>{dish}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-bold text-lg mb-4">飲品選擇</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <input type="radio" id="no-drink" name="drink" value="" checked={selectedDrink === ""} onChange={() => setSelectedDrink("")} className="mr-2" />
                  <label htmlFor="no-drink">不選擇飲品</label>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">熱飲</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DRINKS.hot.map((drink, index) => (
                        <div key={index} className="flex items-center">
                          <input type="radio" id={`drink-hot-${index}`} name="drink" value={drink.name} checked={selectedDrink === drink.name} onChange={() => setSelectedDrink(drink.name)} className="mr-2" />
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
                          <input type="radio" id={`drink-cold-${index}`} name="drink" value={drink.name} checked={selectedDrink === drink.name} onChange={() => setSelectedDrink(drink.name)} className="mr-2" />
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
                          <input type="radio" id={`drink-other-${index}`} name="drink" value={drink.name} checked={selectedDrink === drink.name} onChange={() => setSelectedDrink(drink.name)} className="mr-2" />
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
                className={`w-full py-3 rounded-md text-white font-bold ${hasOrdered(currentMember) ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} disabled:opacity-50`}
              >
                {isSubmitting ? "處理中..." : hasOrdered(currentMember) ? "修改落單" : "確認落單"}
              </button>
              {hasOrdered(currentMember) && (
                <button onClick={handleCancel} disabled={isSubmitting} className="w-full py-3 rounded-md bg-gray-200 hover:bg-gray-300 font-bold disabled:opacity-50">
                  {isSubmitting ? "處理中..." : "取消落單"}
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === "foodpanda" && (
          <>
            <div className="border rounded-md p-4" style={{ borderColor: '#d70f64' }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: '#d70f64' }}>
                🐼 {FOODPANDA_RESTAURANT.name} - 餐點選擇
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="fp-no-dish" name="fp-dish" value="" checked={selectedFpDish === ""} onChange={() => setSelectedFpDish("")} className="mr-2 accent-pink-600" />
                  <label htmlFor="fp-no-dish">不選擇餐點</label>
                </div>
              </div>
              {FOODPANDA_RESTAURANT.menu.map((cat, catIdx) => (
                <div key={catIdx} className="mt-4">
                  <h4 className="font-medium mb-2 text-pink-800">{cat.category}</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center">
                        <input type="radio" id={`fp-dish-${catIdx}-${itemIdx}`} name="fp-dish" value={item.name} checked={selectedFpDish === item.name} onChange={() => setSelectedFpDish(item.name)} className="mr-2 accent-pink-600" />
                        <label htmlFor={`fp-dish-${catIdx}-${itemIdx}`}>{item.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-md p-4" style={{ borderColor: '#d70f64' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>選項（麵の種類）</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {FOODPANDA_RESTAURANT.noodleOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center">
                    <input type="radio" id={`fp-noodle-${idx}`} name="fp-noodle" value={opt.name} checked={selectedFpNoodle === opt.name} onChange={() => setSelectedFpNoodle(opt.name)} className="mr-2 accent-pink-600" />
                    <label htmlFor={`fp-noodle-${idx}`} className="text-sm">{opt.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4" style={{ borderColor: '#d70f64' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>追加</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {FOODPANDA_RESTAURANT.addOns.map((opt, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`fp-addon-${idx}`}
                      checked={opt.name === "不用加配" ? selectedFpAddOns.includes("不用加配") : selectedFpAddOns.includes(opt.name)}
                      onChange={() => toggleAddOn(opt.name)}
                      className="mr-2 accent-pink-600"
                    />
                    <label htmlFor={`fp-addon-${idx}`} className="text-sm">{opt.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4" style={{ borderColor: '#d70f64' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>飲品選擇</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="fp-no-drink" name="fp-drink" value="" checked={selectedFpDrink === ""} onChange={() => setSelectedFpDrink("")} className="mr-2 accent-pink-600" />
                  <label htmlFor="fp-no-drink">不選擇飲品</label>
                </div>
              </div>
              {FOODPANDA_RESTAURANT.drinks.map((cat, catIdx) => (
                <div key={catIdx} className="mt-4">
                  <h4 className="font-medium mb-2 text-pink-800">{cat.category}</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center">
                        <input type="radio" id={`fp-drink-${catIdx}-${itemIdx}`} name="fp-drink" value={item.name} checked={selectedFpDrink === item.name} onChange={() => setSelectedFpDrink(item.name)} className="mr-2 accent-pink-600" />
                        <label htmlFor={`fp-drink-${catIdx}-${itemIdx}`} className="text-sm">{item.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleFpSubmit}
                disabled={!selectedFpDish && !selectedFpDrink}
                className="w-full py-3 rounded-md text-white font-bold disabled:opacity-50"
                style={{ backgroundColor: hasFpOrdered(currentMember) ? '#b91c1c' : '#d70f64' }}
              >
                {hasFpOrdered(currentMember) ? "修改 foodpanda 落單" : "確認 foodpanda 落單"}
              </button>
              {hasFpOrdered(currentMember) && (
                <button onClick={handleFpCancel} className="w-full py-3 rounded-md bg-gray-200 hover:bg-gray-300 font-bold">
                  取消 foodpanda 落單
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
