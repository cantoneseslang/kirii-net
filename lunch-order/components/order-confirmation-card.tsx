"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderConfirmationCardProps {
  dish: string
  drink: string
  memberName?: string
  isModified?: boolean
}

export default function OrderConfirmationCard({ dish, drink, memberName, isModified = false }: OrderConfirmationCardProps) {
  // 食事とドリンクの両方があるかチェック
  const hasDish = dish && dish !== "未選擇"
  const hasDrink = drink && drink !== "未選擇"
  const isDrinksOnly = !hasDish && hasDrink

  // 広東語のテキスト
  const titleText = isModified ? "今日你訂左嘅午餐係以下內容" : "今日你訂咗嘅午餐係以下內容"
  const setMealText = "餐飲套餐"
  const drinksOnlyText = "只係飲品"
  const concernText = "你唔肚餓咩？唔使嗌嘢食阿？"
  const modifiedMessage = "我幫你改左單啦！"
  
  // 注文がない場合は表示しない
  if (!hasDish && !hasDrink) {
    return null
  }

  return (
    <Card className="w-full border-2 border-blue-500 shadow-lg">
      <CardHeader className="bg-blue-50 pb-3">
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
            {concernText}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
