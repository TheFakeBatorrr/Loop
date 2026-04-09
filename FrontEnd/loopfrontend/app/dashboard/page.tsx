'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'

type View = 'compact' | 'reviews' | 'staff'

const fakeReviews = [
  { id: 1, event: 'Gólyabál 2025', rating: 5, comment: 'Fantasztikus este volt!', date: '2025.03.15' },
  { id: 2, event: 'Sportsnap', rating: 4, comment: 'Jól szervezett, de lehetett volna több program.', date: '2025.02.20' },
  { id: 3, event: 'Karácsonyi műsor', rating: 5, comment: 'Hangulatos és szép volt.', date: '2024.12.18' },
]

const fakePrograms = [
  { id: 1, name: 'Gólyabál 2025', date: '2025.03.15', role: 'Szervező', extraInfo: 'Placeholder: részvételi adatok' },
  { id: 2, name: 'Sportsnap', date: '2025.02.20', role: 'Segítő', extraInfo: 'Placeholder: feladatok listája' },
  { id: 3, name: 'Karácsonyi műsor', date: '2024.12.18', role: 'Főszervező', extraInfo: 'Placeholder: költségvetés' },
  { id: 4, name: 'Nyílt nap', date: '2024.11.05', role: null, extraInfo: null },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= count ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  )
}

function CsatlakozasModal({ onClose }: { onClose: () => void }) {
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
              placeholder="Miért szeretnél csatlakozni a DÖK-höz?"
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
          <button className="flex-1 bg-[#6034e3] text-white py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-all duration-300">
            Küldés
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<View>('compact')
  const [csatlakozasModal, setCsatlakozasModal] = useState(false)
  const [profileData, setProfileData] = useState<{ fullName: string, osztaly: string } | null>(null)

  const isIDO = user?.role === 'ido' || user?.role === 'elnok'

  useEffect(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) setProfileData(JSON.parse(saved))
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'reviews') setView('reviews')
  }, [searchParams])

  // INNEN SZEDJEM MAJD KI A KOMMENTET
  // useEffect(() => {
  //   if (!user) router.push('/login')
  // }, [user])

  // INNEN SZEDJEM MAJD KI A KOMMENTET
  // if (!user) return null

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-6">
      {csatlakozasModal && <CsatlakozasModal onClose={() => setCsatlakozasModal(false)} />}

      <div className="max-w-5xl mx-auto">

        {/* Fejléc */}
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

        {/* COMPACT VIEW */}
        {view === 'compact' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Legutóbbi 3 értékelésem</h2>
              <div className="flex flex-col gap-4">
                {fakeReviews.map(r => (
                  <div key={r.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-[#171717]">{r.event}</p>
                      <p className="text-gray-400 text-sm">{r.date}</p>
                      <p className="text-gray-500 text-sm mt-1">{r.comment}</p>
                    </div>
                    <Stars count={r.rating} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setView('reviews')}
                className="mt-4 border-2 border-[#6034e3] text-[#6034e3] px-4 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all duration-300 w-full"
              >
                Több
              </button>
            </div>

            <div className="bg-[#6034e3] rounded-2xl p-6">
              {isIDO ? (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">Legutóbbi 3 programom</h2>
                  <div className="flex flex-col gap-3">
                    {fakePrograms.slice(0, 3).map(p => (
                      <div key={p.id} className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{p.name}</p>
                          <p className="text-white/60 text-sm">{p.date}</p>
                        </div>
                        {p.role && (
                          <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{p.role}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
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
              )}
            </div>
          </div>
        )}

        {/* REVIEWS VIEW */}
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
            <div className="flex flex-col gap-4">
              {fakeReviews.map(r => (
                <div key={r.id} className="bg-[#fafafa] rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-[#171717]">{r.event}</p>
                    <Stars count={r.rating} />
                  </div>
                  <p className="text-gray-500 text-sm">{r.comment}</p>
                  <p className="text-gray-400 text-xs mt-2">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAFF VIEW */}
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
            <div className="flex flex-col gap-4">
              {fakePrograms.map(p => (
                <div key={p.id} className={`rounded-xl p-4 border ${p.role ? 'border-[#6034e3]/30 bg-[#6034e3]/5' : 'border-gray-100 bg-[#fafafa]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-[#171717]">{p.name}</p>
                    {p.role ? (
                      <span className="bg-[#6034e3] text-white text-sm px-3 py-1 rounded-full">{p.role}</span>
                    ) : (
                      <span className="bg-gray-200 text-gray-500 text-sm px-3 py-1 rounded-full">Nem voltam staff</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{p.date}</p>
                  {p.extraInfo && (
                    <div className="bg-white rounded-lg p-3 border border-[#6034e3]/20">
                      <p className="text-gray-500 text-sm">{p.extraInfo}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}