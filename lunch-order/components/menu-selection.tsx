"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useOrders } from "../context/order-context"
import { toast } from "react-hot-toast"
import { DRINKS } from "../data/menu-schedule"
import { FOODPANDA_RESTAURANT } from "../data/foodpanda-menu"
import { getHongKongDateKey, isWeekendHongKong } from "../lib/hong-kong-calendar"
import OrderConfirmationCard from "./order-confirmation-card"
import OperatorSelectDialog from "./operator-select-dialog"

function getFpDishCategory(dishName: string): string | null {
  if (!dishName) return null
  for (const cat of FOODPANDA_RESTAURANT.menu) {
    if (cat.items.some((i) => i.name === dishName)) return cat.category
  }
  return null
}

/** 確認カード用：餐點＋麵種＋追加を1行にまとめる */
const CROSS_ORDER_MSG_FP_BLOCKED =
  "你已經喺汀角路茶座落咗單，請先取消目前汀角路訂單，再落 foodpanda。"
const CROSS_ORDER_MSG_TINGKOK_BLOCKED =
  "你已經喺 foodpanda 落咗單，請先取消目前 foodpanda 訂單，再落汀角路茶座。"
const FP_WEEKEND_TOAST =
  "星期六、日（香港時間）因人數不足，唔接受 foodpanda 新訂單同修改；如需取消請用「取消落單」。"

function formatFpOrderForCard(o: {
  dish: string
  noodle: string
  addOns: string[]
  drink: string
}): { dishLine: string; drink: string } {
  const parts = [o.dish]
  if (o.noodle && o.noodle !== "不適用") {
    parts.push(`麵：${o.noodle}`)
  }
  const extras = o.addOns?.filter((x) => x && x !== "不用加配") ?? []
  if (extras.length) {
    parts.push(`追加：${extras.join("、")}`)
  }
  return { dishLine: parts.join(" "), drink: o.drink }
}

function sameMemberId(a: unknown, b: unknown): boolean {
  return String(a ?? "") === String(b ?? "")
}

const REQUEST_TIMEOUT_MS = 20_000

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("TIMEOUT:")
}

async function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`TIMEOUT:${label}`)), timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export default function MenuSelection() {
  const [selectedDish, setSelectedDish] = useState("")
  const [selectedDrink, setSelectedDrink] = useState("")
  const [orderChannel, setOrderChannel] = useState<"tingkok" | "foodpanda">("tingkok")
  const [selectedFpDish, setSelectedFpDish] = useState("")
  const [selectedFpNoodle, setSelectedFpNoodle] = useState(
    () => FOODPANDA_RESTAURANT.noodleOptions[0]?.name ?? "",
  )
  const [selectedFpAddOns, setSelectedFpAddOns] = useState<string[]>([])
  const [selectedFpDrink, setSelectedFpDrink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedDish, setConfirmedDish] = useState("")
  const [confirmedDrink, setConfirmedDrink] = useState("")
  const [isModified, setIsModified] = useState(false)
  const [crossOrderWarning, setCrossOrderWarning] = useState<string | null>(null)
  const [operatorDialogOpen, setOperatorDialogOpen] = useState(false)
  const [pendingCancelType, setPendingCancelType] = useState<"tingkok" | "foodpanda" | null>(null)
  const isJustModifiedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const showConfirmationRef = useRef(false)
  /** foodpanda フォーム：ポーリングで foodpandaOrders が変わるたびに未注文分岐で消さないための同期用 */
  const prevFpSyncMemberRef = useRef<string | null>(null)
  const lastHadFpOrderRef = useRef(false)

  const {
    currentMember,
    addOrder,
    hasOrdered,
    resetOrderStatus,
    modifyOrder,
    getOrdersForDate,
    cancelOrder,
    employees,
    menuItems,
    getManagedMenuForWeekday,
    foodpandaOrders,
    addFpOrder,
    hasFpOrdered,
    cancelFpOrder,
  } = useOrders()

  const [weekday, setWeekday] = useState("")
  const [todayMenu, setTodayMenu] = useState<string[]>([])
  /** 香港の土日に入ったタイミングで UI を更新（開きっぱなし対策） */
  const [hkClockTick, setHkClockTick] = useState(0)
  const fpWeekend = useMemo(() => isWeekendHongKong(), [hkClockTick])

  useEffect(() => {
    const id = setInterval(() => setHkClockTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const fetchMenu = useCallback(() => {
    try {
      const nextWeekday = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
      const dishes = getManagedMenuForWeekday(nextWeekday)
      setWeekday(nextWeekday)
      setTodayMenu(dishes)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "❌ CRITICAL ERROR: Failed to load managed menu data."
      console.error(errorMsg, error)
      toast.error(errorMsg)
      setTodayMenu([])
    }
  }, [getManagedMenuForWeekday])

  const updateOrderStatus = useCallback(async () => {
    await resetOrderStatus()
  }, [resetOrderStatus])

  // menuItems: Supabase の meta-menu が載るたびに落單の候補を同期（管理で保存しても即反映）
  useEffect(() => {
    fetchMenu()
    updateOrderStatus()
    const intervalId = setInterval(() => {
      fetchMenu()
      updateOrderStatus()
    }, 60000)
    return () => clearInterval(intervalId)
  }, [fetchMenu, updateOrderStatus, menuItems])

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
        const todayOrders = getOrdersForDate(getHongKongDateKey())
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
      } else if (currentMember && hasFpOrdered(currentMember)) {
        const fpOrder = foodpandaOrders.find((order) => sameMemberId(order.member_id, currentMember))
        if (fpOrder) {
          const { dishLine, drink } = formatFpOrderForCard(fpOrder)
          setConfirmedDish(dishLine)
          setConfirmedDrink(drink)
        }
      }
      return
    }
    if (currentMember && hasOrdered(currentMember)) {
      const todayOrders = getOrdersForDate(getHongKongDateKey())
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
    } else if (currentMember && hasFpOrdered(currentMember)) {
      const fpOrder = foodpandaOrders.find((order) => sameMemberId(order.member_id, currentMember))
      if (fpOrder) {
        const { dishLine, drink } = formatFpOrderForCard(fpOrder)
        setConfirmedDish(dishLine)
        setConfirmedDrink(drink)
        setShowConfirmation(true)
        showConfirmationRef.current = true
        setIsModified(false)
      }
    } else if (!currentMember) {
      setSelectedDish("")
      setSelectedDrink("")
      setShowConfirmation(false)
      showConfirmationRef.current = false
      setConfirmedDish("")
      setConfirmedDrink("")
      setIsModified(false)
      setCrossOrderWarning(null)
    } else {
      setShowConfirmation(false)
      showConfirmationRef.current = false
      setConfirmedDish("")
      setConfirmedDrink("")
      setIsModified(false)
      setCrossOrderWarning(null)
    }
  }, [currentMember, hasOrdered, hasFpOrdered, getOrdersForDate, foodpandaOrders])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  useEffect(() => {
    if (!currentMember) {
      prevFpSyncMemberRef.current = null
      lastHadFpOrderRef.current = false
      return
    }
    const existing = foodpandaOrders.find((o) => sameMemberId(o.member_id, currentMember))
    const memberChanged = prevFpSyncMemberRef.current !== currentMember
    prevFpSyncMemberRef.current = currentMember

    if (existing) {
      lastHadFpOrderRef.current = true
      setSelectedFpDish(existing.dish)
      setSelectedFpNoodle(
        existing.noodle && existing.noodle !== "不適用"
          ? existing.noodle
          : FOODPANDA_RESTAURANT.noodleOptions[0]?.name ?? "",
      )
      setSelectedFpAddOns(existing.addOns?.length ? existing.addOns : [])
      setSelectedFpDrink(existing.drink)
    } else if (memberChanged || lastHadFpOrderRef.current) {
      lastHadFpOrderRef.current = false
      setSelectedFpDish("")
      setSelectedFpNoodle(FOODPANDA_RESTAURANT.noodleOptions[0]?.name ?? "")
      setSelectedFpAddOns([])
      setSelectedFpDrink("")
    }
  }, [currentMember, foodpandaOrders])

  /** 土日・香港時間：未注文なら foodpanda タブを開けない（注文済みは取消のため開ける） */
  useEffect(() => {
    if (!fpWeekend || !currentMember) return
    if (hasFpOrdered(currentMember)) return
    if (orderChannel === "foodpanda") setOrderChannel("tingkok")
  }, [fpWeekend, currentMember, orderChannel, hasFpOrdered, foodpandaOrders])

  const fpCategory = getFpDishCategory(selectedFpDish)
  const showFpNoodle = fpCategory === "拉麵早餐"

  const toggleFpAddOn = (name: string) => {
    if (fpWeekend) return
    if (name === "不用加配") {
      setSelectedFpAddOns(["不用加配"])
      return
    }
    setSelectedFpAddOns((prev) => {
      const next = prev.filter((x) => x !== "不用加配")
      if (next.includes(name)) return next.filter((x) => x !== name)
      return [...next, name]
    })
  }

  const handleFpSubmit = async () => {
    if (!currentMember) {
      toast.error("請選擇訂餐人")
      return
    }
    if (isWeekendHongKong()) {
      toast.error(FP_WEEKEND_TOAST)
      return
    }
    if (!selectedFpDish) {
      toast.error("請選擇 foodpanda 餐點")
      return
    }
    if (!selectedFpDrink) {
      toast.error("請選擇 foodpanda 飲品")
      return
    }
    const member = employees.find((m) => m.id === currentMember)
    if (!member) {
      toast.error("無效訂餐人")
      return
    }
    if (hasOrdered(currentMember)) {
      setCrossOrderWarning(CROSS_ORDER_MSG_FP_BLOCKED)
      setShowConfirmation(true)
      showConfirmationRef.current = true
      return
    }
    const noodle = showFpNoodle ? selectedFpNoodle : "不適用"
    const addOns = selectedFpAddOns.length > 0 ? selectedFpAddOns : ["不用加配"]
    const isFpUpdate = foodpandaOrders.some((o) => sameMemberId(o.member_id, currentMember))
    try {
      setIsSubmitting(true)
      setCrossOrderWarning(null)
      await withTimeout(
        addFpOrder({
          member_id: currentMember,
          member_name: member.nameInChinese,
          dish: selectedFpDish,
          noodle,
          addOns,
          drink: selectedFpDrink,
        }),
        "foodpanda submit",
      )
      const { dishLine, drink: drinkLine } = formatFpOrderForCard({
        dish: selectedFpDish,
        noodle,
        addOns,
        drink: selectedFpDrink,
      })
      setConfirmedDish(dishLine)
      setConfirmedDrink(drinkLine)
      setShowConfirmation(true)
      showConfirmationRef.current = true
      if (isFpUpdate) {
        isJustModifiedRef.current = true
        setIsModified(true)
      } else {
        isJustModifiedRef.current = false
        setIsModified(false)
      }
      toast.success(isFpUpdate ? "foodpanda 落單已修改" : "foodpanda 落單已提交")
    } catch (error) {
      if (isTimeoutError(error)) {
        toast.error("foodpanda 請求逾時，請再試一次")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const operatorOptions = employees.map((e) => e.nameInChinese || e.nameInEnglish).filter(Boolean)

  const openFpCancelDialog = () => {
    if (!currentMember) {
      toast.error("請先選擇訂餐人")
      return
    }
    setPendingCancelType("foodpanda")
    setOperatorDialogOpen(true)
  }

  const handleFpCancel = async (actorName: string) => {
    if (!currentMember) return
    try {
      setIsSubmitting(true)
      await withTimeout(cancelFpOrder(currentMember, { actorName }), "foodpanda cancel")
      setSelectedFpDish("")
      setSelectedFpNoodle(FOODPANDA_RESTAURANT.noodleOptions[0]?.name ?? "")
      setSelectedFpAddOns([])
      setSelectedFpDrink("")
      if (!hasOrdered(currentMember)) {
        setShowConfirmation(false)
        showConfirmationRef.current = false
        setConfirmedDish("")
        setConfirmedDrink("")
        setIsModified(false)
      }
      setOperatorDialogOpen(false)
      setPendingCancelType(null)
      toast.success("foodpanda 落單已取消")
    } catch (error) {
      if (isTimeoutError(error)) {
        toast.error("foodpanda 取消逾時，請再試一次")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentMember) { toast.error("請選擇訂餐人"); return }
    if (!selectedDish && !selectedDrink) { toast.error("請至少選擇餐點或飲品"); return }
    const member = employees.find((m) => m.id === currentMember)
    if (!member) { toast.error("無效訂餐人"); return }
    if (hasFpOrdered(currentMember)) {
      setCrossOrderWarning(CROSS_ORDER_MSG_TINGKOK_BLOCKED)
      setShowConfirmation(true)
      showConfirmationRef.current = true
      return
    }
    try {
      setIsSubmitting(true)
      setCrossOrderWarning(null)
      const todayOrders = getOrdersForDate(getHongKongDateKey())
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
        await withTimeout(
          modifyOrder(existingOrder.id, { member_id: currentMember, member_name: member.nameInChinese, dish: finalDish, drink: finalDrink }),
          "tingkok modify",
        )
        toast.success("訂單已成功修改")
      } else {
        isJustModifiedRef.current = false
        setIsModified(false)
        await withTimeout(
          addOrder({ member_id: currentMember, member_name: member.nameInChinese, dish: finalDish, drink: finalDrink }),
          "tingkok submit",
        )
        toast.success("訂單已成功提交")
      }
      await new Promise(resolve => setTimeout(resolve, 100))
      setShowConfirmation(true)
      showConfirmationRef.current = true
      setConfirmedDish(finalDish)
      setConfirmedDrink(finalDrink)
    } catch (error) {
      console.error("Error submitting/modifying order:", error)
      if (isTimeoutError(error)) {
        toast.error("汀角路請求逾時，請再試一次")
      } else {
        toast.error("訂單提交/修改失敗，請稍後再試")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openTingkokCancelDialog = () => {
    if (!currentMember) { toast.error("請先選擇訂餐人"); return }
    setPendingCancelType("tingkok")
    setOperatorDialogOpen(true)
  }

  const handleCancel = async (actorName: string) => {
    if (!currentMember) return
    try {
      setIsSubmitting(true)
      await withTimeout(cancelOrder(currentMember, { actorName }), "tingkok cancel")
      setSelectedDish("")
      setSelectedDrink("")
      const fpAfter = foodpandaOrders.find((o) => sameMemberId(o.member_id, currentMember))
      if (fpAfter) {
        const { dishLine, drink } = formatFpOrderForCard(fpAfter)
        setConfirmedDish(dishLine)
        setConfirmedDrink(drink)
        setShowConfirmation(true)
        showConfirmationRef.current = true
        setIsModified(false)
      } else {
        setShowConfirmation(false)
        showConfirmationRef.current = false
        setConfirmedDish("")
        setConfirmedDrink("")
        setIsModified(false)
      }
      setOperatorDialogOpen(false)
      setPendingCancelType(null)
      toast.success("訂單已取消")
    } catch (error) {
      console.error("Error cancelling order:", error)
      if (isTimeoutError(error)) {
        toast.error("取消請求逾時，請再試一次")
      } else {
        toast.error("訂單取消失敗，請稍後再試")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentMember) {
    return <div className="border rounded-md p-6 bg-gray-50 text-center text-gray-500">請先選擇訂餐人</div>
  }

  const dismissCrossOrderWarning = () => {
    setCrossOrderWarning(null)
    const hasAny =
      !!currentMember && (hasOrdered(currentMember) || hasFpOrdered(currentMember))
    if (hasAny) {
      setShowConfirmation(true)
      showConfirmationRef.current = true
    } else {
      setShowConfirmation(false)
      showConfirmationRef.current = false
    }
  }

  /** 全画面 fixed はモバイルでタッチを奪うことがあるため、通常の落單確認はインラインのみ */
  const showCrossOrderModal = crossOrderWarning != null
  const showInlineOrderConfirmation =
    (showConfirmation || showConfirmationRef.current) &&
    !showCrossOrderModal &&
    (confirmedDish !== "未選擇" || confirmedDrink !== "未選擇")

  const confirmationChannel: "tingkok" | "foodpanda" =
    currentMember && hasFpOrdered(currentMember) ? "foodpanda" : "tingkok"

  const fpChannelDisabled = fpWeekend && !hasFpOrdered(currentMember)
  const fpFormLocked = fpWeekend

  return (
    <>
      {showCrossOrderModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4 pointer-events-auto bg-black/20"
          onClick={dismissCrossOrderWarning}
          role="presentation"
        >
          <div className="w-full max-w-md drop-shadow-2xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <OrderConfirmationCard
              dish={confirmedDish}
              drink={confirmedDrink}
              memberName={employees.find((m) => m.id === currentMember)?.nameInChinese}
              isModified={isModified}
              channel={confirmationChannel}
              crossOrderWarning={crossOrderWarning}
              onDismissCrossOrderWarning={dismissCrossOrderWarning}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {showInlineOrderConfirmation && (
          <div className="sticky top-0 z-20 mb-1 drop-shadow-md">
            <OrderConfirmationCard
              dish={confirmedDish}
              drink={confirmedDrink}
              memberName={employees.find((m) => m.id === currentMember)?.nameInChinese}
              isModified={isModified}
              channel={confirmationChannel}
            />
          </div>
        )}

        <div className="rounded-lg border-2 border-gray-200 bg-gray-50/80 p-3 sm:p-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">選擇落單渠道（只會顯示一邊餐單）</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setOrderChannel("tingkok")}
              className={`rounded-lg border-2 px-3 py-3 text-left transition-all ${
                orderChannel === "tingkok"
                  ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-400/50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="font-bold text-blue-800">汀角路茶座</div>
              <div className="text-xs text-gray-600 mt-1">今日餐單</div>
            </button>
            <button
              type="button"
              disabled={fpChannelDisabled}
              onClick={() => setOrderChannel("foodpanda")}
              className={`rounded-lg border-2 px-3 py-3 text-left transition-all ${
                fpChannelDisabled
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-80"
                  : orderChannel === "foodpanda"
                    ? "bg-pink-50 shadow-md ring-2 ring-pink-400/50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
              style={
                fpChannelDisabled
                  ? undefined
                  : { borderColor: orderChannel === "foodpanda" ? "#d70f64" : undefined }
              }
            >
              <div
                className="font-bold flex items-center gap-1"
                style={{ color: fpChannelDisabled ? "#9ca3af" : "#d70f64" }}
              >
                <span aria-hidden>🐼</span> foodpanda
              </div>
              <div className={`text-xs mt-1 line-clamp-2 ${fpChannelDisabled ? "text-gray-400" : "text-gray-600"}`}>
                {FOODPANDA_RESTAURANT.name}
              </div>
              {fpChannelDisabled ? (
                <div className="text-[11px] text-gray-400 mt-1.5 leading-snug">
                  星期六、日（香港時間）因人數不足暫停落單
                </div>
              ) : null}
            </button>
          </div>
          {fpWeekend ? (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              星期六、日（香港時間）因人數不足，暫停 foodpanda 新訂單及修改；汀角路茶座照常。已有 foodpanda 訂單可進入查看或取消。
            </p>
          ) : null}
          <p className="text-xs font-medium mt-2 text-gray-600">
            {orderChannel === "tingkok" ? (
              <>目前：<span className="text-blue-700">汀角路茶座</span> 落單</>
            ) : (
              <>目前：<span style={{ color: "#d70f64" }}>foodpanda 外賣</span> 落單</>
            )}
          </p>
        </div>

        {orderChannel === "tingkok" && (
          <>
        <div className="border-2 border-blue-300 rounded-md p-4 bg-blue-50/30 transition-all">
          <h3 className="font-bold text-lg mb-4 text-blue-900">汀角路茶座 - 今日餐單 ({weekday})</h3>
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

        <div className="border-2 border-blue-300 rounded-md p-4 bg-blue-50/30 transition-all">
          <h3 className="font-bold text-lg mb-4 text-blue-900">飲品選擇</h3>
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
            {isSubmitting ? "處理中..." : hasOrdered(currentMember) ? "修改落單（汀角路）" : "確認落單（汀角路）"}
          </button>
          {hasOrdered(currentMember) && (
            <button onClick={openTingkokCancelDialog} disabled={isSubmitting} className="w-full py-3 rounded-md bg-gray-200 hover:bg-gray-300 font-bold disabled:opacity-50">
              {isSubmitting ? "處理中..." : "取消落單（汀角路）"}
            </button>
          )}
        </div>
          </>
        )}

        {orderChannel === "foodpanda" && (
          <div
            className={`border-2 rounded-md overflow-hidden ${fpFormLocked ? "border-gray-300" : ""}`}
            style={fpFormLocked ? undefined : { borderColor: "#d70f64" }}
          >
            <div
              className={`px-4 py-3 border-b font-bold text-base sm:text-lg flex flex-wrap items-center gap-2 ${
                fpFormLocked ? "bg-gray-100 text-gray-500 border-gray-200" : ""
              }`}
              style={
                fpFormLocked
                  ? undefined
                  : { backgroundColor: "#fff0f5", color: "#d70f64", borderColor: "#d70f64" }
              }
            >
              <span aria-hidden>🐼</span>
              <span>foodpanda 外賣</span>
              <span className={`text-sm font-normal ${fpFormLocked ? "text-gray-500" : "text-gray-600"}`}>
                — {FOODPANDA_RESTAURANT.name}
              </span>
              {fpFormLocked ? (
                <span className="w-full text-xs font-normal text-gray-500 leading-snug">
                  星期六、日（香港時間）因人數不足，唔接受新訂單或修改；可取消原有訂單。
                </span>
              ) : null}
            </div>
            <div className={`p-4 space-y-6 ${fpFormLocked ? "bg-gray-50" : "bg-white"}`}>
              <div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>餐點選擇</h3>
                {FOODPANDA_RESTAURANT.menu.map((cat, catIdx) => (
                  <div key={catIdx} className="mt-4">
                    <h4 className="font-medium mb-2 text-pink-800">{cat.category}</h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.items.map((item, itemIdx) => (
                        <label
                          key={itemIdx}
                          htmlFor={`fp-dish-${catIdx}-${itemIdx}`}
                          className={`flex items-start gap-2 text-gray-800 ${fpFormLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                        >
                          <input
                            type="radio"
                            id={`fp-dish-${catIdx}-${itemIdx}`}
                            name="fp-dish"
                            value={item.name}
                            checked={selectedFpDish === item.name}
                            onChange={() => setSelectedFpDish(item.name)}
                            disabled={fpFormLocked}
                            className="mt-1 mr-0 accent-pink-600 shrink-0 disabled:opacity-50"
                          />
                          <span>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-pink-700 ml-2">HK${item.price}</span>
                            {item.description ? (
                              <span className="block text-sm text-gray-600 mt-0.5">{item.description}</span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {showFpNoodle && (
                <div className="border-t pt-4" style={{ borderColor: '#f9d5e5' }}>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>選項（麵類）</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FOODPANDA_RESTAURANT.noodleOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center text-gray-800">
                        <input
                          type="radio"
                          id={`fp-noodle-${idx}`}
                          name="fp-noodle"
                          checked={selectedFpNoodle === opt.name}
                          onChange={() => setSelectedFpNoodle(opt.name)}
                          disabled={fpFormLocked}
                          className="mr-2 accent-pink-600 disabled:opacity-50"
                        />
                        <label
                          htmlFor={`fp-noodle-${idx}`}
                          className={`text-sm ${fpFormLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                        >
                          {opt.name}
                          {opt.extraPrice > 0 ? ` (+$${opt.extraPrice})` : ""}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4" style={{ borderColor: '#f9d5e5' }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>追加</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {FOODPANDA_RESTAURANT.addOns.map((opt, idx) => (
                    <div key={idx} className="flex items-center text-gray-800">
                      <input
                        type="checkbox"
                        id={`fp-addon-${idx}`}
                        checked={selectedFpAddOns.includes(opt.name)}
                        onChange={() => toggleFpAddOn(opt.name)}
                        disabled={fpFormLocked}
                        className="mr-2 accent-pink-600 disabled:opacity-50"
                      />
                      <label
                        htmlFor={`fp-addon-${idx}`}
                        className={`text-sm ${fpFormLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        {opt.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#f9d5e5' }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#d70f64' }}>飲品選擇</h3>
                {FOODPANDA_RESTAURANT.drinks.map((cat, catIdx) => (
                  <div key={catIdx} className="mt-4">
                    <h4 className="font-medium mb-2 text-pink-800">{cat.category}</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center text-gray-800">
                          <input
                            type="radio"
                            id={`fp-drink-${catIdx}-${itemIdx}`}
                            name="fp-drink"
                            value={item.name}
                            checked={selectedFpDrink === item.name}
                            onChange={() => setSelectedFpDrink(item.name)}
                            disabled={fpFormLocked}
                            className="mr-2 accent-pink-600 disabled:opacity-50"
                          />
                          <label
                            htmlFor={`fp-drink-${catIdx}-${itemIdx}`}
                            className={`text-sm ${fpFormLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                          >
                            {item.name} <span className="text-gray-500">HK${item.price}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex flex-col gap-2" style={{ borderColor: '#f9d5e5' }}>
                <button
                  type="button"
                  onClick={handleFpSubmit}
                  disabled={!selectedFpDish || !selectedFpDrink || isSubmitting || fpFormLocked}
                  className="w-full py-3 rounded-md text-white font-bold disabled:opacity-50"
                  style={{ backgroundColor: '#d70f64' }}
                >
                  {isSubmitting ? "處理中..." : hasFpOrdered(currentMember) ? "修改落單（foodpanda）" : "確認落單（foodpanda）"}
                </button>
                {hasFpOrdered(currentMember) && (
                  <button
                    type="button"
                    onClick={openFpCancelDialog}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-md bg-gray-200 hover:bg-gray-300 font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? "處理中..." : "取消落單（foodpanda）"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <OperatorSelectDialog
        open={operatorDialogOpen}
        title={pendingCancelType === "foodpanda" ? "foodpanda 取消" : "汀角路 取消"}
        options={operatorOptions}
        busy={isSubmitting}
        onCancel={() => {
          if (isSubmitting) return
          setOperatorDialogOpen(false)
          setPendingCancelType(null)
        }}
        onConfirm={(actorName) => {
          if (pendingCancelType === "foodpanda") {
            void handleFpCancel(actorName)
            return
          }
          void handleCancel(actorName)
        }}
      />
    </>
  )
}
