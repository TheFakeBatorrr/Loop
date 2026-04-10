'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../components/AuthProvider'
import { useTheme } from '../components/ThemeProvider'

const slides = [
  { img: '/assets/carousel/placeholdder2.jpg', label: 'Gólyabál 2025' },
  { img: '/assets/carousel/placeholder.jpg', label: 'Sportsnap 2025' },
]

const topics = ['Sport', 'Kultúra', 'Tanulmány', 'Szórakozás', 'Egyéb']

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}>
      {children}
    </div>
  )
}

export default function MainPage() {
  const [current, setCurrent] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const { user } = useAuth()
  const { theme } = useTheme()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className={`${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-[#171717]'} transition-colors duration-300`}>

      {/* HERO FELIRAT */}
      <AnimatedSection>
        <div className="pt-6 mb-24 text-center relative z-10">
          <div className="bg-[#6034e3] max-w-5xl mx-auto rounded-2xl py-8 mb-[-60px]">
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tight">Loop</h1>
            <p className="text-white/70 text-lg mt-2">A diákok rendszere</p>
          </div>
        </div>
      </AnimatedSection>

      {/* CAROUSEL */}
      <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden h-[600px] relative">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image src={slide.img} alt={slide.label} fill className="object-cover" />
            
            {/* Label */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <div className="bg-[#6034e3] px-6 py-2 rounded-xl">
                <p className="text-white font-semibold text-lg">{slide.label}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Nyilak */}
        <button
          onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl bg-black/30 px-3 py-1 rounded-full hover:bg-black/50 transition-all"
        >‹</button>
        <button
          onClick={() => setCurrent(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl bg-black/30 px-3 py-1 rounded-full hover:bg-black/50 transition-all"
        >›</button>

        {/* Pontok */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* KERESŐ / SZŰRŐ  4!!!!44!!! KEll még a event archivum*/}
      <AnimatedSection>
        <div className="max-w-4xl mx-auto px-6 py-16">
          {user ? (
            <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-8 shadow-lg border transition-colors duration-300`}>
              <h2 className="text-2xl font-bold mb-6 text-[#6034e3]">Események szűrése</h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                    className={`px-4 py-2 rounded-full border-2 font-semibold transition-all duration-300
                      ${selectedTopic === topic
                        ? 'bg-[#6034e3] border-[#6034e3] text-white'
                        : 'border-[#6034e3] text-[#6034e3] hover:bg-[#6034e3] hover:text-white hover:rounded-lg'
                      }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <button className="bg-[#6034e3] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-colors duration-300">
                Keresés
              </button>
              {selectedTopic && (
                <p className={`mt-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`}>
                  Szűrés: <span className="text-[#6034e3] font-semibold">{selectedTopic}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="bg-[#6034e3] rounded-2xl p-10 text-center">
              <p className="text-white text-xl font-semibold mb-6">
                Jelentkezz be az események szűréséhez!
              </p>
              <Link
                href="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#6034e3] hover:rounded-[21px] transition-all duration-500 inline-block"
              >
                Bejelentkezés
              </Link>
            </div>
          )}
        </div>
      </AnimatedSection>

    </main>
  )
}