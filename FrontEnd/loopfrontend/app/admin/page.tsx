'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'

// ============================================================
// TÍPUSOK
// ============================================================

type EventStatus = 'draft' | 'staff_gathering' | 'pending_review' | 'published' | 'ended'
type EventType = 'external' | 'school_ido' | 'ido_only' | 'ido_school'

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

// Archív esemény — joined events + ido_events + avg_rating
// GET /api/esemeny/archivum
type ArchivedEvent = {
    id: number
    name: string
    type: EventType
    topic: string
    date: string
    location: string
    max_capacity: number
    target_audience: string
    ido_event_id: number | null
    revenue: string | null
    expanses: string | null
    main_organizer_id: number | null
    avg_rating: number | null
    review_count: number
}

type Member = {
    id: number
    email: string
    name: string
    class_number: number
    class_letter: string
}

type President = {
    id: number
    role: string
    email: string
    name: string
    class_number: number
    class_letter: string
}

// ============================================================
// SEGÉDEK
// ============================================================

const statusLabel: Record<EventStatus, string> = {
    draft: 'Tervezet',
    staff_gathering: 'Staff gyűjtés',
    pending_review: 'Jóváhagyásra vár',
    published: 'Publikált',
    ended: 'Lezárt',
}

const statusColor: Record<EventStatus, string> = {
    draft: 'bg-gray-100 text-gray-500',
    staff_gathering: 'bg-blue-100 text-blue-600',
    pending_review: 'bg-yellow-100 text-yellow-600',
    published: 'bg-green-100 text-green-600',
    ended: 'bg-red-100 text-red-500',
}

const typeLabel: Record<EventType, string> = {
    external: 'Külsős',
    school_ido: 'Sulis + IDÖ',
    ido_only: 'Csak IDÖ',
    ido_school: 'IDÖ + Sulis',
}

// ============================================================
// SECTION BOX
// ============================================================

function SectionBox({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
    return (
        <div className="border-2 border-[#6034e3] rounded-2xl overflow-hidden">
            <div className="bg-[#6034e3] px-6 py-4">
                <h2 className="text-white text-lg font-black">{title}</h2>
                <p className="text-white/70 text-sm mt-1">{subtitle}</p>
            </div>
            <div className="p-6 bg-white">
                {children}
            </div>
        </div>
    )
}

// ============================================================
// ÚJ ESEMÉNY MODAL
// ============================================================

function UjEsemenyModal({ onClose, onCreated, userId }: {
    onClose: () => void
    onCreated: () => void
    userId: number | undefined
}) {
    const { authFetch } = useAuth()

    const [name, setName] = useState('')
    const [topic, setTopic] = useState('')
    const [type, setType] = useState<EventType>('external')
    const [targetAudience, setTargetAudience] = useState('')
    const [date, setDate] = useState('')
    const [location, setLocation] = useState('')
    const [maxCapacity, setMaxCapacity] = useState('')
    const [visibility, setVisibility] = useState<'public' | 'ido_only'>('public')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canSubmit = name !== '' && topic !== '' && targetAudience !== '' && date !== '' && location !== '' && maxCapacity !== ''

    const handleSubmit = async () => {
        if (!canSubmit) return
        setLoading(true)
        setError(null)

        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        if (!response.ok) {
            setError('Hiba történt az esemény létrehozásakor.')
            setLoading(false)
            return
        }

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
                            <option value="Ismeretterjesztő">Ismeretterjesztő</option>
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
                        <select value={type} onChange={e => setType(e.target.value as EventType)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
                            <option value="external">Külsős</option>
                            <option value="school_ido">Sulis + IDÖ</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Célcsoport</label>
                        <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
                            <option value="">— Válassz célcsoportot —</option>
                            <option value="Minden diák">Minden diák</option>
                            <option value="9. évfolyam">9. évfolyam</option>
                            <option value="10. évfolyam">10. évfolyam</option>
                            <option value="11. évfolyam">11. évfolyam</option>
                            <option value="12. évfolyam">12. évfolyam</option>
                            <option value="13. évfolyam">13. évfolyam</option>
                            <option value="Info tech">Info tech</option>
                            <option value="Gazd tech">Gazd tech</option>
                            <option value="Reál">Reál</option>
                            <option value="Humán">Humán</option>
                            <option value="Kéttannyelvű">Kéttannyelvű</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-gray-600 mb-1 block">Dátum</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-gray-600 mb-1 block">Max létszám</label>
                            <input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} placeholder="pl. 200"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Helyszín</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="pl. Tornaterem / Aula"
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
// ARCHÍV KÁRTYA (admin POV — bevétel/kiadás + avg rating)
// ============================================================

function ArchivKartya({ event, onSaved }: {
    event: ArchivedEvent
    onSaved: () => void
}) {
    const { authFetch } = useAuth()

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
            const response = await authFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events/${event.ido_event_id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ revenue, expanses }),
                }
            )
            if (!response.ok) { setError('Hiba történt a mentés során.'); setLoading(false); return }
        } else {
            // Még nincs ido_events sor — POST /api/ido-events
            // TODO: main_organizer_id bekötése ha az elnök kiválasztja a főszervezőt
            const response = await authFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-all">
                <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-[#171717]">{event.name}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">{typeLabel[event.type]}</span>
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-gray-400 text-xs">{event.date}</span>
                        {event.avg_rating !== null && (
                            <>
                                <span className="text-gray-300 text-xs">·</span>
                                <span className="text-yellow-500 text-xs font-semibold">★ {Number(event.avg_rating).toFixed(1)} ({event.review_count})</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!hasIdoData && (
                        <span className="bg-orange-100 text-orange-500 text-xs px-2 py-1 rounded-full font-semibold">Hiányos</span>
                    )}
                    <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
                </div>
            </button>

            {open && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Téma</p>
                            <p className="text-[#171717]">{event.topic}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Célcsoport</p>
                            <p className="text-[#171717]">{event.target_audience}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Helyszín</p>
                            <p className="text-[#171717]">{event.location}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Max férőhely</p>
                            <p className="text-[#171717]">{event.max_capacity} fő</p>
                        </div>
                    </div>

                    {/* Pénzügyi szekció */}
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[#171717] text-sm font-semibold">Pénzügyek</p>
                            {!editing && (
                                <button onClick={() => setEditing(true)}
                                    className="text-[#6034e3] text-xs font-semibold hover:underline transition-all">
                                    ✏️ Szerkesztés
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div className="flex flex-col gap-2">
                                {error && <p className="text-red-500 text-xs">{error}</p>}
                                <div>
                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Bevétel</label>
                                    <input type="text" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="pl. 50000"
                                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6034e3] transition-all" />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Kiadás</label>
                                    <input type="text" value={expanses} onChange={e => setExpanses(e.target.value)} placeholder="pl. 30000"
                                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6034e3] transition-all" />
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => { setEditing(false); setError(null) }}
                                        className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-sm font-semibold hover:border-gray-300 transition-all">
                                        Mégse
                                    </button>
                                    <button onClick={handleSave} disabled={loading}
                                        className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all
                                            ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#6034e3] text-white hover:bg-[#8643eb]'}`}>
                                        {loading ? 'Mentés...' : 'Mentés'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Bevétel</p>
                                    <p className="text-[#171717] font-semibold">{event.revenue ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Kiadás</p>
                                    <p className="text-[#171717] font-semibold">{event.expanses ?? '—'}</p>
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
// ADMIN DASHBOARD
// ============================================================

export default function AdminDashboard() {
    // FONTOS: az admin role értéke "Admin" (nagy A) a DB-ben
    const { user, logout, authFetch } = useAuth()
    const router = useRouter()

    const [ujEsemenyModal, setUjEsemenyModal] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [eventsLoading, setEventsLoading] = useState(true)

    // Archív események — GET /api/esemeny/archivum
    const [archivedEvents, setArchivedEvents] = useState<ArchivedEvent[]>([])
    const [archivedLoading, setArchivedLoading] = useState(false)
    const [archivedOpen, setArchivedOpen] = useState(false)

    // Jelenlegi elnök — GET /api/user/getpresident
    const [president, setPresident] = useState<President | null>(null)
    const [presidentLoading, setPresidentLoading] = useState(true)

    // IDÖ tagok az elnök átadáshoz — GET /api/user/members
    const [members, setMembers] = useState<Member[]>([])
    const [membersLoading, setMembersLoading] = useState(true)

    const [selectedNewPresident, setSelectedNewPresident] = useState<string>('')
    const [presidentTransferLoading, setPresidentTransferLoading] = useState(false)

    // Auth guard — role értéke "Admin" (nagy A)
    useEffect(() => {
        if (user && user.role !== 'Admin') router.push('/dashboard')
    }, [user])

    useEffect(() => {
        fetchEvents()
        fetchPresident()
        fetchMembers()
    }, [])

    const fetchEvents = async () => {
        setEventsLoading(true)
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`)
        if (response.ok) setEvents(await response.json())
        setEventsLoading(false)
    }

    const fetchArchivedEvents = async () => {
        setArchivedLoading(true)
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/archivum`)
        if (response.ok) setArchivedEvents(await response.json())
        setArchivedLoading(false)
    }

    const fetchPresident = async () => {
        setPresidentLoading(true)
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/getpresident`)
        if (response.ok) {
            const data = await response.json()
            setPresident(data[0] ?? null)
        }
        setPresidentLoading(false)
    }

    const fetchMembers = async () => {
        setMembersLoading(true)
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/members`)
        if (response.ok) setMembers(await response.json())
        setMembersLoading(false)
    }

    // next-status hívás — external: draft→published, ido_school/school_ido: pending_review→published
    const handleApprove = async (id: number) => {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/${id}/next-status`, {
            method: 'PATCH',
        })
        if (!response.ok) { alert('Hiba történt a jóváhagyás során!'); return }
        await fetchEvents()
    }

    const handleReject = async (id: number) => {
        // TODO: visszaállítás draft-ra — PATCH /api/esemeny/{id}/reject-status endpoint kész után
        console.log('reject', id)
    }

    const handlePresidentTransfer = async () => {
        if (!selectedNewPresident) return
        setPresidentTransferLoading(true)
        const response = await authFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/newpresident/${selectedNewPresident}`,
            { method: 'PUT' }
        )
        if (!response.ok) { alert('Hiba történt az elnök átadása során!'); setPresidentTransferLoading(false); return }
        setSelectedNewPresident('')
        await fetchPresident()
        await fetchMembers()
        setPresidentTransferLoading(false)
    }

    if (!user) return null

    // Szűrők
    // external eventeknek nincs pending_review lépése — draft→published közvetlenül
    const draftExternalEvents = events.filter(e => e.type === 'external' && e.status === 'draft')
    const pendingEvents = events.filter(e => e.status === 'pending_review')
    const activeEvents = events.filter(e => e.status !== 'ended')
    const endedEvents = events.filter(e => e.status === 'ended')

    return (
        <main className="min-h-screen bg-[#fafafa] py-10 px-6">
            {ujEsemenyModal && (
                <UjEsemenyModal
                    onClose={() => setUjEsemenyModal(false)}
                    onCreated={fetchEvents}
                    userId={user?.id}
                />
            )}

            <div className="max-w-5xl mx-auto flex flex-col gap-8">

                {/* Fejléc */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#6034e3]">Admin Panel</h1>
                        <p className="text-gray-500 mt-1">Eseménykezelés és rendszerműveletek</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setUjEsemenyModal(true)}
                            className="bg-[#6034e3] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-all">
                            + Új esemény
                        </button>
                        <button onClick={() => { logout(); router.push('/login') }}
                            className="border-2 border-red-400 text-red-400 px-5 py-3 rounded-xl font-semibold hover:bg-red-400 hover:text-white transition-all">
                            Kijelentkezés
                        </button>
                    </div>
                </div>

                {/* Jóváhagyásra váró események */}
                <SectionBox
                    title="Jóváhagyásra váró események ✅"
                    subtitle={`${pendingEvents.length + draftExternalEvents.length} esemény vár jóváhagyásra`}
                >
                    {eventsLoading ? (
                        <p className="text-gray-400 text-sm">Betöltés...</p>
                    ) : pendingEvents.length === 0 && draftExternalEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs jóváhagyásra váró esemény.</p>
                    ) : (
                        <div className="flex flex-col gap-4">

                            {/* IDÖ által szervezett — pending_review státuszú események */}
                            {pendingEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-[#171717]">{e.name}</p>
                                        <p className="text-gray-500 text-sm">{e.topic}</p>
                                        <p className="text-gray-400 text-sm">{e.date} · {e.location} · {typeLabel[e.type]}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleReject(e.id)}
                                            className="border-2 border-red-400 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-400 hover:text-white transition-all">
                                            Elutasít
                                        </button>
                                        <button onClick={() => handleApprove(e.id)}
                                            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-all">
                                            Jóváhagy
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Külsős (external) események — draft státuszból közvetlenül publikálhatók */}
                            {draftExternalEvents.length > 0 && pendingEvents.length > 0 && (
                                <div className="border-t border-gray-100 pt-4" />
                            )}
                            {draftExternalEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-[#171717]">{e.name}</p>
                                        <p className="text-gray-500 text-sm">{e.topic}</p>
                                        <p className="text-gray-400 text-sm">{e.date} · {e.location} · {typeLabel[e.type]}</p>
                                    </div>
                                    <button onClick={() => handleApprove(e.id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-all">
                                        Publikálás
                                    </button>
                                </div>
                            ))}

                        </div>
                    )}
                </SectionBox>

                {/* Aktív események */}
                <SectionBox
                    title="Aktív események ⏱️"
                    subtitle="Minden folyamatban lévő esemény és azok státusza"
                >
                    {eventsLoading ? (
                        <p className="text-gray-400 text-sm">Betöltés...</p>
                    ) : activeEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs aktív esemény.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {activeEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-[#171717]">{e.name}</p>
                                        <p className="text-gray-500 text-sm">{e.topic}</p>
                                        <p className="text-gray-400 text-sm">{e.date} · {e.location} · {typeLabel[e.type]}</p>
                                    </div>
                                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${statusColor[e.status]}`}>
                                        {statusLabel[e.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionBox>

                {/* Elnök pozíció átadás */}
                <SectionBox
                    title="Elnöki pozíció 👑"
                    subtitle="Elnöki szerepkör átadása IDÖ tagnak"
                >
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#6034e3]/5 border border-[#6034e3]/20 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Jelenlegi elnök</p>
                            {presidentLoading ? (
                                <p className="text-gray-400 text-sm">Betöltés...</p>
                            ) : president ? (
                                <>
                                    <p className="text-[#6034e3] font-black text-lg">{president.name}</p>
                                    <p className="text-gray-400 text-xs mt-1">{president.class_number}.{president.class_letter} · {president.email}</p>
                                </>
                            ) : (
                                <p className="text-gray-400 text-sm">Jelenleg nincs elnök.</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Új elnök kiválasztása</label>
                            <select value={selectedNewPresident} onChange={e => setSelectedNewPresident(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
                                <option value="">— Válassz IDÖ tagot —</option>
                                {membersLoading ? (
                                    <option disabled>Betöltés...</option>
                                ) : members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} — {m.class_number}.{m.class_letter}</option>
                                ))}
                            </select>
                            <p className="text-gray-400 text-xs mt-1">Csak jelenlegi IDÖ tagok jelennek meg a listában.</p>
                        </div>

                        <button onClick={handlePresidentTransfer}
                            disabled={!selectedNewPresident || presidentTransferLoading}
                            className={`w-full py-3 rounded-xl font-semibold transition-all border-2
                                ${selectedNewPresident && !presidentTransferLoading
                                    ? 'border-[#6034e3] text-[#6034e3] hover:bg-[#6034e3] hover:text-white'
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}>
                            {presidentTransferLoading ? 'Átadás...' : 'Pozíció átadása'}
                        </button>
                    </div>
                </SectionBox>

                {/* Év végi műveletek */}
                <SectionBox
                    title="Év végi műveletek ⌛"
                    subtitle="Évfolyam bump és végzős diákok törlése — csak tanév végén futtasd!"
                >
                    <div className="flex flex-col gap-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-yellow-700 text-sm font-semibold">⚠️ Figyelem</p>
                            <p className="text-yellow-600 text-sm mt-1">Ezek a műveletek visszafordíthatatlanok. Csak tanév végén használd!</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {/* TODO: bekötni — év végi bump endpoint kész után */}
                            <button className="flex-1 min-w-50 border-2 border-[#6034e3] text-[#6034e3] py-3 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all">
                                Évfolyam bump (+1 év minden diáknak)
                            </button>
                            {/* TODO: bekötni — végzős törlés endpoint kész után */}
                            <button className="flex-1 min-w-50 border-2 border-red-400 text-red-400 py-3 rounded-xl font-semibold hover:bg-red-400 hover:text-white transition-all">
                                Végzősök törlése (12-13. évfolyam)
                            </button>
                        </div>
                    </div>
                </SectionBox>

                {/* Lezárt események — archívum */}
                <SectionBox
                    title="Lezárt események 🛑"
                    subtitle="Már véget ért események archívuma és pénzügyi adatok"
                >
                    {eventsLoading ? (
                        <p className="text-gray-400 text-sm">Betöltés...</p>
                    ) : endedEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs lezárt esemény.</p>
                    ) : !archivedOpen ? (
                        <button
                            onClick={() => { setArchivedOpen(true); fetchArchivedEvents() }}
                            className="border-2 border-[#6034e3] text-[#6034e3] px-4 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all text-sm">
                            Archívum megnyitása ({endedEvents.length} esemény)
                        </button>
                    ) : archivedLoading ? (
                        <p className="text-gray-400 text-sm">Betöltés...</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {archivedEvents.map(e => (
                                <ArchivKartya key={e.id} event={e} onSaved={fetchArchivedEvents} />
                            ))}
                        </div>
                    )}
                </SectionBox>

            </div>
        </main>
    )
}