import { NextResponse } from "next/server"
import { pronunciationTable } from "@/data/pronunciationTable"
import type { CantoneseDataItem } from "@/types/cantonese"

export async function GET() {
  try {
    // pronunciationTableからデータを変換
    const data: CantoneseDataItem[] = []
    
    // 各母音と子音の組み合わせをループ
    Object.entries(pronunciationTable.cells).forEach(([final, consonants]) => {
      Object.entries(consonants).forEach(([initial, info]) => {
        if (info) {
          data.push({
            id: info.jyutping,
            kanji: info.kanji,
            jyutping: info.jyutping,
            katakana: info.katakana,
            audioPath: `/audio/${info.jyutping}.mp3`,
          })
        }
      })
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("データの取得に失敗しました:", error)
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 })
  }
}
