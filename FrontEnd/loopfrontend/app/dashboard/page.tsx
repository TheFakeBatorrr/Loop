'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'

// ============================================================
// TÍPUSOK
// ============================================================

type View = 'compact' | 'reviews' | 'staff'
type ElnokPanel = null | 'ujEsemeny' | 'archivum' | 'staff'
type EventType = 'ido_only' | 'ido_school'

type Application = {
  id: number
  ido_applys_users_id: number
  motivation: string
  experince: string
  accepted: 'Pending' | 'Accepted' | 'Rejected'
  name: string
  class_number: number
  class_letter: string
}

type Event = {
  id: number
  type: EventType
  topic: string
  target_group: string
  date: string
  location: string
  max_capacity: number
  status: string
  visibility: 'public' | 'ido_only'
}

// ============================================================
// SEGÉD KOMPONENSEK
// ============================================================

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= count ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-white/60 text-sm">{message}</p>
}

// ============================================================
// CSATLAKOZÁS MODAL (diák POV)
// ============================================================

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
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all duration-300">Mégse</button>
          <button onClick={() => onSubmit(motivacio, tapasztalat)} className="flex-1 bg-[#6034e3] text-white py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-all duration-300">Küldés</button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ÚJ ESEMÉNY MODAL (elnök POV)
// ============================================================

function UjEsemenyModal({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<EventType>('ido_only')
  const [targetGroup, setTargetGroup] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'ido_only'>('ido_only')

  const canSubmit = topic !== '' && targetGroup !== '' && date !== '' && location !== '' && maxCapacity !== ''

  // TODO: bekötni a POST /api/esemeny endpointhoz amikor az esemény controller kész van
  const handleSubmit = () => {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-[#6034e3] mb-6">Új esemény létrehozása</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Téma</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="pl. Csapatépítő 2025" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Típus</label>
            <select value={type} onChange={e => setType(e.target.value as EventType)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
              <option value="ido_only">Csak IDÖ</option>
              <option value="ido_school">IDÖ + Iskolai</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Láthatóság</label>
            <div className="flex gap-3">
              {(['ido_only', 'public'] as const).map(v => (
                <button key={v} onClick={() => setVisibility(v)} className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${visibility === v ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-gray-200 text-gray-500'}`}>
                  {v === 'public' ? 'Publikus' : 'Csak IDÖ'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Célcsoport</label>
            <input type="text" value={targetGroup} onChange={e => setTargetGroup(e.target.value)} placeholder="pl. Minden diák / IDÖ tagok" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Dátum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Max létszám</label>
              <input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} placeholder="pl. 30" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Helyszín</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="pl. Városliget" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all">Mégse</button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${canSubmit ? 'bg-[#6034e3] text-white hover:bg-[#8643eb]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Létrehozás
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ELNÖK DASHBOARD
// ============================================================

function ElnokDashboard({ token }: { token: string | null }) {
  const [activePanel, setActivePanel] = useState<ElnokPanel>(null)
  const [ujEsemenyModal, setUjEsemenyModal] = useState(false)

  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)

  // TODO: events bekötése — GET /api/esemeny vagy GET /api/ido-events endpoint kész után
  // const [events, setEvents] = useState<Event[]>([])
  // const [eventsLoading, setEventsLoading] = useState(true)

  // TODO: IDÖ tagok bekötése — GET /api/staff endpoint kész után
  // const [staffMembers, setStaffMembers] = useState([])
  // const [staffLoading, setStaffLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setApplicationsLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/pending`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )
    if (response.ok) {
      const data = await response.json()
      setApplications(data)
    }
    setApplicationsLoading(false)
  }

  const handleAccept = async (application: Application) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${application.id}/accept`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )
    if (!response.ok) {
      alert('Hiba történt az elfogadás során!')
      return
    }
    await fetchApplications()
  }

  const handleDecline = async (application: Application) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${application.id}/reject`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )
    if (!response.ok) {
      alert('Hiba történt az elutasítás során!')
      return
    }
    await fetchApplications()
  }

  const pendingCount = applications.length

  // ── Új esemény panel ──
  if (activePanel === 'ujEsemeny') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        {ujEsemenyModal && <UjEsemenyModal onClose={() => setUjEsemenyModal(false)} />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-black">Új esemény</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>
        <p className="text-white/70 text-sm mb-4">Hozz létre egy új IDÖ eseményt.</p>
        <button
          onClick={() => setUjEsemenyModal(true)}
          className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#6034e3] transition-all duration-300 w-full"
        >
          + Új esemény létrehozása
        </button>
      </div>
    )
  }

  // ── Esemény archívum panel ──
  if (activePanel === 'archivum') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-black">Esemény archívum</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>

        {/* TODO: events state-et bekötni — GET /api/esemeny vagy /api/ido-events után uncomment */}
        <EmptyState message="Még nincs esemény." />

      </div>
    )
  }

  // ── Staff panel ──
  if (activePanel === 'staff') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-black">Staff</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>

        <div className="flex flex-col gap-6">

          {/* Csatlakozási kérelmek */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-white font-bold">Csatlakozási kérelmek</p>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </div>

            {applicationsLoading ? (
              <p className="text-white/60 text-sm">Betöltés...</p>
            ) : applications.length === 0 ? (
              <EmptyState message="Nincs függő kérelem." />
            ) : applications.map(a => (
              <div key={a.id} className="bg-white/10 rounded-xl px-4 py-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{a.name}</p>
                    <p className="text-white/60 text-sm">{a.class_number}.{a.class_letter}</p>
                  </div>
                  <span className="bg-yellow-400/20 text-yellow-300 text-xs px-2 py-1 rounded-full font-semibold">{a.accepted}</span>
                </div>
                <p className="text-white/60 text-sm mb-1"><span className="text-white/80 font-semibold">Motiváció:</span> {a.motivation}</p>
                <p className="text-white/60 text-sm mb-3"><span className="text-white/80 font-semibold">Tapasztalat:</span> {a.experince}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecline(a)}
                    className="flex-1 border border-red-400 text-red-300 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-400 hover:text-white transition-all"
                  >
                    Elutasít
                  </button>
                  <button
                    onClick={() => handleAccept(a)}
                    className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all"
                  >
                    Elfogad
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* IDÖ tagok */}
          <div>
            <p className="text-white font-bold mb-3">IDÖ tagok</p>
            {/* TODO: staffMembers state-et bekötni — GET /api/staff endpoint kész után */}
            <EmptyState message="Még nincs tag." />
          </div>

        </div>
      </div>
    )
  }

  // ── Főnézet: 3 panel ──
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">👑</span>
        <div>
          <p className="text-[#171717] font-black text-lg">IDÖ vezérlőpult</p>
          <p className="text-gray-500 text-sm">Elnöki funkciók és áttekintés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActivePanel('ujEsemeny')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300"
        >
          <div className="text-3xl mb-3">📅</div>
          <p className="text-white font-black text-lg">Új esemény</p>
          <p className="text-white/60 text-sm mt-1">IDÖ esemény létrehozása</p>
        </button>

        <button
          onClick={() => setActivePanel('archivum')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300"
        >
          <div className="text-3xl mb-3">📁</div>
          <p className="text-white font-black text-lg">Esemény archívum</p>
          <p className="text-white/60 text-sm mt-1">Összes IDÖ esemény</p>
        </button>

        <button
          onClick={() => setActivePanel('staff')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300 relative"
        >
          {pendingCount > 0 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
          <div className="text-3xl mb-3">👥</div>
          <p className="text-white font-black text-lg">Staff</p>
          <p className="text-white/60 text-sm mt-1">Tagok és kérelmek</p>
        </button>
      </div>
    </div>
  )
}

// ============================================================
// DASHBOARD FŐ KOMPONENS
// ============================================================

function DashboardContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [view, setView] = useState<View>('compact')
  const [csatlakozasModal, setCsatlakozasModal] = useState(false)
  const [profileData, setProfileData] = useState<{ fullName: string, osztaly: string } | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(true)

  const isIDO = user?.role === 'Idos' || user?.role === 'President'
  const isElnok = user?.role === 'President'

  // Profil adatok localStorage-ból
  useEffect(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) setProfileData(JSON.parse(saved))
  }, [])

  // Tab query param kezelés
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'reviews') setView('reviews')
  }, [searchParams])

  // Diák IDÖ jelentkezés lekérése
  useEffect(() => {
    if (!user || isIDO) return
    fetchApplication()
  }, [user])

  // Auth guard
  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  if (!user) return null

  const fetchApplication = async () => {
    setApplicationLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${user?.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    )
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
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ido_applys_users_id: user?.id,
        motivation: motivacio,
        experince: tapasztalat,
      }),
    })

    if (!response.ok) {
      alert('Hiba történt a jelentkezés során!')
      return
    }

    setCsatlakozasModal(false)
    await fetchApplication()
  }

  const renderIDOPanel = () => {
    if (isElnok) return <ElnokDashboard token={token} />

    // IDÖ tag — programok
    if (isIDO) {
      return (
        <div className="bg-[#6034e3] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Legutóbbi 3 programom</h2>
          {/* TODO: bekötni — GET /api/ido-events endpoint kész után */}
          <EmptyState message="Még nincs program adat." />
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

    // Függő jelentkezés
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

    // Nincs jelentkezés vagy elutasított
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

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-6">
      {csatlakozasModal && (
        <CsatlakozasModal
          onClose={() => setCsatlakozasModal(false)}
          onSubmit={handleApply}
        />
      )}

      <div className="max-w-5xl mx-auto">

        {/* Fejléc */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#6034e3]">Irányítópult</h1>
            <p className="text-gray-500 mt-1">Üdv, <span className="font-semibold text-[#171717]">{profileData?.fullName ?? 'Vendég'}</span>!</p>
          </div>
          {isIDO && !isElnok && (
            <button
              onClick={() => setView(view === 'staff' ? 'compact' : 'staff')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 border-2
                ${view === 'staff' ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-[#6034e3] text-[#6034e3]'}`}
            >
              Staff felület
            </button>
          )}
        </div>

        {/* Compact view */}
        {view === 'compact' && (
          <div className="flex flex-col gap-6">

            {/* Értékelések doboz */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Legutóbbi 3 értékelésem</h2>
              {/* TODO: bekötni — GET /api/ertekeles endpoint kész után */}
              <p className="text-gray-400 text-sm">Még nincs értékelés.</p>
              <button
                onClick={() => setView('reviews')}
                className="mt-4 border-2 border-[#6034e3] text-[#6034e3] px-4 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all duration-300 w-full"
              >
                Több
              </button>
            </div>

            {/* IDÖ / Elnök / Diák panel */}
            {renderIDOPanel()}

          </div>
        )}

        {/* Reviews view */}
        {view === 'reviews' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#171717]">Összes értékelésem</h2>
              <button onClick={() => setView('compact')} className="text-[#6034e3] font-semibold hover:underline text-sm">← Vissza</button>
            </div>
            {/* TODO: bekötni — GET /api/ertekeles endpoint kész után */}
            <p className="text-gray-400 text-sm">Még nincs értékelés.</p>
          </div>
        )}

        {/* Staff view — csak sima IDÖ tagnak, elnöknek nem */}
        {view === 'staff' && isIDO && !isElnok && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#171717]">Staff felület — Programjaim</h2>
              <button onClick={() => setView('compact')} className="text-[#6034e3] font-semibold hover:underline text-sm">← Vissza</button>
            </div>
            {/* TODO: bekötni — GET /api/ido-events endpoint kész után */}
            <p className="text-gray-400 text-sm">Még nincs program adat.</p>
          </div>
        )}

      </div>
    </main>
  )
}

// ============================================================
// PAGE EXPORT
// ============================================================

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}