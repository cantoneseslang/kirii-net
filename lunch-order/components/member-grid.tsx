"use client"

import { useOrders } from "../context/order-context"
import { MEMBERS } from "../data/members"

export default function MemberGrid() {
  const { currentMember, setCurrentMember, hasOrdered } = useOrders()

  return (
    <div className="grid grid-cols-2 gap-3">
      {MEMBERS.map((member) => (
        <div
          key={member.id}
          className={`border rounded-md p-4 cursor-pointer ${
            currentMember === member.id ? "border-blue-500 border-2" : "border-gray-200"
          } ${hasOrdered(member.id) ? "bg-green-50" : "bg-white"}`}
          onClick={() => setCurrentMember(member.id)}
        >
          <div className="font-bold text-lg">{member.nameInChinese}</div>
          <div className="text-gray-600">{member.nameInEnglish}</div>
          {hasOrdered(member.id) && <div className="text-green-600 mt-1">已訂購</div>}
        </div>
      ))}
    </div>
  )
}
