"use client"

import type React from "react"

import { useState, useEffect } from "react"
import styled from "styled-components"
import ToneIndicator from "./tone-indicator"
import { Volume2 } from "lucide-react"
import PronunciationTableInfo from "./pronunciation-table-info"
import { getPronunciationInfo } from "@/data/pronunciationTable"

interface CantoneseCardProps {
  kanji: string
  jyutping: string
  katakana: string
  audioPath: string
  isVisible: boolean
}

const CantoneseCard: React.FC<CantoneseCardProps> = ({ kanji, jyutping, katakana, audioPath, isVisible }) => {
  const [isActive, setIsActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  // 声調を抽出する関数
  const extractTone = (jyutping: string): string => {
    const lastChar = jyutping.charAt(jyutping.length - 1)
    return /[1-6]/.test(lastChar) ? lastChar : ""
  }

  // 声調を除いた粤拼を取得する関数
  const getJyutpingWithoutTone = (jyutping: string): string => {
    return jyutping.replace(/[1-6]$/, "")
  }

  // 音声合成の初期化
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // 音声リストが空の場合は、音声が読み込まれるのを待つ
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoicesLoaded(true)
        }
      } else {
        setVoicesLoaded(true)
      }
    }
  }, [])

  const tone = extractTone(jyutping)
  const jyutpingBase = getJyutpingWithoutTone(jyutping)

  // 発音表の情報を取得
  const pronunciationInfo = getPronunciationInfo(jyutpingBase)
  const backgroundColor = pronunciationInfo.color || "#2f9e9a"

  // speakText関数を修正
  const speakText = () => {
    // ブラウザのSpeechSynthesisを使用
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(kanji)

      // 広東語に設定（完全な広東語対応がない場合は中国語で代用）
      utterance.lang = "zh-HK" // 香港の中国語（広東語に近い）

      // 利用可能な音声から最適なものを選択
      const voices = window.speechSynthesis.getVoices()
      const cantoneseVoice = voices.find(
        (voice) => voice.lang === "zh-HK" || voice.lang === "zh-TW" || voice.lang === "zh-CN",
      )

      if (cantoneseVoice) {
        utterance.voice = cantoneseVoice
      }

      setIsPlaying(true)

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = () => {
        console.error("Speech synthesis failed")
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      // SpeechSynthesisがサポートされていない場合
      console.warn("Speech synthesis not supported")
      setTimeout(() => setIsPlaying(false), 1000)
    }
  }

  const handleClick = () => {
    setIsActive(true)

    // 発音を再生
    speakText()

    // アクティブ状態を一定時間後に解除
    setTimeout(() => {
      setIsActive(false)
    }, 2000)
  }

  return (
    <StyledWrapper>
      <button
        className={`Cantonese_Button ${isActive ? "active" : ""} ${isPlaying ? "playing" : ""}`}
        onClick={handleClick}
        aria-label={`${kanji}の発音を聞く`}
      >
        <div className="Cantonese_Button_IMG" style={{ backgroundColor }}>
          <div className="Cantonese_Button_IMG_Arrow" />
          <div className="Cantonese_Button_IMG_Button" />
          <div className="Cantonese_Content">
            <div className="Kanji">{kanji}</div>
            <div className="Jyutping">
              {jyutpingBase}
              {tone && <ToneIndicator tone={tone} />}
            </div>
            <div className="Katakana">{katakana}</div>
            <div className="PlayIcon">
              <Volume2 size={24} />
            </div>
          </div>
        </div>
        <div className="Cantonese_Button_Title">
          <p>
            {kanji} <span>{jyutping}</span>
          </p>
        </div>
        <div className="Cantonese_Table_Info">
          <PronunciationTableInfo jyutping={jyutping} />
        </div>
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .Cantonese_Button {
    width: 15em;
    height: 15em;
    padding: 0.75em;
    border: 0.15em solid rgba(255, 255, 255, 0.255);
    background-color: transparent;
    --backgroundcolor: #1d3844;
    position: relative;
    z-index: 0;
    transition: all 0.05s ease-in-out;
    cursor: pointer;
  }

  .Cantonese_Button:hover,
  .Cantonese_Button.active {
    transform: rotate(-15deg);
    border: solid 0.15em rgba(255, 255, 255, 0.255);
  }

  .Cantonese_Button:active {
    transform: rotate(-15deg) scale(0.95);
  }

  .Cantonese_Button.playing .Cantonese_Content {
    animation: pulse 1s infinite alternate;
  }

  @keyframes pulse {
    from {
      opacity: 0.8;
    }
    to {
      opacity: 1;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
    }
  }

  .Cantonese_Button_IMG {
    width: 100%;
    height: 100%;
    box-shadow: 0em -1.5em 2.5em -1em rgba(0, 255, 255, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: end;
    position: relative;
    z-index: 1;
    border-top: 0.15em solid rgba(255, 255, 255, 0.5);
    border-left: 0.15em solid rgba(255, 255, 255, 0.255);
  }

  .Cantonese_Content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 4;
    padding: 1em;
  }

  .Kanji {
    font-size: 3.5em;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    margin-bottom: 0.2em;
  }

  .Jyutping {
    font-size: 1.5em;
    color: white;
    margin-bottom: 0.2em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .Katakana {
    font-size: 1.8em;
    color: white;
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .PlayIcon {
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .Cantonese_Button:hover .PlayIcon {
    opacity: 1;
    transform: scale(1.2);
  }

  .Cantonese_Table_Info {
    position: absolute;
    bottom: -3.5em;
    left: 0;
    width: 100%;
    z-index: 5;
    opacity: 0;
    transition: all 0.3s ease;
    transform: translateY(-10px);
  }

  .Cantonese_Button:hover .Cantonese_Table_Info,
  .Cantonese_Button.active .Cantonese_Table_Info {
    opacity: 1;
    transform: translateY(0);
  }

  .Cantonese_Button:hover .Cantonese_Button_IMG,
  .Cantonese_Button.active .Cantonese_Button_IMG {
    animation: borderlight 1s infinite linear;
    box-shadow: 0em -1.5em 3em 0em rgba(0, 255, 255, 0.5);
  }

  .Cantonese_Button:active .Cantonese_Button_IMG {
    filter: brightness(120%);
    box-shadow: 0em -2.5em 4em 0em rgba(0, 255, 255, 0.5);
  }

  .Cantonese_Button:active .Cantonese_Button_Title p,
  .Cantonese_Button.active .Cantonese_Button_Title p {
    text-shadow: 0em 0em 1em white;
  }

  @keyframes borderlight {
    0% {
      border: 0.15em solid rgba(255, 255, 255, 0.255);
      border-top: 0.15em solid white;
    }
    25% {
      border: 0.15em solid rgba(255, 255, 255, 0.255);
      border-right: 0.15em solid white;
    }
    50% {
      border: 0.15em solid rgba(255, 255, 255, 0.255);
      border-bottom: 0.15em solid white;
    }
    75% {
      border: 0.15em solid rgba(255, 255, 255, 0.255);
      border-left: 0.15em solid white;
    }
    100% {
      border: 0.15em solid rgba(255, 255, 255, 0.255);
      border-top: 0.15em solid white;
    }
  }

  .Cantonese_Button_IMG_Button {
    width: 7.5em;
    height: 2.5em;
    background-color: var(--backgroundcolor);
    clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%);
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    position: relative;
    z-index: 2;
  }

  .Cantonese_Button:hover .Cantonese_Button_IMG_Button,
  .Cantonese_Button.active .Cantonese_Button_IMG_Button {
    opacity: 0%;
  }

  .Cantonese_Button_IMG_Arrow {
    width: 1.5em;
    height: 1.5em;
    background-color: white;
    clip-path: polygon(0% 0%, 100% 50%, 100% 50%, 0% 100%);
    position: absolute;
    z-index: 3;
    transition: all 0.25s ease-in-out;
  }

  .Cantonese_Button:hover .Cantonese_Button_IMG_Arrow,
  .Cantonese_Button.active .Cantonese_Button_IMG_Arrow {
    top: 55%;
    left: 65%;
    transform: scale(2.5) translate(-50%, -50%) rotate(15deg);
  }

  .Cantonese_Button_Title {
    width: 20em;
    height: 5em;
    background-color: var(--backgroundcolor);
    position: absolute;
    z-index: 6;
    bottom: -5em;
    left: -4em;
    opacity: 0%;
    transition: all 0.15s ease-in-out;
    display: flex;
    justify-content: center;
  }

  .Cantonese_Button_Title p {
    color: white;
    font-size: 2.5em;
    font-weight: bold;
  }

  .Cantonese_Button_Title span {
    font-size: 0.7em;
    margin-left: 0.5em;
  }

  .Cantonese_Button:hover .Cantonese_Button_Title,
  .Cantonese_Button.active .Cantonese_Button_Title {
    bottom: -2.5em;
    transform: rotate(15deg);
    display: flex;
    opacity: 100%;
    box-shadow: 0em -1em 1em -1em white;
  }
`

export default CantoneseCard
