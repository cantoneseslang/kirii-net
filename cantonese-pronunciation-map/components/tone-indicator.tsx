import type React from "react"
import styled from "styled-components"

interface ToneIndicatorProps {
  tone: string
}

const ToneIndicator: React.FC<ToneIndicatorProps> = ({ tone }) => {
  // 広東語の声調に対応する色とスタイル
  const getToneColor = (tone: string) => {
    switch (tone) {
      case "1":
        return "#FF5252" // 高平調 - 赤
      case "2":
        return "#FF9800" // 中昇調 - オレンジ
      case "3":
        return "#FFEB3B" // 中平調 - 黄色
      case "4":
        return "#4CAF50" // 低降調 - 緑
      case "5":
        return "#2196F3" // 低昇調 - 青
      case "6":
        return "#9C27B0" // 低平調 - 紫
      default:
        return "#FFFFFF" // デフォルト - 白
    }
  }

  // 声調の説明
  const getToneDescription = (tone: string) => {
    switch (tone) {
      case "1":
        return "高平調"
      case "2":
        return "中昇調"
      case "3":
        return "中平調"
      case "4":
        return "低降調"
      case "5":
        return "低昇調"
      case "6":
        return "低平調"
      default:
        return ""
    }
  }

  return (
    <ToneWrapper color={getToneColor(tone)} title={getToneDescription(tone)}>
      {tone}
    </ToneWrapper>
  )
}

const ToneWrapper = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  color: #000;
  font-weight: bold;
  font-size: 0.8em;
  margin-left: 0.3em;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`

export default ToneIndicator
