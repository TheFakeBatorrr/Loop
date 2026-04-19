'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'

// ============================================================
// TÍPUSOK
// ============================================================

type View = 'compact' | 'reviews' | 'staff'
type ElnokPanel = null | 'esemenyek' | 'archivum' | 'staff'
type EventType = 'ido_only' | 'ido_school' | 'school_ido'
type EventStatus = 'draft' | 'staff_gathering' | 'pending_review' | 'published' | 'ended'

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
  name: string
  type: EventType
  topic: string
  target_audience: string
  date: string
  location: string
  max_capacity: number
  status: EventStatus
  visibility: 'public' | 'ido_only'
  created_by: number
}

// Archívum esemény — joined events + ido_events flat lekérdezés
// GET /api/esemeny/archivum — leftJoin ido_events-szel
type ArchivedEvent = {
  id: number
  name: string
  type: EventType
  topic: string
  date: string
  location: string
  max_capacity: number
  target_audience: string
  ido_event_id: number | null   // null ha még nincs ido_events sor
  revenue: string | null
  expanses: string | null
  main_organizer_id: number | null
}

type Member = {
  id: number
  email: string
  name: string
  class_number: number
  class_letter: string
}

// ============================================================
// SEGÉD KOMPONENSEK
// ============================================================

function EmptyState({ message }: { message: string }) {
  return <p className="text-white/60 text-sm">{message}</p>
}

const statusLabel: Record<EventStatus, string> = {
  draft: 'Tervezet',
  staff_gathering: 'Staff gyűjtés',
  pending_review: 'Jóváhagyásra vár',
  published: 'Publikált',
  ended: 'Lezárt',
}

const statusColor: Record<EventStatus, string> = {
  draft: 'bg-gray-400/20 text-gray-200',
  staff_gathering: 'bg-blue-400/20 text-blue-300',
  pending_review: 'bg-yellow-400/20 text-yellow-300',
  published: 'bg-green-400/20 text-green-300',
  ended: 'bg-red-400/20 text-red-300',
}

const typeLabel: Record<EventType, string> = {
  ido_only: 'Csak IDÖ',
  ido_school: 'IDÖ + Iskolai',
  school_ido: 'Iskolai + IDÖ',
}

// ============================================================
// CSATLAKOZÁS MODAL (diák POV)
// ============================================================

function CsatlakozasModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (motivacio: string, tapasztalat: string) => void
}) {
  const [motivacio, setMotivacio] = useState('')
  const [tapasztalat, setTapasztalat] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-black text-[#6034e3] mb-6">Csatlakozás az IDÖ-höz</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Motiváció</label>
            <textarea value={motivacio} onChange={e => setMotivacio(e.target.value)}
              placeholder="Miért szeretnél csatlakozni az IDÖ-höz?"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all duration-300 resize-none h-28 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Tapasztalat</label>
            <textarea value={tapasztalat} onChange={e => setTapasztalat(e.target.value)}
              placeholder="Van-e korábbi tapasztalatod hasonló tevékenységben?"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all duration-300 resize-none h-24 text-sm" />
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

function UjEsemenyModal({ onClose, onCreated, token, userId }: {
  onClose: () => void
  onCreated: () => void
  token: string | null
  userId: number | undefined
}) {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<'ido_only' | 'ido_school'>('ido_only')
  const [targetAudience, setTargetAudience] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'ido_only'>('ido_only')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name !== '' && topic !== '' && targetAudience !== '' && date !== '' && location !== '' && maxCapacity !== ''

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        name, topic, type,
        target_audience: targetAudience,
        date, location,
        max_capacity: parseInt(maxCapacity),
        visibility,
        status: 'draft',
        created_by: userId,
      }),
    })

    if (!response.ok) { setError('Hiba történt az esemény létrehozásakor.'); setLoading(false); return }
    setLoading(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-[#6034e3] mb-6">Új esemény létrehozása</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Név</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="pl. Gólyabál 2025"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Téma</label>
            <select value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
              <option value="">— Válassz témát —</option>
              <option value="Sport">Sport</option>
              <option value="Kultúra">Kultúra</option>
              <option value="Tanulmány">Tanulmány</option>
              <option value="Tovább tanulás">Tovább tanulás</option>
              <option value="Iskolai élet">Iskolai élet</option>
              <option value="Szórakozás">Szórakozás</option>
              <option value="Csapatépítés">Csapatépítés</option>
              <option value="Egyéb">Egyéb</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Típus</label>
            <select value={type} onChange={e => setType(e.target.value as 'ido_only' | 'ido_school')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
              <option value="ido_only">Csak IDÖ</option>
              <option value="ido_school">IDÖ + Iskolai</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Láthatóság</label>
            <div className="flex gap-3">
              {(['ido_only', 'public'] as const).map(v => (
                <button key={v} onClick={() => setVisibility(v)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${visibility === v ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-gray-200 text-gray-500'}`}>
                  {v === 'public' ? 'Publikus' : 'Csak IDÖ'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Célcsoport</label>
            <input type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="pl. Minden diák / IDÖ tagok"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Dátum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Max létszám</label>
              <input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} placeholder="pl. 30"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Helyszín</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="pl. Városliget"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all">Mégse</button>
          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${canSubmit && !loading ? 'bg-[#6034e3] text-white hover:bg-[#8643eb]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {loading ? 'Létrehozás...' : 'Létrehozás'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ESEMÉNY KÁRTYA (elnök POV — lenyitható, aktív eventi)
// ============================================================

function EsemenyKartya({ event, token, onStatusUpdate }: {
  event: Event
  token: string | null
  onStatusUpdate: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Következő lépés gomb felirata típus + státusz alapján
  // ido_only: draft → published (nincs staff gathering)
  // ido_school / school_ido: draft → staff_gathering → pending_review (admin jóváhagyja)
  const getNextLabel = (): string | null => {
    if (event.type === 'ido_only') {
      if (event.status === 'draft') return 'Publikálás'
      return null
    }
    if (event.status === 'draft') return 'Staff gyűjtés indítása'
    if (event.status === 'staff_gathering') return 'Staff gyűjtés lezárása → Jóváhagyásra küldés'
    return null // pending_review-tól az admin veszi át
  }

  const nextLabel = getNextLabel()

  const handleNextStatus = async () => {
    setLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/${event.id}/next-status`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (!response.ok) { alert('Hiba történt a státusz frissítésekor!'); setLoading(false); return }
    setLoading(false)
    onStatusUpdate()
  }

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-all">
        <div className="flex flex-col gap-0.5">
          <p className="text-white font-semibold">{event.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{typeLabel[event.type]}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs">{event.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[event.status]}`}>
            {statusLabel[event.status]}
          </span>
          <span className="text-white/40 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Téma</p>
              <p className="text-white">{event.topic}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Célcsoport</p>
              <p className="text-white">{event.target_audience}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Helyszín</p>
              <p className="text-white">{event.location}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Max férőhely</p>
              <p className="text-white">{event.max_capacity} fő</p>
            </div>
          </div>

          {/* Staff gyűjtés szekció — csak staff_gathering státusznál */}
          {event.status === 'staff_gathering' && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/80 text-sm font-semibold mb-2">Staff jelentkezők</p>
              {/* TODO: staff jelentkezők lekérése — GET /api/ido-events/{id}/staff endpoint kész után */}
              <p className="text-white/50 text-sm">Még nincs staff jelentkező.</p>
            </div>
          )}

          {/* Következő lépés gomb — csak ha az elnöknek van teendője */}
          {nextLabel && (
            <button onClick={handleNextStatus} disabled={loading}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all border-2
                ${loading ? 'border-white/20 text-white/30 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-[#6034e3]'}`}>
              {loading ? 'Frissítés...' : nextLabel}
            </button>
          )}

          {/* Tájékoztató ha az admin jóváhagyására vár */}
          {event.status === 'pending_review' && (
            <div className="bg-yellow-400/10 rounded-xl p-3">
              <p className="text-yellow-300 text-sm">⏳ Az esemény jóváhagyásra vár az adminisztrátornál.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// ARCHÍV ESEMÉNY KÁRTYA (lenyitható, bevétel/kiadás szerkesztéssel)
// ============================================================

function ArchivKartya({ event, token, onSaved }: {
  event: ArchivedEvent
  token: string | null
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [revenue, setRevenue] = useState(event.revenue ?? '')
  const [expanses, setExpanses] = useState(event.expanses ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasIdoData = event.ido_event_id !== null

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    if (hasIdoData) {
      // Van már ido_events sor — PUT /api/ido-events/{ido_event_id}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events/${event.ido_event_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
          body: JSON.stringify({ revenue, expanses }),
        }
      )
      if (!response.ok) { setError('Hiba történt a mentés során.'); setLoading(false); return }
    } else {
      // Még nincs ido_events sor — POST /api/ido-events
      // TODO: main_organizer_id-t majd be kell kötni ha az elnök kiválasztja a főszervezőt
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
          body: JSON.stringify({ ido_event_id: event.id, revenue, expanses }),
        }
      )
      if (!response.ok) { setError('Hiba történt a mentés során.'); setLoading(false); return }
    }

    setLoading(false)
    setEditing(false)
    onSaved()
  }

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden opacity-90">

      {/* Fejléc */}
      <button onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-all">
        <div className="flex flex-col gap-0.5">
          <p className="text-white font-semibold">{event.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{typeLabel[event.type]}</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/50 text-xs">{event.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Jelzi ha még nincs pénzügyi adat rögzítve */}
          {!hasIdoData && (
            <span className="bg-orange-400/20 text-orange-300 text-xs px-2 py-1 rounded-full font-semibold">Hiányos</span>
          )}
          <span className="bg-red-400/20 text-red-300 text-xs px-2 py-1 rounded-full font-semibold">Lezárt</span>
          <span className="text-white/40 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Lenyíló részletek */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 pt-3">

          {/* Alap infók */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Téma</p>
              <p className="text-white">{event.topic}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Célcsoport</p>
              <p className="text-white">{event.target_audience}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Helyszín</p>
              <p className="text-white">{event.location}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Max férőhely</p>
              <p className="text-white">{event.max_capacity} fő</p>
            </div>
          </div>

          {/* Pénzügyi szekció */}
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/80 text-sm font-semibold">Pénzügyek</p>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="text-white/60 hover:text-white text-xs font-semibold transition-all">
                  ✏️ Szerkesztés
                </button>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-2">
                {error && <p className="text-red-300 text-xs">{error}</p>}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1 block">Bevétel</label>
                  <input type="text" value={revenue} onChange={e => setRevenue(e.target.value)}
                    placeholder="pl. 50000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/50 transition-all" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1 block">Kiadás</label>
                  <input type="text" value={expanses} onChange={e => setExpanses(e.target.value)}
                    placeholder="pl. 30000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/50 transition-all" />
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => { setEditing(false); setError(null) }}
                    className="flex-1 border border-white/20 text-white/60 py-1.5 rounded-lg text-sm font-semibold hover:border-white/40 transition-all">
                    Mégse
                  </button>
                  <button onClick={handleSave} disabled={loading}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all
                      ${loading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-[#6034e3] hover:bg-white/90'}`}>
                    {loading ? 'Mentés...' : 'Mentés'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Bevétel</p>
                  <p className="text-white font-semibold">{event.revenue ?? '—'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Kiadás</p>
                  <p className="text-white font-semibold">{event.expanses ?? '—'}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

// ============================================================
// ELNÖK DASHBOARD
// ============================================================

function ElnokDashboard({ token, userId }: { token: string | null, userId: number | undefined }) {
  const [activePanel, setActivePanel] = useState<ElnokPanel>(null)
  const [ujEsemenyModal, setUjEsemenyModal] = useState(false)

  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)

  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)

  // Aktív elnöki események — GET /api/esemeny/elnok
  // Szűrés backenden: type != 'external', status NOT IN ('published', 'ended')
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  // Archív események — GET /api/esemeny/archivum
  // Szűrés backenden: type != 'external', status = 'ended', leftJoin ido_events
  const [archivedEvents, setArchivedEvents] = useState<ArchivedEvent[]>([])
  const [archivedLoading, setArchivedLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
    fetchMembers()
    fetchEvents()
  }, [])

  const fetchApplications = async () => {
    setApplicationsLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/pending`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (response.ok) setApplications(await response.json())
    setApplicationsLoading(false)
  }

  const fetchMembers = async () => {
    setMembersLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/members`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (response.ok) setMembers(await response.json())
    setMembersLoading(false)
  }

  const fetchEvents = async () => {
    setEventsLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/elnok`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (response.ok) setEvents(await response.json())
    setEventsLoading(false)
  }

  // Archívum lekérése — csak akkor hívjuk ha a panel megnyílik
  const fetchArchivedEvents = async () => {
    setArchivedLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/archivum`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (response.ok) setArchivedEvents(await response.json())
    setArchivedLoading(false)
  }

  const handleAccept = async (application: Application) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${application.id}/accept`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (!response.ok) { alert('Hiba történt az elfogadás során!'); return }
    await fetchApplications()
  }

  const handleDecline = async (application: Application) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${application.id}/reject`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (!response.ok) { alert('Hiba történt az elutasítás során!'); return }
    await fetchApplications()
  }

  const pendingCount = applications.length

  // ── Események panel ──
  if (activePanel === 'esemenyek') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        {ujEsemenyModal && (
          <UjEsemenyModal onClose={() => setUjEsemenyModal(false)} onCreated={fetchEvents} token={token} userId={userId} />
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-black">Események</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>
        <button onClick={() => setUjEsemenyModal(true)}
          className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#6034e3] transition-all duration-300 w-full mb-5">
          + Új esemény létrehozása
        </button>
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">Folyamatban lévő eseményeid</p>
          {eventsLoading ? (
            <p className="text-white/60 text-sm">Betöltés...</p>
          ) : events.length === 0 ? (
            <EmptyState message="Még nincs aktív esemény." />
          ) : (
            <div className="flex flex-col gap-2">
              {events.map(e => (
                <EsemenyKartya key={e.id} event={e} token={token} onStatusUpdate={fetchEvents} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Archívum panel ──
  if (activePanel === 'archivum') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-black">Archívum</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>
        <p className="text-white/60 text-sm mb-4">Lezárt események — bevétel és kiadás rögzítése.</p>
        {archivedLoading ? (
          <p className="text-white/60 text-sm">Betöltés...</p>
        ) : archivedEvents.length === 0 ? (
          <EmptyState message="Még nincs lezárt esemény." />
        ) : (
          <div className="flex flex-col gap-2">
            {archivedEvents.map(e => (
              <ArchivKartya key={e.id} event={e} token={token} onSaved={fetchArchivedEvents} />
            ))}
          </div>
        )}
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
                  <button onClick={() => handleDecline(a)}
                    className="flex-1 border border-red-400 text-red-300 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-400 hover:text-white transition-all">
                    Elutasít
                  </button>
                  <button onClick={() => handleAccept(a)}
                    className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all">
                    Elfogad
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* IDÖ tagok */}
          <div>
            <p className="text-white font-bold mb-3">IDÖ tagok</p>
            {membersLoading ? (
              <p className="text-white/60 text-sm">Betöltés...</p>
            ) : members.length === 0 ? (
              <EmptyState message="Még nincs IDÖ tag." />
            ) : members.map(m => (
              <div key={m.id} className="bg-white/10 rounded-xl px-4 py-3 mb-2">
                <p className="text-white font-semibold">{m.name}</p>
                <p className="text-white/60 text-sm">{m.class_number}.{m.class_letter} · {m.email}</p>
              </div>
            ))}
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

        <button onClick={() => setActivePanel('esemenyek')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300">
          <div className="text-3xl mb-3">📅</div>
          <p className="text-white font-black text-lg">Események</p>
          <p className="text-white/60 text-sm mt-1">Új esemény + folyamatban lévők kezelése</p>
          {events.length > 0 && (
            <span className="mt-3 inline-block bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
              {events.length} aktív
            </span>
          )}
        </button>

        <button
          onClick={() => { setActivePanel('archivum'); fetchArchivedEvents() }}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300">
          <div className="text-3xl mb-3">📁</div>
          <p className="text-white font-black text-lg">Archívum</p>
          <p className="text-white/60 text-sm mt-1">Lezárt események és pénzügyek</p>
        </button>

        <button onClick={() => setActivePanel('staff')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300 relative">
          {pendingCount > 0 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
          <div className="text-3xl mb-3">👥</div>
          <p className="text-white font-black text-lg">Staff</p>
          <p className="text-white/60 text-sm mt-1">Tagok és csatlakozási kérelmek</p>
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

  const fetchApplication = async () => {
    setApplicationLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${user?.id}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (response.status === 404) {
      setApplication(null)
    } else {
      setApplication(await response.json())
    }
    setApplicationLoading(false)
  }

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
    if (user?.role === 'admin') router.push('/admin')
    if (!user) router.push('/login')
  }, [user])

  if (user?.role === 'admin') return null
  if (!user) return null

  const handleApply = async (motivacio: string, tapasztalat: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ido_applys_users_id: user?.id, motivation: motivacio, experince: tapasztalat }),
    })
    if (!response.ok) { alert('Hiba történt a jelentkezés során!'); return }
    setCsatlakozasModal(false)
    await fetchApplication()
  }

  const renderIDOPanel = () => {
    if (isElnok) return <ElnokDashboard token={token} userId={user?.id} />

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
          <button onClick={() => setCsatlakozasModal(true)}
            className="border-2 border-white text-white px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-[#6034e3] transition-all duration-300">
            Csatlakozás
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-6">
      {csatlakozasModal && (
        <CsatlakozasModal onClose={() => setCsatlakozasModal(false)} onSubmit={handleApply} />
      )}

      <div className="max-w-5xl mx-auto">

        {/* Fejléc */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#6034e3]">Irányítópult</h1>
            <p className="text-gray-500 mt-1">Üdv, <span className="font-semibold text-[#171717]">{profileData?.fullName ?? 'Vendég'}</span>!</p>
          </div>
          {isIDO && !isElnok && (
            <button onClick={() => setView(view === 'staff' ? 'compact' : 'staff')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 border-2
                ${view === 'staff' ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-[#6034e3] text-[#6034e3]'}`}>
              Staff felület
            </button>
          )}
        </div>

        {/* Compact view */}
        {view === 'compact' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#171717] mb-4">Legutóbbi 3 értékelésem</h2>
              {/* TODO: bekötni — GET /api/ertekeles endpoint kész után */}
              <p className="text-gray-400 text-sm">Még nincs értékelés.</p>
              <button onClick={() => setView('reviews')}
                className="mt-4 border-2 border-[#6034e3] text-[#6034e3] px-4 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all duration-300 w-full">
                Több
              </button>
            </div>
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
            {/* TODO: bekötni — GET /api/ertekeles/{userId} endpoint kész után */}
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