"use client"

import { useEffect, useState } from "react"
import QuizMode from "@/components/quiz-mode"
import PronunciationGrid from "@/components/pronunciation-grid"
import OpeningAnimation from "@/components/opening-animation"
import AppMenu from "@/components/menu"
import styled from "styled-components"
import type { CantoneseDataItem } from "@/types/cantonese"

// 最小限のデータをハードコード（元のデータが読み込めない場合のフォールバック）
const fallbackData: CantoneseDataItem[] = [
  {
    id: "baa1",
    kanji: "巴",
    jyutping: "baa1",
    katakana: "バー",
    audioPath: "/audio/baa1.mp3",
  },
  {
    id: "paa1",
    kanji: "趴",
    jyutping: "paa1",
    katakana: "パー",
    audioPath: "/audio/paa1.mp3",
  },
  {
    id: "maa1",
    kanji: "媽",
    jyutping: "maa1",
    katakana: "マー",
    audioPath: "/audio/maa1.mp3",
  },
  {
    id: "faa1",
    kanji: "花",
    jyutping: "faa1",
    katakana: "ファー",
    audioPath: "/audio/faa1.mp3",
  },
  {
    id: "daa1",
    kanji: "打",
    jyutping: "daa1",
    katakana: "ダー",
    audioPath: "/audio/daa1.mp3",
  },
  {
    id: "taa1",
    kanji: "他",
    jyutping: "taa1",
    katakana: "ター",
    audioPath: "/audio/taa1.mp3",
  },
  {
    id: "naa1",
    kanji: "拿",
    jyutping: "naa1",
    katakana: "ナー",
    audioPath: "/audio/naa1.mp3",
  },
  {
    id: "laa1",
    kanji: "啦",
    jyutping: "laa1",
    katakana: "ラー",
    audioPath: "/audio/laa1.mp3",
  },
  {
    id: "gaa1",
    kanji: "加",
    jyutping: "gaa1",
    katakana: "ガー",
    audioPath: "/audio/gaa1.mp3",
  },
  {
    id: "kaa1",
    kanji: "卡",
    jyutping: "kaa1",
    katakana: "カー",
    audioPath: "/audio/kaa1.mp3",
  },
  {
    id: "haa1",
    kanji: "哈",
    jyutping: "haa1",
    katakana: "ハー",
    audioPath: "/audio/haa1.mp3",
  },
  {
    id: "zaa1",
    kanji: "渣",
    jyutping: "zaa1",
    katakana: "ザー",
    audioPath: "/audio/zaa1.mp3",
  },
  {
    id: "caa1",
    kanji: "叉",
    jyutping: "caa1",
    katakana: "チャー",
    audioPath: "/audio/caa1.mp3",
  },
  {
    id: "saa1",
    kanji: "沙",
    jyutping: "saa1",
    katakana: "サー",
    audioPath: "/audio/saa1.mp3",
  },
  {
    id: "jaa1",
    kanji: "也",
    jyutping: "jaa1",
    katakana: "ヤー",
    audioPath: "/audio/jaa1.mp3",
  },
  {
    id: "waa1",
    kanji: "華",
    jyutping: "waa1",
    katakana: "ワー",
    audioPath: "/audio/waa1.mp3",
  },
]

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cantoneseData, setCantoneseData] = useState<CantoneseDataItem[]>([])
  const [filteredData, setFilteredData] = useState<CantoneseDataItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showQuiz, setShowQuiz] = useState(false)
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false)
  const [showOpening, setShowOpening] = useState(true)

  // 検索結果があるかどうかを判定
  const isFiltered = searchQuery !== "" && filteredData.length > 0

  useEffect(() => {
    // データの初期化
    const initializeData = async () => {
      try {
        setLoading(true)

        // APIルートを使用してJSONを取得
        try {
          console.log("APIルートからデータを取得しています...")
          const response = await fetch("/api/get-cantonese-data")

          // レスポンスのContent-Typeをチェック
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            console.error(`APIが不正なContent-Typeを返しました: ${contentType}`)
            throw new Error("APIがJSONを返しませんでした")
          }

          if (response.ok) {
            const data = await response.json()
            console.log("APIから取得したJSONデータを使用します")

            // データが配列であることを確認
            if (Array.isArray(data) && data.length > 0) {
              setCantoneseData(data)
              setFilteredData(data)
              console.log(`${data.length}件のデータを読み込みました`)
            } else {
              throw new Error("APIから取得したデータが有効な配列ではありません")
            }
          } else {
            throw new Error(`APIからのデータ取得に失敗しました: ${response.status}`)
          }
        } catch (apiError) {
          console.error("APIからのデータ取得に失敗:", apiError)

          // フォールバックデータを使用
          console.log("フォールバックデータを使用します")
          setCantoneseData(fallbackData)
          setFilteredData(fallbackData)
          setError(`データの読み込みに失敗したため、基本データのみを表示しています。エラー: ${apiError.message}`)
        }
      } catch (err) {
        console.error("データの初期化に失敗しました:", err)
        // エラーが発生した場合はフォールバックデータを使用
        setCantoneseData(fallbackData)
        setFilteredData(fallbackData)
        setError(`データの初期化に失敗したため、基本データのみを表示しています。エラー: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    initializeData()

    // ブラウザの音声合成APIをチェック
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesisSupported(true)

      // 音声リストの初期化
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log("Voices loaded:", window.speechSynthesis.getVoices().length)
        }
      }
    } else {
      setError((prev) =>
        prev
          ? `${prev} また、お使いのブラウザは音声合成に対応していません。Chrome、Edge、Safariなどの最新ブラウザをお試しください。`
          : "お使いのブラウザは音声合成に対応していません。Chrome、Edge、Safariなどの最新ブラウザをお試しください。",
      )
    }
  }, [])

  // 検索機能
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredData(cantoneseData)
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const filtered = cantoneseData.filter(
      (item) =>
        item.kanji?.includes(query) ||
        item.jyutping?.toLowerCase().includes(lowercaseQuery) ||
        item.katakana?.includes(query),
    )

    setFilteredData(filtered)
  }

  // オープニングアニメーション完了時の処理
  const handleOpeningComplete = () => {
    setShowOpening(false)
  }

  if (showOpening) {
    return <OpeningAnimation onComplete={handleOpeningComplete} />
  }

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    )
  }

  return (
    <MainContainer>
      <AppMenu
        onSearch={handleSearch}
        onQuizMode={() => setShowQuiz(true)}
        searchQuery={searchQuery}
        isFiltered={isFiltered}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {filteredData.length === 0 ? (
        <NoResults>
          <p>「{searchQuery}」に一致する結果が見つかりませんでした</p>
          <button onClick={() => handleSearch("")}>すべて表示</button>
        </NoResults>
      ) : (
        <GridContainer>
          <PronunciationGrid data={filteredData} />
        </GridContainer>
      )}

      {showQuiz && <QuizMode data={cantoneseData} onClose={() => setShowQuiz(false)} />}
    </MainContainer>
  )
}

const MainContainer = styled.main`
  min-height: 100vh;
  background: linear-gradient(to bottom, rgb(29, 56, 68), rgb(20, 40, 50));
  padding: 1rem;
  position: relative;
`

const InfoBanner = styled.div`
  background-color: rgba(47, 158, 154, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 4rem 0 2rem;
  text-align: center;
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }
  }
`

const ErrorMessage = styled.div`
  margin-top: 5rem;
  padding: 0.75rem;
  background-color: rgba(255, 87, 87, 0.2);
  border-radius: 4px;
  color: #ff5757;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`

const GridContainer = styled.div`
  padding-top: 1rem;
  margin-top: 4rem; /* メニューの下に適切なスペースを確保 */
`

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, rgb(29, 56, 68), rgb(20, 40, 50));
`

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: rgb(47, 158, 154);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 5rem;
  
  button {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    border: none;
    color: white;
    margin-top: 1rem;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`
