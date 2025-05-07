"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

const getChineseWeekday = (date: Date) => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return weekdays[date.getDay()];
};

export default function CurrentDateTime() {
  const [currentTime, setCurrentTime] = useState({
    date: "",
    time: ""
  })
  const [isOrderingTime, setIsOrderingTime] = useState(true)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formattedDate = format(now, 'yyyy年MM月dd日');
      const weekday = getChineseWeekday(now);
      setCurrentTime({
        date: `${formattedDate} (${weekday})`,
        time: format(now, 'HH:mm:ss')
      });

      // 10:00より前かどうかをチェック
      const orderEndTime = new Date(now)
      orderEndTime.setHours(10, 0, 0)
      setIsOrderingTime(now < orderEndTime)
    }

    updateTime()
    const intervalId = setInterval(updateTime, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="text-right">
      <div className="text-[10px] sm:text-xl">
        <span className="whitespace-nowrap">{currentTime.date}</span><br />
        {currentTime.time}
      </div>
      <div className="text-red-500">截止時間: 10:00</div>
      {!isOrderingTime && (
        <div className="text-red-500 font-bold">已過截止時間</div>
      )}
    </div>
  )
}
