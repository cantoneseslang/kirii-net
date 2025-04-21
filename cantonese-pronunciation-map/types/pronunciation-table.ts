export interface PronunciationTableCell {
  jyutping: string
  kanji?: string
  katakana?: string
  color?: string // セルの背景色
}

export interface PronunciationTable {
  initialConsonants: string[] // 子音（列）
  finals: string[] // 母音（行）
  cells: Record<string, Record<string, PronunciationTableCell>> // [母音][子音] = セル情報
}
