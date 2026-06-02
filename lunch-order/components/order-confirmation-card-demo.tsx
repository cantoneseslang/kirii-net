"use client"

import OrderConfirmationCard from "./order-confirmation-card"

/**
 * 注文確認カードのサンプル表示コンポーネント
 * 開発・テスト用
 */
export default function OrderConfirmationCardDemo() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">注文確認カード サンプル</h1>
      
      {/* サンプル1: 食事とドリンクセット */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">サンプル1: 食事とドリンクセット</h2>
        <OrderConfirmationCard
          dish="冬菜榨菜蒸肉餅飯"
          drink="凍奶茶"
        />
      </div>

      {/* サンプル2: ドリンクのみ */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">サンプル2: ドリンクのみ</h2>
        <OrderConfirmationCard
          dish="未選擇"
          drink="熱咖啡"
        />
      </div>

      {/* サンプル3: 別の食事とドリンクセット */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">サンプル3: 別の食事とドリンクセット</h2>
        <OrderConfirmationCard
          dish="栗米雞絲斑腩飯"
          drink="凍檸茶"
        />
      </div>
    </div>
  )
}

