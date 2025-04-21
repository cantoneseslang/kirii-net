"use client"

import type React from "react"

import { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import Image from "next/image"

interface OpeningAnimationProps {
  onComplete: () => void
}

const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  const [showIcon, setShowIcon] = useState(false)
  const [showText, setShowText] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // アイコンを表示（より早く）
    setTimeout(() => {
      setShowIcon(true)
    }, 200)

    // テキストを表示（より早く）
    setTimeout(() => {
      setShowText(true)
    }, 600)

    // アニメーション完了状態をセット
    setTimeout(() => {
      setAnimationComplete(true)
    }, 1200)

    // アニメーション完了後、少し停止してからメインUIを表示
    setTimeout(() => {
      onComplete()
    }, 2200)
  }, [onComplete])

  return (
    <AnimationContainer className={animationComplete ? "complete" : ""}>
      <ContentWrapper>
        <IconWrapper className={showIcon ? "visible" : ""}>
          <Image
            src="/images/slang-sensei-icon.png"
            alt="スラング先生"
            width={180}
            height={180}
            priority
          />
        </IconWrapper>

        <TextWrapper className={showText ? "visible" : ""}>スラング式広東語カタカナ・粤拼発音マップ</TextWrapper>
      </ContentWrapper>
    </AnimationContainer>
  )
}

const popIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`

const AnimationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, rgb(29, 56, 68), rgb(20, 40, 50));
  z-index: 1000;
  transition: opacity 0.5s ease;
  
  &.complete {
    animation: ${fadeOut} 0.5s ease forwards;
    animation-delay: 0.5s;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  padding: 2rem;
  max-width: 90%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`

const IconWrapper = styled.div`
  opacity: 0;
  transform: scale(0);
  
  &.visible {
    animation: ${popIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  img {
    border-radius: 50%;
    box-shadow: 0 0 30px rgba(255, 100, 100, 0.5);
  }
`

const TextWrapper = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  opacity: 0;
  transform: scale(0);
  text-shadow: 0 0 10px rgba(255, 100, 100, 0.7);
  white-space: nowrap;
  
  &.visible {
    animation: ${popIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
    white-space: normal;
  }
`

export default OpeningAnimation
