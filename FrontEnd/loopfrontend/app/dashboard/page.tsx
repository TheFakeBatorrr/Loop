'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import CsatlakozasModal from './components/CsatlakozasModal'
import ElnokDashboard from './components/ElnokDashboard'
import IdosDashboard from './components/IdosDashboard'
import { FaStar, FaRegStar } from 'react-icons/fa6'
import type { View, Application } from './components/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MyReview {
  id: number
  name: string       // event neve
  topic: string
  date: string
  review: number     // 1-5 csillag
  content: string
}

// ─── Mini star display ────────────────────────────────────────────────────────

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        i <= value
          ? <FaStar key={i} className="text-yellow-400 text-xs" />
          : <FaRegStar key={i} className="text-gray-300 text-xs" />
      ))}
    </div>
  )
}

// ─── Review card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: MyReview }) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-gray-100 bg-gray-50">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-[#171717] leading-tight">{review.name}</span>
        <Stars value={review.review} />
      </div>
      <span className="text-xs text-gray-400">
        {new Date(review.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
      </span>
      {review.content && (
        <p className="text-sm text-gray-500 mt-1 italic">„{review.content}"</p>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardContent() {
  const { user, authFetch } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<View>('compact')
  const [csatlakozasModal, setCsatlakozasModal] = useState(false)
  const [profileData, setProfileData] = useState<{ fullName: string; osztaly: string } | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(true)
  const [myReviews, setMyReviews] = useState<MyReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const isIDO = user?.role === 'Idos' || user?.role === 'President'
  const isElnok = user?.role === 'President'
  const isIdosTag = user?.role === 'Idos'

  const fetchApplication = async () => {
    setApplicationLoading(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application/${user?.id}`)
    if (response.status === 404) setApplication(null)
    else setApplication(await response.json())
    setApplicationLoading(false)
  }

  const fetchMyReviews = async () => {
    if (!user) return
    setReviewsLoading(true)
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ertekeles/myreviews/${user.id}`)
      if (res.ok) setMyReviews(await res.json())
    } catch (err) {
      console.error('Reviews fetch error:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) setProfileData(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'reviews') setView('reviews')
  }, [searchParams])

  useEffect(() => {
    if (!user || isIDO) return
    fetchApplication()
  }, [user])

  // Reviews betöltése — minden user láthatja a sajátját
  useEffect(() => {
    if (!user) return
    fetchMyReviews()
  }, [user])

  useEffect(() => {
    if (user?.role === 'Admin') router.push('/admin')
    if (!user) router.push('/login')
  }, [user])

  if (user?.role === 'Admin') return null
  if (!user) return null

  const handleApply = async (motivacio: string, tapasztalat: string) => {
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ido_applys_users_id: user?.id, motivation: motivacio, experince: tapasztalat }),
    })
    if (!response.ok) { alert('Hiba történt a jelentkezés során!'); return }
    setCsatlakozasModal(false)
    await fetchApplication()
  }

  const renderIDOPanel = () => {
    if (isElnok) return <ElnokDashboard userId={user?.id} />
    if (isIdosTag) return <IdosDashboard userId={user?.id} />

    if (applicationLoading) {
      return (
        <div className="bg-[#6034e3] rounded-2xl p-6 flex items-center justify-center py-10">
          <p className="text-white/60 text-sm">Betöltés...</p>
        </div>
      )
    }

    if (user.role === 'Graduated') return <div />

    if (application?.accepted === 'Pending') {
      return (
        <div className="bg-[#6034e3] rounded-2xl p-6">
          <div className="text-center py-4">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-white text-lg font-bold mb-2">Jelentkezés elbírálás alatt</p>
            <p className="text-white/70 text-sm">A jelentkezésedet megkaptuk, hamarosan visszajelzünk!</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        {application?.accepted === 'Rejected' && (
          <div className="bg-white/10 rounded-xl p-3 mb-4">
            <p className="text-white text-sm font-semibold">❌ Korábbi jelentkezésedet elutasították.</p>
            <p className="text-white/60 text-sm mt-1">Újra jelentkezhetsz!</p>
          </div>
        )}
        <div className="text-center py-4">
          <p className="text-white text-lg font-semibold mb-2">Szeretnél IDÖ tag lenni?</p>
          <p className="text-white/70 mb-4">Csatlakozz a diákönkormányzathoz és légy részese az eseményeknek!</p>
          <button
            onClick={() => setCsatlakozasModal(true)}
            className="border-2 border-white text-white px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-[#6034e3] transition-all duration-300"
          >
            Csatlakozás
          </button>
        </div>
      </div>
    )
  }

  // ─── Reviews panel ──────────────────────────────────────────────────────────

  const renderReviewsPanel = (limit?: number) => {
    if (reviewsLoading) {
      return (
        <div className="flex flex-col gap-3">
          {[...Array(limit ?? 3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )
    }

    if (!myReviews.length) {
      return <p className="text-gray-400 text-sm italic">Még nincs értékelésed.</p>
    }

    const displayed = limit ? myReviews.slice(0, limit) : myReviews

    return (
      <div className="flex flex-col gap-3">
        {displayed.map(review => <ReviewCard key={review.id} review={review} />)}
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-6">
      {csatlakozasModal && (
        <CsatlakozasModal onClose={() => setCsatlakozasModal(false)} onSubmit={handleApply} />
      )}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#6034e3]">Irányítópult</h1>
            <p className="text-gray-500 mt-1">
              Üdv, <span className="font-semibold text-[#171717]">{profileData?.fullName ?? 'Vendég'}</span>!
            </p>
          </div>
        </div>

        {/* COMPACT VIEW */}
        {view === 'compact' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Legutóbbi értékeléseim</h2>
              {renderReviewsPanel(3)}
              {myReviews.length > 0 && (
                <button
                  onClick={() => setView('reviews')}
                  className="mt-4 border-2 border-[#6034e3] text-[#6034e3] px-4 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all duration-300 w-full"
                >
                  Összes értékelés ({myReviews.length})
                </button>
              )}
            </div>
            {renderIDOPanel()}
          </div>
        )}

        {/* REVIEWS VIEW */}
        {view === 'reviews' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#171717]">
                Összes értékelésem
                <span className="ml-2 text-sm font-normal text-gray-400">({myReviews.length} db)</span>
              </h2>
              <button onClick={() => setView('compact')} className="text-[#6034e3] font-semibold hover:underline text-sm">
                ← Vissza
              </button>
            </div>
            {renderReviewsPanel()}
          </div>
        )}
      </div>
    </main>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}