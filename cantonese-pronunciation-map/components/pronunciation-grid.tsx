"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import type { CantoneseDataItem } from "@/types/cantonese"
import { Volume2 } from "lucide-react"
import { getUniqueInitials, getUniqueFinals, createPronunciationMap, extractTone } from "@/utils/pronunciation-utils"
import { consonantGroups } from "@/data/pronunciationTable"

interface PronunciationGridProps {
  data: CantoneseDataItem[]
}

const PronunciationGrid: React.FC<PronunciationGridProps> = ({ data }) => {
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [playingCell, setPlayingCell] = useState<string | null>(null)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const synth = useRef<SpeechSynthesis | null>(null)

  // データが空の場合は早期リターン
  if (!data || data.length === 0) {
    return <EmptyDataMessage>データが読み込まれていません。データファイルを確認してください。</EmptyDataMessage>
  }

  // 母音と子音のリストを抽出
  const finals = getUniqueFinals(data)
  const initials = getUniqueInitials(data)

  // 発音データをマップ形式に変換
  const pronunciationMap = createPronunciationMap(data)

  // 全ての母音を表示
  const currentFinals = finals

  // 各セルの発音データを取得する関数
  const getCellData = (final: string, initial: string) => {
    if (!pronunciationMap[final] || !pronunciationMap[final][initial]) {
      console.warn(`Missing pronunciation data for ${initial}${final}`)
      return null
    }
    return pronunciationMap[final][initial]
  }

  // 音声合成の初期化
  useEffect(() => {
    synth.current = window.speechSynthesis

    const handleVoicesChanged = () => {
      setVoicesLoaded(true)
    }

    synth.current?.addEventListener("voiceschanged", handleVoicesChanged)
    setVoicesLoaded(synth.current?.getVoices().length > 0)

    return () => {
      synth.current?.removeEventListener("voiceschanged", handleVoicesChanged)
    }
  }, [])

  // 発音を再生する関数
  const playPronunciation = (item: CantoneseDataItem, cellId: string) => {
    setPlayingCell(cellId)

    // ブラウザのSpeechSynthesisを使用
    if (synth.current) {
      const utterance = new SpeechSynthesisUtterance(item.kanji)

      // 広東語に設定（完全な広東語対応がない場合は中国語で代用）
      utterance.lang = "zh-HK" // 香港の中国語（広東語に近い）

      // 利用可能な音声から最適なものを選択
      const voices = synth.current.getVoices()
      const cantoneseVoice = voices.find(
        (voice) => voice.lang === "zh-HK" || voice.lang === "zh-TW" || voice.lang === "zh-CN",
      )

      if (cantoneseVoice) {
        utterance.voice = cantoneseVoice
      }

      utterance.onend = () => {
        setPlayingCell(null)
      }

      utterance.onerror = () => {
        console.error("Speech synthesis failed")
        setPlayingCell(null)
      }

      synth.current.speak(utterance)
    } else {
      // SpeechSynthesisがサポートされていない場合
      console.warn("Speech synthesis not supported")
      setTimeout(() => setPlayingCell(null), 1000)
    }
  }

  // カードをクリックしたときの処理
  const handleCardClick = (item: CantoneseDataItem, cellId: string) => {
    setActiveCell(cellId)
    playPronunciation(item, cellId)

    // アクティブ状態を一定時間後に解除
    setTimeout(() => {
      setActiveCell(null)
    }, 2000)
  }

  return (
    <GridContainer>
      <TableWrapper>
        <Table>
          {/* 
          ※※※ 重要 ※※※
          以下のヘッダー構造は広東語の音韻体系を正確に表現する重要な部分です。
          以下の分類と配置は言語学的に厳密な定義に基づいています：

          1. 調音位置による分類
             - 両唇音・唇歯音 (b, p, m, f)
             - 歯茎音 (d, t, n, l)
             - 軟口蓋 (g, gw, k, kw, ng)
             - 声門 (h)
             - 歯茎 (z, c, s)
             - その他 (j, w, 子音なし)

          2. 調音方法による分類
             - 破裂音（無気音/有気音）
             - 鼻音
             - 摩擦音
             - 側面音
             - 破裂+摩擦
             
          この構造は専門家の監修のもと設計されており、
          広東語学習において重要な指標となるため、
          配置や分類を勝手に変更しないでください。
          */}
          <thead>
            <tr className="header-row">
              <th className="corner"></th>
              <th colSpan={4} className="header-cell border-right">
                両唇音・唇歯音
              </th>
              <th colSpan={4} className="header-cell border-right">
                歯茎音
              </th>
              <th colSpan={5} className="header-cell border-right">
                軟口蓋
              </th>
              <th className="header-cell border-right">
                声門
              </th>
              <th colSpan={3} className="header-cell border-right">
                歯茎
              </th>
              <th className="header-cell">
                j
              </th>
              <th className="header-cell">
                w
              </th>
              <th className="header-cell">
                子音なし
              </th>
            </tr>
            <tr className="header-row">
              <th className="corner"></th>
              <th colSpan={2} className="header-cell">
                破裂音
              </th>
              <th className="header-cell">
                鼻音
              </th>
              <th className="header-cell border-right">
                摩擦音
              </th>
              <th colSpan={2} className="header-cell">
                破裂音
              </th>
              <th className="header-cell">
                鼻音
              </th>
              <th className="header-cell border-right">
                側面音
              </th>
              <th colSpan={4} className="header-cell">
                破裂
              </th>
              <th className="header-cell border-right">
                鼻
              </th>
              <th className="header-cell border-right">
                摩擦
              </th>
              <th colSpan={2} className="header-cell">
                破裂+摩擦
              </th>
              <th className="header-cell border-right">
                摩擦
              </th>
              <th className="header-cell">
              </th>
              <th className="header-cell">
              </th>
              <th className="header-cell">
              </th>
            </tr>
            <tr className="header-row">
              <th className="corner"></th>
              <th className="header-cell">
                無気音
              </th>
              <th className="header-cell">
                有気音
              </th>
              <th className="header-cell">
              </th>
              <th className="header-cell border-right">
              </th>
              <th className="header-cell">
                無気音
              </th>
              <th className="header-cell">
                有気音
              </th>
              <th className="header-cell">
              </th>
              <th className="header-cell border-right">
              </th>
              <th className="header-cell">
                無気
              </th>
              <th className="header-cell">
                無気唇音
              </th>
              <th className="header-cell">
                有気
              </th>
              <th className="header-cell">
                有気唇音
              </th>
              <th className="header-cell border-right">
              </th>
              <th className="header-cell border-right">
              </th>
              <th className="header-cell">
                無気
              </th>
              <th className="header-cell">
                有気
              </th>
              <th className="header-cell border-right">
              </th>
              <th className="header-cell">
              </th>
              <th className="header-cell">
              </th>
              <th className="header-cell">
              </th>
            </tr>
            <tr className="consonant-row">
              <th className="corner"></th>
              <th className="consonant-cell">b</th>
              <th className="consonant-cell">p</th>
              <th className="consonant-cell">m</th>
              <th className="consonant-cell border-right">f</th>
              <th className="consonant-cell">d</th>
              <th className="consonant-cell">t</th>
              <th className="consonant-cell">n</th>
              <th className="consonant-cell border-right">l</th>
              <th className="consonant-cell">g</th>
              <th className="consonant-cell">gw</th>
              <th className="consonant-cell">k</th>
              <th className="consonant-cell">kw</th>
              <th className="consonant-cell border-right">ng</th>
              <th className="consonant-cell border-right">h</th>
              <th className="consonant-cell">z</th>
              <th className="consonant-cell">c</th>
              <th className="consonant-cell border-right">s</th>
              <th className="consonant-cell">j</th>
              <th className="consonant-cell">w</th>
              <th className="consonant-cell"></th>
            </tr>
          </thead>
          <tbody>
            {currentFinals.map((final) => (
              <tr key={final}>
                <th>{final}</th>
                {["b", "p", "m", "f", "d", "t", "n", "l", "g", "gw", "k", "kw", "ng", "h", "z", "c", "s", "j", "w"].map((initial) => {
                  const item = getCellData(final, initial)
                  const cellId = `${final}-${initial}`
                  const isActive = activeCell === cellId
                  const isPlaying = playingCell === cellId

                  return (
                    <td key={cellId} className={getGroupClass(initial)}>
                      {item && (
                        <CardWrapper>
                          <CardButton
                            className={`${isActive ? "active" : ""} ${isPlaying ? "playing" : ""}`}
                            onClick={() => handleCardClick(item, cellId)}
                            $groupColor={getGroupColor(initial)}
                          >
                            <CardButtonIMG $groupColor={getGroupColor(initial)}>
                              <CardButtonIMGArrow />
                              <CardButtonIMGButton />
                              <CardContent>
                                <div className="kanji">{item.kanji}</div>
                                <div className="jyutping">
                                  {item.jyutping?.replace(/[1-6]$/, "")}
                                  {extractTone(item.jyutping || "") && (
                                    <ToneIndicator tone={extractTone(item.jyutping || "")} />
                                  )}
                                </div>
                                <div className="katakana">{item.katakana}</div>
                                <div className="play-icon">
                                  <Volume2 size={16} />
                                </div>
                              </CardContent>
                            </CardButtonIMG>
                            <CardButtonTitle>
                              <p>
                                {item.kanji} <span>{item.jyutping}</span>
                              </p>
                            </CardButtonTitle>
                          </CardButton>
                        </CardWrapper>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </GridContainer>
  )
}

// 子音グループのクラスを取得する関数
const getGroupClass = (initial: string): string => {
  if (["b", "p", "m"].includes(initial)) return "group-labial"
  if (initial === "f") return "group-labiodental"
  if (["d", "t", "n", "l"].includes(initial)) return "group-alveolar"
  if (["g", "gw", "k", "kw", "ng", "h"].includes(initial)) return "group-velar"
  if (["z", "c", "s"].includes(initial)) return "group-sibilant"
  if (["j", "w"].includes(initial)) return "group-palatal"
  return ""
}

// 子音グループごとの色を取得する関数
const getGroupColor = (initial: string): string => {
  const groups: Record<string, string> = {
    b: "rgba(232, 245, 233, 0.8)", // 緑系
    p: "rgba(232, 245, 233, 0.8)",
    m: "rgba(232, 245, 233, 0.8)",
    f: "rgba(232, 245, 233, 0.8)",
    d: "rgba(248, 224, 224, 0.8)", // 赤系
    t: "rgba(248, 224, 224, 0.8)",
    n: "rgba(248, 224, 224, 0.8)",
    l: "rgba(248, 224, 224, 0.8)",
    g: "rgba(255, 248, 225, 0.8)", // 黄系
    gw: "rgba(255, 248, 225, 0.8)",
    k: "rgba(255, 248, 225, 0.8)",
    kw: "rgba(255, 248, 225, 0.8)",
    ng: "rgba(255, 248, 225, 0.8)",
    h: "rgba(255, 248, 225, 0.8)",
    z: "rgba(227, 242, 253, 0.8)", // 青系
    c: "rgba(227, 242, 253, 0.8)",
    s: "rgba(227, 242, 253, 0.8)",
    j: "rgba(224, 247, 250, 0.8)", // 水色系
    w: "rgba(224, 247, 250, 0.8)",
  }

  return groups[initial] || "rgba(255, 255, 255, 0.05)"
}

// 声調表示コンポーネント
const ToneIndicator = styled.span<{ tone: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4em;
  height: 1.4em;
  border-radius: 50%;
  background-color: ${(props) => {
    switch (props.tone) {
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
  }};
  color: ${(props) => (["3"].includes(props.tone) ? "#000" : "#fff")};
  font-weight: bold;
  font-size: 0.8em;
  margin-left: 0.4em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const EmptyDataMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: white;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
  margin: 2rem 0;
`

const GridContainer = styled.div`
  margin: 1rem 0;
  width: 100%;
  overflow: hidden;
`

const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
  border-radius: 12px;
  overflow: hidden;

  .header-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header-cell {
    padding: 12px;
    text-align: center;
    font-weight: bold;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(0, 0, 0, 0.4);
    font-size: 1.1em;
  }

  .border-right {
    border-right: 2px solid rgba(255, 255, 255, 0.4);
  }

  .corner {
    background-color: rgba(0, 0, 0, 0.4);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .consonant-row {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .consonant-cell {
    padding: 12px;
    text-align: center;
    font-weight: bold;
    font-size: 1.4em;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  tbody th {
    padding: 12px;
    text-align: center;
    background-color: rgba(26, 43, 50, 0.9);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1.2em;
  }

  td {
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`

const CardWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
`

const CardButton = styled.button<{ $groupColor: string }>`
  width: 100%;
  height: 100%;
  min-height: 120px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  height: 100%;
  position: relative;

  .kanji {
    font-size: 2.5em;
    font-weight: bold;
    margin-bottom: 4px;
    color: #333;
  }

  .jyutping {
    font-size: 1.4em;
    margin-bottom: 2px;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .katakana {
    font-size: 1.3em;
    color: #666;
  }

  .play-icon {
    position: absolute;
    bottom: 5px;
    right: 5px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  &:hover .play-icon {
    opacity: 1;
  }
`

const CardButtonIMG = styled.div<{ $groupColor: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background-color: ${(props) => props.$groupColor};
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`

const CardButtonIMGArrow = styled.div`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #000;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
`

const CardButtonIMGButton = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const CardButtonTitle = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 10px;

  p {
    margin: 0;
    font-size: 1.2em;
    font-weight: bold;
  }

  span {
    font-size: 0.8em;
    font-weight: normal;
  }
`

export default PronunciationGrid
