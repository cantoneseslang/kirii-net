import type React from "react"
import styled from "styled-components"
import { getPronunciationInfo, getTableHeaders } from "@/data/pronunciationTable"

interface PronunciationTableInfoProps {
  jyutping: string
}

const PronunciationTableInfo: React.FC<PronunciationTableInfoProps> = ({ jyutping }) => {
  const info = getPronunciationInfo(jyutping.replace(/[1-6]$/, ""))
  const headers = getTableHeaders()

  // 発音表での位置を計算
  const initialIndex = headers.initialConsonants.indexOf(info.initial)
  const finalIndex = headers.finals.indexOf(info.final)

  return (
    <TableInfoContainer color={info.color}>
      <TablePosition>
        {info.final && <span className="final">{info.final}</span>}
        {info.initial && <span className="plus">+</span>}
        {info.initial && <span className="initial">{info.initial}</span>}
      </TablePosition>
      <TableCoordinates>
        {finalIndex >= 0 && initialIndex >= 0 && (
          <span>
            表内位置: {finalIndex + 1}行 {initialIndex + 1}列
          </span>
        )}
      </TableCoordinates>
    </TableInfoContainer>
  )
}

const TableInfoContainer = styled.div<{ color?: string }>`
  background-color: ${(props) => props.color || "#f5f5f5"};
  padding: 0.5em;
  border-radius: 0.3em;
  font-size: 0.8em;
  margin-top: 0.5em;
  text-align: center;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
`

const TablePosition = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3em;
  margin-bottom: 0.3em;
  
  .final {
    font-weight: bold;
    font-size: 1.2em;
  }
  
  .initial {
    font-weight: bold;
    font-size: 1.2em;
  }
  
  .plus {
    opacity: 0.7;
  }
`

const TableCoordinates = styled.div`
  font-size: 0.75em;
  opacity: 0.8;
`

export default PronunciationTableInfo
