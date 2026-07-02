'use client'

import { useRef, useEffect } from 'react'

export default function HeroVideo({ onEnded }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section className="relative w-full h-screen bg-[#000000] flex items-center justify-center overflow-hidden select-none">

      {/* Cinematic Video Plate */}
      <video
        ref={videoRef}
        src="/hero-drift.mp4"
        autoPlay
        muted
        playsInline
        controls={false}
        loop={false}
        preload="auto"
        onEnded={onEnded}
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Ambient Bottom Fade to mask website scroll transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
    </section>
  )
}
