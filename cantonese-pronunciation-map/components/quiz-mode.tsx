"use client"

import type React from "react"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { Check, X, Volume2 } from "lucide-react"
import type { CantoneseDataItem } from "@/types/cantonese"

interface QuizModeProps {
  data: CantoneseDataItem[]
  onClose: () => void
}

const QuizMode: React.FC<QuizModeProps> = ({ data, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState<CantoneseDataItem | null>(null)
  const [options, setOptions] = useState<CantoneseDataItem[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // クイズを初期化
  useEffect(() => {
    if (data.length > 0) {
      // 最低限必要なデータ数をチェック
      if (data.length < 4) {
        setError(`クイズモードには最低4つのデータが必要です。現在のデータ数: ${data.length}`)
        return
      }
      generateQuestion()
    } else {
      setError("データが読み込まれていません")
    }
  }, [data])

  // 新しい問題を生成
  const generateQuestion = () => {
    if (data.length < 4) {
      setError("最低4つのオプションが必要です")
      return
    }

    // ランダムに問題を選択
    const randomIndex = Math.floor(Math.random() * data.length)
    const question = data[randomIndex]

    // 3つの誤答を選択（正解を除く）
    let wrongOptions = [...data]
    wrongOptions.splice(randomIndex, 1)
    wrongOptions = shuffleArray(wrongOptions).slice(0, 3)

    // 4つの選択肢をシャッフル
    const allOptions = shuffleArray([...wrongOptions, question])

    setCurrentQuestion(question)
    setOptions(allOptions)
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  // 配列をシャッフルする関数
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // ブラウザのText-to-Speech APIを使用して発音する
  const speakText = () => {
    if (currentQuestion && "speechSynthesis" in window) {
      // 発音する
      const utterance = new SpeechSynthesisUtterance(currentQuestion.kanji)

      // 広東語に設定（完全な広東語対応がない場合は中国語で代用）
      utterance.lang = "zh-HK" // 香港の中国語（広東語に近い）

      // 音声合成を開始
      window.speechSynthesis.speak(utterance)
    }
  }

  // 回答を選択
  const handleSelectAnswer = (option: CantoneseDataItem) => {
    if (selectedAnswer !== null || !currentQuestion) return

    setSelectedAnswer(option.id)
    const correct = option.id === currentQuestion.id
    setIsCorrect(correct)

    if (correct) {
      setScore((prev) => prev + 1)
    }

    setQuestionCount((prev) => prev + 1)

    // 次の問題へ
    setTimeout(() => {
      if (questionCount >= 9) {
        // 10問終了後に結果を表示
        setShowResult(true)
      } else {
        generateQuestion()
      }
    }, 1500)
  }

  // クイズをリセット
  const resetQuiz = () => {
    setScore(0)
    setQuestionCount(0)
    setShowResult(false)
    generateQuestion()
  }

  if (error) {
    return (
      <QuizContainer>
        <h2>エラー</h2>
        <ErrorMessage>{error}</ErrorMessage>
        <CloseButton onClick={onClose}>クイズを終了</CloseButton>
      </QuizContainer>
    )
  }

  if (!currentQuestion) {
    return (
      <QuizContainer>
        <h2>読み込み中...</h2>
        <LoadingSpinner />
      </QuizContainer>
    )
  }

  if (showResult) {
    return (
      <QuizContainer>
        <h2>クイズ結果</h2>
        <ResultContainer>
          <p>
            スコア: <span className="score">{score} / 10</span>
          </p>
          <p className="message">
            {score === 10
              ? "完璧です！素晴らしい！"
              : score >= 7
                ? "よくできました！"
                : score >= 4
                  ? "がんばりました！"
                  : "次はもっと頑張りましょう！"}
          </p>
          <div className="buttons">
            <button className="retry" onClick={resetQuiz}>
              もう一度挑戦
            </button>
            <button className="close" onClick={onClose}>
              クイズを終了
            </button>
          </div>
        </ResultContainer>
      </QuizContainer>
    )
  }

  return (
    <QuizContainer>
      <h2>広東語クイズ</h2>
      <p className="progress">
        問題 {questionCount + 1}/10 - スコア: {score}
      </p>

      <QuestionContainer>
        <p className="question">この音声はどの漢字の発音ですか？</p>
        <PlayButton onClick={speakText}>
          <Volume2 size={24} />
          <span>音声を再生</span>
        </PlayButton>
      </QuestionContainer>

      <OptionsContainer>
        {options.map((option) => (
          <OptionButton
            key={option.id}
            onClick={() => handleSelectAnswer(option)}
            className={
              selectedAnswer
                ? selectedAnswer === option.id
                  ? isCorrect
                    ? "correct"
                    : "incorrect"
                  : currentQuestion.id === option.id && selectedAnswer
                    ? "correct-answer"
                    : "disabled"
                : ""
            }
            disabled={selectedAnswer !== null}
          >
            <div className="kanji">{option.kanji}</div>
            <div className="jyutping">{option.jyutping}</div>
            <div className="katakana">{option.katakana}</div>
            {selectedAnswer === option.id && (
              <div className="result-icon">{isCorrect ? <Check size={24} /> : <X size={24} />}</div>
            )}
          </OptionButton>
        ))}
      </OptionsContainer>

      <CloseButton onClick={onClose}>クイズを終了</CloseButton>
    </QuizContainer>
  )
}

const QuizContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(29, 56, 68, 0.95);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: white;
  }

  .progress {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.8);
  }
`

const ErrorMessage = styled.div`
  background-color: rgba(255, 0, 0, 0.2);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  max-width: 600px;
`

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: rgb(47, 158, 154);
  animation: spin 1s ease-in-out infinite;
  margin: 2rem 0;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;

  .question {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: white;
  }
`

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgb(47, 158, 154);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: rgb(57, 178, 174);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`

const OptionButton = styled.button`
  position: relative;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(.disabled) {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-5px);
  }

  &.correct {
    background-color: rgba(76, 175, 80, 0.3);
    border-color: rgb(76, 175, 80);
  }

  &.incorrect {
    background-color: rgba(244, 67, 54, 0.3);
    border-color: rgb(244, 67, 54);
  }

  &.correct-answer {
    border-color: rgb(76, 175, 80);
    border-style: dashed;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .kanji {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .jyutping {
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
  }

  .katakana {
    font-size: 1.5rem;
  }

  .result-icon {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`

const CloseButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const ResultContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;

  p {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .score {
    font-size: 2rem;
    font-weight: bold;
    color: rgb(47, 158, 154);
  }

  .message {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .buttons {
    display: flex;
    gap: 1rem;
  }

  button {
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
  }

  .retry {
    background-color: rgb(47, 158, 154);
    color: white;
    border: none;

    &:hover {
      background-color: rgb(57, 178, 174);
    }
  }

  .close {
    background-color: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`

export default QuizMode
