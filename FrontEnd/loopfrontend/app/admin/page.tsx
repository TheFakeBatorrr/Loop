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

function UjEsemenyModal({ onClose, onCreated, token, userId }: {
    onClose: () => void
    onCreated: () => void
    token: string | null
    userId: number | undefined
}) {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                topic,
                type,
                target_audience: targetAudience,
                date,
                location,
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
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="pl. Gólyabál 2025"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Téma</label>
                        <select
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        >
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
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as EventType)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        >
                            <option value="external">Külsős</option>
                            <option value="school_ido">Sulis + IDÖ</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Célcsoport</label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={e => setTargetAudience(e.target.value)}
                            placeholder="pl. Minden diák / 11-12. évfolyam"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-gray-600 mb-1 block">Dátum</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-gray-600 mb-1 block">Max létszám</label>
                            <input
                                type="number"
                                value={maxCapacity}
                                onChange={e => setMaxCapacity(e.target.value)}
                                placeholder="pl. 200"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Helyszín</label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="pl. Tornaterem / Aula"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all"
                    >
                        Mégse
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || loading}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all
                            ${canSubmit && !loading ? 'bg-[#6034e3] text-white hover:bg-[#8643eb]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {loading ? 'Létrehozás...' : 'Létrehozás'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export default function AdminDashboard() {
    const { user, token, logout } = useAuth()
    const router = useRouter()

    const [ujEsemenyModal, setUjEsemenyModal] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [eventsLoading, setEventsLoading] = useState(true)

    // TODO: elnök lekérése — GET /api/user?role=President vagy /api/getPresident endpoint kész után
    // const [president, setPresident] = useState<{ id: number, name: string } | null>(null)

    // TODO: IDÖ tagok lekérése az elnök átadáshoz — GET /api/members kész után
    // const [members, setMembers] = useState<Member[]>([])

    const [selectedNewPresident, setSelectedNewPresident] = useState<string>('')

    // Auth guard
    useEffect(() => {
        if (user && user.role !== 'Admin') router.push('/dashboard')
    }, [user])

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setEventsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        })
        if (response.ok) {
            const data = await response.json()
            setEvents(data)
        }
        setEventsLoading(false)
    }

    const handleApprove = async (id: number) => {
        // TODO: bekötni — PATCH /api/esemeny/{id} status update endpoint kész után
        console.log('approve', id)
    }

    const handleReject = async (id: number) => {
        // TODO: bekötni — PATCH /api/esemeny/{id} status update endpoint kész után
        console.log('reject', id)
    }

    const handlePresidentTransfer = async () => {
        // TODO: bekötni — PATCH /api/user/{id} role update endpoint kész után
        console.log('új elnök:', selectedNewPresident)
    }

    if (!user) return null

    const pendingEvents = events.filter(e => e.status === 'pending_review')
    const activeEvents = events.filter(e => e.status !== 'ended')
    const endedEvents = events.filter(e => e.status === 'ended')

    return (
        <main className="min-h-screen bg-[#fafafa] py-10 px-6">
            {ujEsemenyModal && (
                <UjEsemenyModal
                    onClose={() => setUjEsemenyModal(false)}
                    onCreated={fetchEvents}
                    token={token}
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
                    <button
                        onClick={() => setUjEsemenyModal(true)}
                        className="bg-[#6034e3] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-all"
                    >
                        + Új esemény
                    </button>
                    <button
                        onClick={() => { logout(); router.push('/login') }}
                        className="border-2 border-red-400 text-red-400 px-5 py-3 rounded-xl font-semibold hover:bg-red-400 hover:text-white transition-all"
                    >
                        Kijelentkezés
                    </button>
                </div>

                {/* Jóváhagyásra váró események */}
                <SectionBox
                    title="Jóváhagyásra váró események ✅"
                    subtitle={`${pendingEvents.length} esemény vár jóváhagyásra`}
                >
                    {eventsLoading ? (
                        <p className="text-gray-400 text-sm">Betöltés...</p>
                    ) : pendingEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs jóváhagyásra váró esemény.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {pendingEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-[#171717]">{e.name}</p>
                                        <p className="text-gray-500 text-sm">{e.topic}</p>
                                        <p className="text-gray-400 text-sm">{e.date} · {e.location} · {typeLabel[e.type]}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReject(e.id)}
                                            className="border-2 border-red-400 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-400 hover:text-white transition-all"
                                        >
                                            Elutasít
                                        </button>
                                        <button
                                            onClick={() => handleApprove(e.id)}
                                            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-all"
                                        >
                                            Jóváhagy
                                        </button>
                                    </div>
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

                        {/* Jelenlegi elnök */}
                        <div className="bg-[#6034e3]/5 border border-[#6034e3]/20 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Jelenlegi elnök</p>
                            {/* TODO: president state bekötése — /api/getPresident vagy /api/user?role=President után */}
                            <p className="text-[#6034e3] font-black text-lg">Nincs elnök kiválasztva</p>
                            <p className="text-gray-400 text-xs mt-1">Az elnök lekérése még nincs bekötve.</p>
                        </div>

                        {/* Új elnök kiválasztása */}
                        <div>
                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Új elnök kiválasztása</label>
                            <select
                                value={selectedNewPresident}
                                onChange={e => setSelectedNewPresident(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                            >
                                <option value="">— Válassz IDÖ tagot —</option>
                                {/* TODO: members.map() ide — GET /api/members bekötése után */}
                                {/* {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} — {m.class_number}.{m.class_letter}</option>
                                ))} */}
                            </select>
                            <p className="text-gray-400 text-xs mt-1">Csak jelenlegi IDÖ tagok jelennek meg a listában.</p>
                        </div>

                        <button
                            onClick={handlePresidentTransfer}
                            disabled={!selectedNewPresident}
                            className={`w-full py-3 rounded-xl font-semibold transition-all border-2
                                ${selectedNewPresident
                                    ? 'border-[#6034e3] text-[#6034e3] hover:bg-[#6034e3] hover:text-white'
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Pozíció átadása
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
                            <button
                                // TODO: bekötni — év végi bump endpoint kész után
                                className="flex-1 min-w-50 border-2 border-[#6034e3] text-[#6034e3] py-3 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all"
                            >
                                Évfolyam bump (+1 év minden diáknak)
                            </button>
                            <button
                                // TODO: bekötni — végzős törlés endpoint kész után
                                className="flex-1 min-w-50 border-2 border-red-400 text-red-400 py-3 rounded-xl font-semibold hover:bg-red-400 hover:text-white transition-all"
                            >
                                Végzősök törlése (12-13. évfolyam)
                            </button>
                        </div>
                    </div>
                </SectionBox>

                {/* Lezárt események */}
                <SectionBox
                    title="Lezárt események 🛑"
                    subtitle="Már véget ért események archívuma"
                >
                    {eventsLoading ? (
                        <p className="text-gray-400 text-sm">Betöltés...</p>
                    ) : endedEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs lezárt esemény.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {endedEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap opacity-60">
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

            </div>
        </main>
    )
}