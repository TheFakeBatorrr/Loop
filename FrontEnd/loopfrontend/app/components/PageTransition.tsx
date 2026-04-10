'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingScreen from './LoadingScreen'

export default function PageTransition() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    setLoading(true)
    setFadeOut(false)

    const fadeTimer = setTimeout(() => setFadeOut(true), 400) // fadeout kezdete
    const hideTimer = setTimeout(() => setLoading(false), 700) // teljesen eltűnik

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className={`fixed inset-0 z-[100] bg-[#6034e3] flex items-center justify-center transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <LoadingScreen />
    </div>
  )
}