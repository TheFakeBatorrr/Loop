'use client'

import { useEffect, useRef, useState } from 'react'

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

function Counter({ target, suffix = '' }: { target: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 20)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{count}{suffix}</span>
}

type Bubble = { w: number, h: number, top: number, left: number, dur: number }

export default function SelloutPage() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    setBubbles([...Array(20)].map(() => ({
      w: Math.random() * 200 + 50,
      h: Math.random() * 200 + 50,
      top: Math.random() * 100,
      left: Math.random() * 100,
      dur: Math.random() * 4 + 3,
    })))
  }, [])

  return (
    <main className="bg-[#fafafa] text-[#171717] overflow-x-hidden">

      {/* HERO */}
      <section className="min-h-screen bg-[#6034e3] flex flex-col items-center justify-center text-white text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {bubbles.map((b, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: b.w + 'px',
                height: b.h + 'px',
                top: b.top + '%',
                left: b.left + '%',
                transform: 'translate(-50%, -50%)',
                animation: `pulse ${b.dur}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 animate-[fadeInUp_0.8s_ease_forwards]">
          <p className="text-white/70 text-lg mb-4 tracking-widest uppercase">Bemutatkozik a</p>
          <h1 className="text-6xl md:text-8xl font-black mb-6">Loop</h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10">
            A diákönkormányzat digitális otthona. Egy platform, ahol minden diák hangja számít.
          </p>
          <a href="#features" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#6034e3] hover:rounded-[30px] transition-all duration-500">
            Fedezd fel →
          </a>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50 text-3xl">↓</div>
      </section>

      {/* SZÁMOK */}
      <section className="bg-[#6034e3] pb-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
          {[
            { target: 24, suffix: '/7', label: 'Elérhető' },
            { target: 3, suffix: ' perc', label: 'Villámgyors telepítés' },
            { target: 1, suffix: ' iskola', label: 'Már használja' },
          ].map((item, i) => (
            <AnimatedSection key={i}>
              <div className="text-5xl font-black"><Counter target={item.target} suffix={item.suffix} /></div>
              <p className="text-white/70 mt-2">{item.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* MI AZ A LOOP */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <p className="text-[#6034e3] font-semibold tracking-widest uppercase mb-2">Mi is ez?</p>
          <h2 className="text-4xl md:text-5xl font-black">A Loop nem csak egy weboldal.</h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🗳️', title: 'Diák hang', desc: 'Minden diák bejelentkezhet, véleményt nyilváníthat és követheti az eseményeket.' },
            { icon: '📅', title: 'Esemény archívum', desc: 'Minden DÖK esemény egy helyen, visszakereshető és átlátható formában.' },
            { icon: '⚡', title: 'IDÖ dashboard', desc: 'A diákönkormányzat tagjainak saját felület, szerepkör alapú hozzáféréssel.' },
          ].map((item, i) => (
            <AnimatedSection key={i}>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* LILA SZEKCIÓ */}
      <section className="bg-[#6034e3] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <AnimatedSection>
            <p className="tracking-widest uppercase text-white/70 mb-4">Miért Loop?</p>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Mert a diákoknak is jár egy modern platform.</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-12">
              Más iskolák már digitálisan szervezik a diákéletet. Ne maradj le — a Loop minden iskolában működik, és ingyenes.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              { title: 'Szerepkör alapú hozzáférés', desc: 'Diák, IDÖ-s, Elnök és Admin — mindenki azt látja, ami neki kell.' },
              { title: 'Reszponzív design', desc: 'Mobilon, tableten és asztali gépen egyaránt tökéletesen néz ki.' },
              { title: 'Eseménykezelés', desc: 'Programok szűrése, archívum, és értesítések egy helyen.' },
              { title: 'Biztonságos bejelentkezés', desc: 'Email alapú autentikáció, iskolai fiókokhoz igazítva.' },
            ].map((item, i) => (
              <AnimatedSection key={i}>
                <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <h3 className="text-white font-bold text-lg mb-2">✓ {item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOGYAN MŰKÖDIK */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <p className="text-[#6034e3] font-semibold tracking-widest uppercase mb-2">Egyszerű</p>
          <h2 className="text-4xl md:text-5xl font-black">Három lépés és kész.</h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { step: '01', title: 'Kapcsolatfelvétel', desc: 'Írj nekünk és egyeztetünk az iskolád igényeiről.' },
            { step: '02', title: 'Beállítás', desc: 'Mi beállítjuk a platformot az iskolátok adataival.' },
            { step: '03', title: 'Élesítés', desc: 'A diákok regisztrálnak és a Loop elkezd működni.' },
          ].map((item, i) => (
            <AnimatedSection key={i}>
              <div className="relative">
                <div className="text-8xl font-black text-[#6034e3]/10 absolute -top-6 left-1/2 -translate-x-1/2">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6034e3] py-24 px-6 text-center text-white">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-black mb-6">Készen állsz?</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
            Hozd el a Loop-ot a te iskoládba is. Vedd fel velünk a kapcsolatot még ma.
          </p>
          <a href="mailto:info@loop.hu"
            className="border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#6034e3] hover:rounded-[30px] transition-all duration-500 inline-block">
            Kapcsolatfelvétel →
          </a>
        </AnimatedSection>
      </section>

    </main>
  )
}