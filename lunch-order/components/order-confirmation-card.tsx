"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OrderConfirmationCardProps {
  dish: string
  drink: string
  memberName?: string
  isModified?: boolean
  /** 茶餐廳＝青、foodpanda＝ブランド赤（#d70f64）でカード枠・ヘッダー背景を切替 */
  channel?: "tingkok" | "foodpanda"
  /** 汀角路／foodpanda 兩邊互斥時の全文（此欄有值則只顯示提示，不顯示餐單內容） */
  crossOrderWarning?: string | null
  onDismissCrossOrderWarning?: () => void
}

export default function OrderConfirmationCard({
  dish,
  drink,
  isModified = false,
  channel = "tingkok",
  crossOrderWarning,
  onDismissCrossOrderWarning,
}: OrderConfirmationCardProps) {
  if (crossOrderWarning) {
    return (
      <Card className="w-full border-2 border-amber-500 shadow-lg pointer-events-auto">
        <CardHeader className="bg-amber-50 pb-3">
          <CardTitle className="text-lg font-bold text-gray-800">溫馨提示</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{crossOrderWarning}</p>
          {onDismissCrossOrderWarning && (
            <button
              type="button"
              onClick={onDismissCrossOrderWarning}
              className="w-full py-2.5 rounded-md bg-amber-500 text-white font-bold hover:bg-amber-600"
            >
              知道了
            </button>
          )}
        </CardContent>
      </Card>
    )
  }

  // 食事とドリンクの両方があるかチェック
  const hasDish = dish && dish !== "未選擇"
  const hasDrink = drink && drink !== "未選擇"
  const isDrinksOnly = !hasDish && hasDrink
  const isFoodOnly = hasDish && !hasDrink

  // 広東語のテキスト
  const titleText = isModified ? "今日你訂左嘅午餐係以下內容" : "今日你訂咗嘅午餐係以下內容"
  const setMealText = "餐飲套餐"
  const drinksOnlyText = "只係飲品"
  const drinksConcernText = "你唔肚餓咩？唔使嗌嘢食阿？"
  const foodConcernText = "你食嘢嗰陣唔口渴咩？唔使嗌嘢飲阿？"
  const modifiedMessage = "我幫你改左單啦！"
  
  // 注文がない場合は表示しない
  if (!hasDish && !hasDrink) {
    return null
  }

  const isFoodpanda = channel === "foodpanda"

  return (
    <Card
      className={cn(
        "w-full border-2 shadow-lg",
        isFoodpanda ? "border-[#d70f64]" : "border-blue-500",
      )}
    >
      <CardHeader
        className={cn("pb-3", isFoodpanda ? "bg-[#fff0f5]" : "bg-blue-50")}
      >
        <CardTitle className="text-lg font-bold text-gray-800">
          {titleText}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {/* 修正メッセージ */}
        {isModified && (
          <div className="text-green-600 font-semibold text-base pb-2">
            {modifiedMessage}
          </div>
        )}
        {/* タイプ表示 */}
        <div className="font-semibold text-gray-700 text-base">
          {isDrinksOnly ? drinksOnlyText : setMealText}
        </div>

        {/* 注文内容 */}
        <div className="space-y-2 pl-2">
          {hasDish && (
            <div className="text-gray-700">
              {dish} <span className="text-gray-500">1個</span>
            </div>
          )}
          {hasDrink && (
            <div className="text-gray-700">
              {drink} <span className="text-gray-500">1個</span>
            </div>
          )}
        </div>

        {/* ドリンクのみの場合のメッセージ */}
        {isDrinksOnly && (
          <div className="pt-2 text-orange-600 text-lg font-bold">
            {drinksConcernText}
          </div>
        )}
        {isFoodOnly && (
          <div
            className={cn(
              "pt-2 text-lg font-bold",
              isFoodpanda ? "text-[#d70f64]" : "text-blue-600",
            )}
          >
            {foodConcernText}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
