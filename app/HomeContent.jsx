'use client'

import { Suspense, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import HeroSection from './components/HeroSection'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import UpcomingEvents from './components/UpcomingEvents'
import Feedback from './components/Feedback'

const Gallery = dynamic(() => import('./components/Gallery'), { ssr: false, loading: () => <div className="h-96 bg-[#050505]" /> })
const Reelssection = dynamic(() => import('./components/Reelssection'), { ssr: false, loading: () => <div className="h-64 bg-[#050505]" /> })
const About = dynamic(() => import('./components/About'), { ssr: false, loading: () => <div className="h-64 bg-[#050505]" /> })
const Contact = dynamic(() => import('./components/Contact'), { ssr: false, loading: () => <div className="h-64 bg-[#050505]" /> })
const FAQ = dynamic(() => import('./components/FAQ'), { ssr: false, loading: () => <div className="h-64 bg-[#050505]" /> })
const Footer = dynamic(() => import('./components/Footer'), { ssr: false, loading: () => <div className="h-32 bg-[#050505]" /> })

export default function HomeContent() {
  const [showHero, setShowHero] = useState(false)
  const [videoDone, setVideoDone] = useState(false)

  const handleVideoEnd = useCallback(() => {
    setVideoDone(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShowHero(true)
      })
    })
  }, [])

  return (
    <>
      <div
        className="relative"
        style={{
          opacity: videoDone ? 0 : 1,
          transition: 'opacity 700ms ease-in-out',
          pointerEvents: videoDone ? 'none' : 'auto',
          position: videoDone ? 'absolute' : 'relative',
          width: '100%',
        }}
      >
        <HeroSection onEnded={handleVideoEnd} />
      </div>

      <div
        style={{
          opacity: showHero ? 1 : 0,
          transition: 'opacity 700ms ease-in-out',
          visibility: showHero ? 'visible' : 'hidden',
        }}
      >
        <Hero />
        <Marquee />
        <UpcomingEvents />
        <Feedback />
      </div>

      <Suspense fallback={<div className="h-96 bg-[#050505]" />}>
        <Gallery />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#050505]" />}>
        <Reelssection />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#050505]" />}>
        <About />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#050505]" />}>
        <Contact />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#050505]" />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-[#050505]" />}>
        <Footer />
      </Suspense>
    </>
  )
}
