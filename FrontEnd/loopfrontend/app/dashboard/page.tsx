'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'

type View = 'compact' | 'reviews' | 'staff'

type Application = {
  id: number
  ido_applys_users_id: number
  motivation: string
  experince: string
  accepted: string
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= count ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  )
}

function CsatlakozasModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (motivacio: string, tapasztalat: string) => void }) {
  const [motivacio, setMotivacio] = useState('')
  const [tapasztalat, setTapasztalat] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-black text-[#6034e3] mb-6">Csatlakozás az IDÖ-höz</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Motiváció</label>
            <textarea
              value={motivacio}
              onChange={e => setMotivacio(e.target.value)}
              placeholder="Miért szeretnél csatlakozni az IDÖ-höz?"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all duration-300 resize-none h-28 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Tapasztalat</label>
            <textarea
              value={tapasztalat}
              onChange={e => setTapasztalat(e.target.value)}
              placeholder="Van-e korábbi tapasztalatod hasonló tevékenységben?"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all duration-300 resize-none h-24 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all duration-300"
          >
            Mégse
          </button>
          <button
            onClick={() => onSubmit(motivacio, tapasztalat)}
            className="flex-1 bg-[#6034e3] text-white py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-all duration-300"
          >
            Küldés
          </button>
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<View>('compact')
  const [csatlakozasModal, setCsatlakozasModal] = useState(false)
  const [profileData, setProfileData] = useState<{ fullName: string, osztaly: string } | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(true)

  const isIDO = user?.role === 'idos' || user?.role === 'elnok'

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

  const fetchApplication = async () => {
    setApplicationLoading(true)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application/${user?.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    if (response.status === 404) {
      setApplication(null)
    } else {
      const data = await response.json()
      setApplication(data)
    }
    setApplicationLoading(false)
  }

  const handleApply = async (motivacio: string, tapasztalat: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ido_applys_users_id: user?.id,
        motivation: motivacio,
        experince: tapasztalat,
      })
    })

    if (!response.ok) {
      alert('Hiba történt a jelentkezés során!')
      return
    }

    setCsatlakozasModal(false)
    await fetchApplication()
  }

  useEffect(() => {
   if (!user) router.push('/login')
    }, [user])

  if (!user) return null

  const renderIDOPanel = () => {
    if (isIDO) {
      return (
        <div className="bg-[#6034e3] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Legutóbbi 3 programom</h2>
          <p className="text-white/60 text-sm">Még nincs program adat.</p>
        </div>
      )
    }

    if (applicationLoading) {
      return (
        <div className="bg-[#6034e3] rounded-2xl p-6 flex items-center justify-center py-10">
          <p className="text-white/60 text-sm">Betöltés...</p>
        </div>
      )
    }

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
        {application?.accepted === 'Declined' && (
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

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-6">
      {csatlakozasModal && (
        <CsatlakozasModal
          onClose={() => setCsatlakozasModal(false)}
          onSubmit={handleApply}
        />
      )}

      <div className="max-w-5xl mx-auto">

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#6034e3]">Irányítópult</h1>
            <p className="text-gray-500 mt-1">Üdv, <span className="font-semibold text-[#171717]">{profileData?.fullName ?? 'Vendég'}</span>!</p>
          </div>
          {isIDO && (
            <button
              onClick={() => setView(view === 'staff' ? 'compact' : 'staff')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 border-2
                ${view === 'staff' ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-[#6034e3] text-[#6034e3]'}`}
            >
              Staff felület
            </button>
          )}
        </div>

        {view === 'compact' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Legutóbbi 3 értékelésem</h2>
              <p className="text-gray-400 text-sm">Még nincs értékelés.</p>
              <button
                onClick={() => setView('reviews')}
                className="mt-4 border-2 border-[#6034e3] text-[#6034e3] px-4 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all duration-300 w-full"
              >
                Több
              </button>
            </div>

            {renderIDOPanel()}
          </div>
        )}

        {view === 'reviews' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#171717]">Összes értékelésem</h2>
              <button
                onClick={() => setView('compact')}
                className="text-[#6034e3] font-semibold hover:underline text-sm"
              >
                ← Vissza
              </button>
            </div>
            <p className="text-gray-400 text-sm">Még nincs értékelés.</p>
          </div>
        )}

        {view === 'staff' && isIDO && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#171717]">Staff felület — Programjaim</h2>
              <button
                onClick={() => setView('compact')}
                className="text-[#6034e3] font-semibold hover:underline text-sm"
              >
                ← Vissza
              </button>
            </div>
            <p className="text-gray-400 text-sm">Még nincs program adat.</p>
          </div>
        )}

      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}