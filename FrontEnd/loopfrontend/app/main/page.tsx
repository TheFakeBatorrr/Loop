'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../components/AuthProvider'
import { useTheme } from '../components/ThemeProvider'
import {
  FaLocationDot,
  FaCalendarDays,
  FaStar,
  FaStarHalfStroke,
  FaRegStar,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa6'
import { userAgent } from 'next/server'
import { profile } from 'console'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ArchivedEvent {
  id: number
  name: string
  topic: string
  date: string
  location: string
  target_audience: string
  avg_rating: number | null
}

interface StudentProfile {
  users_id: number
  name: string
  class_number: number
  class_letter: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const slides = [
  { img: '/assets/carousel/BoundlessGrapics1.png', label: 'A Boundless mától az IDÖ-t is segíti' },
  { img: '/assets/carousel/suli.jpg', label: 'Sport nap 2026' },
]

const topics = [
  'Sport', 'Kultúra', 'Tanulmány', 'Továbbtanulás',
  'Iskolai élet', 'Szórakozás', 'Csapatépítés', 'Egyéb', 'Minden',
]

const topicColors: Record<string, string> = {
  Sport:          'bg-green-500/20 text-green-400',
  Kultúra:        'bg-pink-500/20 text-pink-400',
  Tanulmány:      'bg-blue-500/20 text-blue-400',
  Továbbtanulás: 'bg-yellow-500/20 text-yellow-400',
  'Iskolai élet': 'bg-orange-500/20 text-orange-400',
  Szórakozás:     'bg-purple-500/20 text-purple-400',
  Csapatépítés:   'bg-teal-500/20 text-teal-400',
  Egyéb:          'bg-gray-500/20 text-gray-400',
}

// ─── Components ──────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-gray-400 italic">Nincs értékelés</span>
  const numericValue = Number(value)
  const stars = []
  const roundedValue = Math.round(value * 2) / 2
  for (let i = 1; i <= 5; i++) {
    if (roundedValue >= i) stars.push(<FaStar key={i} className="text-yellow-400" />)
    else if (roundedValue >= i - 0.5) stars.push(<FaStarHalfStroke key={i} className="text-yellow-400" />)
    else stars.push(<FaRegStar key={i} className="text-yellow-400/40" />)
  }
  return <div className="flex items-center gap-1">{stars}<span className="text-sm text-gray-400 ml-1">{value}</span></div>
}

function EventCard({ event, theme, showRating = true, canRate = false }: { 
  event: ArchivedEvent; 
  theme: string; 
  showRating?: boolean;
  canRate?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { authFetch } = useAuth()

  const isDark = theme === 'dark'
  const badgeClass = topicColors[event.topic] ?? 'bg-gray-500/20 text-gray-400'

  const handleSubmit = async () => {
    if (rating === 0) return alert("Kérlek, válassz egy csillagot!")
    setSubmitting(true)
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ertekeles`, {
        method: 'POST',
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          reviews_event_id: event.id,
          review: rating,
          content: comment,
        })
      })
      if (res.ok) {
        alert("Köszönjük az értékelést!")
        setIsExpanded(false)
        setRating(0)
        setComment('')
      }
    } catch (err) {
      console.error("Rating submission error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-3 transition-all duration-500 ${
      isExpanded ? 'ring-2 ring-[#6034e3] scale-[1.02] z-20' : 'hover:-translate-y-1'
    } ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
      
      <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${badgeClass}`}>{event.topic}</span>
      <h3 className={`font-bold text-base leading-tight ${isDark ? 'text-white' : 'text-[#171717]'}`}>{event.name}</h3>
      
      <div className={`flex flex-col gap-1.5 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
        <span className="flex items-center gap-2"><FaCalendarDays /> {new Date(event.date).toLocaleDateString('hu-HU')}</span>
        <span className="flex items-center gap-2"><FaLocationDot /> {event.location}</span>
      </div>

      {showRating && !isExpanded && (
        <div className="mt-auto pt-2 border-t border-white/10">
          <StarRating value={event.avg_rating} />
        </div>
      )}

      {canRate && !isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="mt-2 w-full py-2 bg-[#6034e3]/10 text-[#6034e3] rounded-lg font-bold hover:bg-[#6034e3] hover:text-white transition-all"
        >
          Értékelem
        </button>
      )}

      {/* Értékelő Panel */}
      <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-100 opacity-100 mt-4 pt-4 border-t border-white/10' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm font-semibold mb-2">Hány csillagot adnál?</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} type="button">
              <FaStar className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`} />
            </button>
          ))}
        </div>
        <textarea 
          placeholder="Írj egy rövid véleményt..."
          className={`w-full p-3 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-[#6034e3]' : 'bg-gray-50 border-gray-200 focus:border-[#6034e3]'}`}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <button 
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 bg-[#6034e3] text-white py-2 rounded-xl font-bold hover:bg-[#4d29b8] transition-all disabled:opacity-50"
          >
            {submitting ? 'Küldés...' : 'Mentés'}
          </button>
          <button 
            onClick={() => setIsExpanded(false)}
            className={`px-4 py-2 rounded-xl font-semibold ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Mégse
          </button>
        </div>
      </div>
    </div>
  )
}

function EventGrid({ events, theme, loading, emptyMsg, showRating = true, canRate = false }: { 
  events: ArchivedEvent[]; 
  theme: string; 
  loading: boolean; 
  emptyMsg: string; 
  showRating?: boolean;
  canRate?: boolean;
}) {
  const [expanded, setExpanded] = useState(false)
  const isDark = theme === 'dark'
  const visible = expanded ? events : events.slice(0, 3)

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className={`rounded-2xl h-44 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />)}
    </div>
  )
  if (!events.length) return <p className={`text-sm italic ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{emptyMsg}</p>

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {visible.map(event => <EventCard key={event.id} event={event} theme={theme} showRating={showRating} canRate={canRate} />)}
      </div>
      {events.length > 3 && (
        <div className="flex justify-center mt-5">
          <button onClick={() => setExpanded(!expanded)} className={`flex items-center gap-2 px-5 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-300 ${isDark ? 'border-white/20 text-white/60 hover:border-[#6034e3]' : 'border-gray-200 text-gray-500 hover:border-[#6034e3]'}`}>
            {expanded ? <><FaChevronUp /> Kevesebb</> : <><FaChevronDown /> Több ({events.length - 3})</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MainPage() {
  const [current, setCurrent] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const { user, authFetch } = useAuth()
  const { theme } = useTheme()

  const [publishedEvents, setPublishedEvents] = useState<ArchivedEvent[]>([])
  const [allEvents, setAllEvents] = useState<ArchivedEvent[]>([])
  const [ratableEvents, setRatableEvents] = useState<ArchivedEvent[]>([])
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  
  const [eventsLoading, setEventsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const isGraduated = user?.role === 'Graduated'


  // Profil + Archívum + Értékelhető eventek betöltése
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setEventsLoading(true)
      try {
        const [eventsRes, ratableRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/userarchivum`),
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/canrate`),
        ])
        if (eventsRes.ok) setAllEvents(await eventsRes.json())
        if (ratableRes.ok) setRatableEvents(await ratableRes.json())
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setEventsLoading(false)
      }
    }
    fetchData()
  }, [user, authFetch])

  // GET szűrés a topic változásakor
  useEffect(() => {
    if (!user) return
    const handleSearch = async () => {
      setSearchLoading(true)
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/published`
        if (selectedTopic && selectedTopic !== 'Minden') {
          url += `?topic=${encodeURIComponent(selectedTopic)}`
        }
        const res = await authFetch(url)
        if (res.ok) setPublishedEvents(await res.json())
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setSearchLoading(false)
      }
    }
    handleSearch()
  }, [selectedTopic, user, authFetch])

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 7000)
    return () => clearInterval(timer)
  }, [])

  const isDark = theme === 'dark'

  return (
    <main className={`${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-[#171717]'} transition-colors duration-300 pb-20`}>
      
      {/* HERO & CAROUSEL */}
      <div className="pt-6 mb-12 text-center px-4">
        <div className="bg-[#6034e3] max-w-5xl mx-auto rounded-3xl py-10 shadow-2xl mb-12">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">Boundless</h1>
          <p className="text-white/60 text-lg uppercase tracking-widest mt-2">The Student Hub</p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden h-64 md:h-110 relative shadow-2xl border border-white/5">
          {slides.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
              <Image src={slide.img} alt={slide.label} fill loading="eager" className="object-cover" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#6034e3] px-6 py-2 rounded-xl text-white font-bold shadow-lg">{slide.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KERESÉS / PUBLISHED */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {user && (
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-3xl p-8 shadow-xl border`}>
            <h2 className="text-2xl font-bold mb-6 text-[#6034e3]">Események felfedezése</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {topics.map(topic => (
                <button 
                  key={topic} 
                  onClick={() => setSelectedTopic(topic)} 
                  className={`px-5 py-2 rounded-full border-2 font-bold transition-all duration-300 ${
                    selectedTopic === topic ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-[#6034e3]/30 text-[#6034e3] hover:bg-[#6034e3]/10'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="min-h-50">
              <h3 className="text-lg font-bold mb-4 opacity-50 uppercase tracking-tight">Aktuális találatok</h3>
              <EventGrid 
                events={publishedEvents} 
                theme={theme} 
                loading={searchLoading} 
                emptyMsg="Nincs aktív esemény ebben a kategóriában." 
                showRating={false} 
              />
            </div>
          </div>
        )}
      </div>

      {/* ÉRTÉKELÉS */}
      {user && !isGraduated && (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'} rounded-3xl p-8 border`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#6034e3]">Értékelhető</h2>
            </div>
            <EventGrid 
              events={ratableEvents} 
              theme={theme} 
              loading={eventsLoading} 
              emptyMsg="Jelenleg nincs új értékelhető eseményed." 
              canRate={true} 
            />
          </div>
        </div>
      )}

      {/* ARCHÍVUM */}
      {user ?  (
        <div className="max-w-4xl mx-auto px-6 py-10 opacity-80">
          <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-3xl p-8 border`}>
            <h2 className="text-2xl font-bold mb-6 text-[#6034e3]">Lezárt események</h2>
            <EventGrid 
              events={allEvents} 
              theme={theme} 
              loading={eventsLoading} 
              emptyMsg="Az archívum még üres." 
            />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-[#6034e3] rounded-3xl p-12 shadow-2xl shadow-[#6034e3]/20 transition-all hover:scale-[1.01]">
            <h2 className="text-3xl font-bold text-white mb-4">Úgy néz ki nem vagy bejelentkezve</h2>
            <p className="text-purple-100 mb-8 text-lg max-w-md mx-auto">
              Jelentkezz be, hogy lásd az eseményeket!
            </p>
            
            <Link 
              href="/login" 
              className="inline-block bg-white text-[#6034e3] font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-colors text-lg shadow-lg"
            >
              Bejelentkezés most
            </Link>
            
            <p className="mt-6 text-purple-200 text-sm">
              Még nincs fiókod? <Link href="/login" className="underline font-semibold hover:text-white">Regisztrálj itt</Link>
            </p>
          </div>
        </div>
      )}

    </main>
  )
}