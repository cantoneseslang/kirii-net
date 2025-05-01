"use client"

import { useState, useEffect } from "react"

export default function CurrentDateTime() {
  const [dateTime, setDateTime] = useState(new Date())
  const [cutoffTime, setCutoffTime] = useState("10:00")

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formattedDate = `${dateTime.getFullYear()}年${dateTime.getMonth() + 1}月${dateTime.getDate()}日${dateTime.toLocaleDateString("zh-HK", { weekday: "long" })}`
  const formattedTime = `${String(dateTime.getHours()).padStart(2, "0")}:${String(dateTime.getMinutes()).padStart(2, "0")}:${String(dateTime.getSeconds()).padStart(2, "0")}`

  return (
    <div className="text-right">
      <div>{formattedDate}</div>
      <div className="text-xl font-bold">{formattedTime}</div>
      <div className="text-red-500">截止時間: {cutoffTime}</div>
    </div>
  )
}
