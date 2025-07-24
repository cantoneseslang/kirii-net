"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  title: string
  description: string
}

export function BeforeAfterSlider({ beforeImage, afterImage, title, description }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100))

    setSliderPosition(percentage)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100))

    setSliderPosition(percentage)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">{description}</p>
      </div>

      <div
        ref={containerRef}
        className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden cursor-ew-resize bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <div className="absolute inset-0 z-10">
          <Image src={afterImage || "/placeholder.svg"} alt="After" fill className="object-cover" />
        </div>

        <div className="absolute inset-0 z-20 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
          <Image
            src={beforeImage || "/placeholder.svg"}
            alt="Before"
            fill
            className="object-cover"
            style={{ width: `${100 / (sliderPosition / 100)}%` }}
          />
        </div>

        <div className="absolute top-0 bottom-0 z-30 w-1 bg-gold-500" style={{ left: `${sliderPosition}%` }}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center text-slate-900 font-bold text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-40 bg-white/10 backdrop-blur-md p-2 rounded-lg text-white text-sm">
          Before
        </div>

        <div className="absolute bottom-4 right-4 z-40 bg-white/10 backdrop-blur-md p-2 rounded-lg text-white text-sm">
          After
        </div>
      </div>
    </div>
  )
}
