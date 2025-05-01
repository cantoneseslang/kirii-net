"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default function CurrentDateTime() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    // 初期値を設定
    setCurrentTime(new Date())

    // 1秒ごとに更新
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!currentTime) {
    return null // 初期レンダリング時は何も表示しない
  }

  const formattedDate = format(currentTime, "yyyy年MM月dd日 (E)", { locale: ja })
  const formattedTime = format(currentTime, "HH:mm:ss")
  const cutoffTime = "11:00"

  return (
    <div className="text-right">
      <div>{formattedDate}</div>
      <div className="text-xl font-bold">{formattedTime}</div>
      <div className="text-red-500">截止時間: {cutoffTime}</div>
    </div>
  )
}
