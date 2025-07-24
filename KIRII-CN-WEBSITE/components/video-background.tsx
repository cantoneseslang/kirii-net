"use client"

import { useEffect, useRef } from "react"

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/80 z-10" />
      <video ref={videoRef} autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
        <source src="/placeholder.svg?key=kjxnq" type="video/mp4" />
      </video>
    </div>
  )
}
