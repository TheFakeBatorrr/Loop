'use client'

import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'

type EventStatus = 'draft' | 'staff_gathering' | 'pending_review' | 'published' | 'ended'
type EventType = 'external' | 'school_ido' | 'ido_only' | 'ido_school'

type Event = {
    id: number
    type: EventType
    topic: string
    target_group: string
    date: string
    location: string
    max_capacity: number
    status: EventStatus
    visibility: 'public' | 'ido_only'
    created_by: string
}

const fakeEvents: Event[] = [
    { id: 1, type: 'ido_school', topic: 'Gólyabál 2025', target_group: 'Minden diák', date: '2025.09.20', location: 'Tornaterem', max_capacity: 300, status: 'pending_review', visibility: 'public', created_by: 'IDÖ Elnök' },
    { id: 2, type: 'school_ido', topic: 'Nyílt nap', target_group: 'Érdeklődők', date: '2025.10.05', location: 'Iskola', max_capacity: 100, status: 'staff_gathering', visibility: 'public', created_by: 'Admin' },
    { id: 3, type: 'external', topic: 'Pályaorientációs előadás', target_group: '11-12. évfolyam', date: '2025.10.12', location: 'Aula', max_capacity: 150, status: 'draft', visibility: 'public', created_by: 'Admin' },
    { id: 4, type: 'ido_only', topic: 'Csapatépítő', target_group: 'IDÖ tagok', date: '2025.10.18', location: 'Városliget', max_capacity: 30, status: 'published', visibility: 'ido_only', created_by: 'IDÖ Elnök' },
    { id: 5, type: 'ido_school', topic: 'Karácsonyi műsor', target_group: 'Minden diák', date: '2025.12.18', location: 'Aula', max_capacity: 400, status: 'ended', visibility: 'public', created_by: 'IDÖ Elnök' },
]

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

function UjEsemenyModal({ onClose }: { onClose: () => void }) {
    const [topic, setTopic] = useState('')
    const [type, setType] = useState<EventType>('external')
    const [targetGroup, setTargetGroup] = useState('')
    const [date, setDate] = useState('')
    const [location, setLocation] = useState('')
    const [maxCapacity, setMaxCapacity] = useState('')
    const [visibility, setVisibility] = useState<'public' | 'ido_only'>('public')

    const canSubmit = topic !== '' && targetGroup !== '' && date !== '' && location !== '' && maxCapacity !== ''

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-[#6034e3] mb-6">Új esemény létrehozása</h2>
                <div className="flex flex-col gap-4">

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Téma</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="pl. Gólyabál 2025"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Típus</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as EventType)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm"
                        >
                            <option value="external">Iskolai előadás</option>
                            <option value="school_ido">Iskolai szervezésű az IDÖ részvétel</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Célcsoport</label>
                        <input
                            type="text"
                            value={targetGroup}
                            onChange={e => setTargetGroup(e.target.value)}
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
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all
                            ${canSubmit ? 'bg-[#6034e3] text-white hover:bg-[#8643eb]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        disabled={!canSubmit}
                    >
                        Létrehozás
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [ujEsemenyModal, setUjEsemenyModal] = useState(false)
    const [events, setEvents] = useState<Event[]>(fakeEvents)

    // INNEN SZEDJEM MAJD KI A KOMMENTET
    // useEffect(() => {
    //   if (user?.role !== 'Admin') router.push('/main')
    // }, [user])

    const pendingEvents = events.filter(e => e.status === 'pending_review')
    const activeEvents = events.filter(e => e.status !== 'ended')
    const endedEvents = events.filter(e => e.status === 'ended')

    const handleApprove = (id: number) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'published' } : e))
    }

    const handleReject = (id: number) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'draft' } : e))
    }

    return (
        <main className="min-h-screen bg-[#fafafa] py-10 px-6">
            {ujEsemenyModal && <UjEsemenyModal onClose={() => setUjEsemenyModal(false)} />}

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
                </div>

                {/* Jóváhagyásra váró események */}
                <SectionBox
                    title="Jóváhagyásra váró események"
                    subtitle={`${pendingEvents.length} esemény vár jóváhagyásra`}
                >
                    {pendingEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs jóváhagyásra váró esemény.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {pendingEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-[#171717]">{e.topic}</p>
                                        <p className="text-gray-400 text-sm">{e.date} · {e.location} · {typeLabel[e.type]}</p>
                                        <p className="text-gray-400 text-sm">Létrehozta: {e.created_by}</p>
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

                {/* Összes aktív esemény */}
                <SectionBox
                    title="Aktív események"
                    subtitle="Minden folyamatban lévő esemény és azok státusza"
                >
                    <div className="flex flex-col gap-3">
                        {activeEvents.map(e => (
                            <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex flex-col gap-1">
                                    <p className="font-bold text-[#171717]">{e.topic}</p>
                                    <p className="text-gray-400 text-sm">{e.date} · {e.location} · {typeLabel[e.type]}</p>
                                    <p className="text-gray-400 text-sm">Létrehozta: {e.created_by}</p>
                                </div>
                                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${statusColor[e.status]}`}>
                                    {statusLabel[e.status]}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionBox>

                {/*Elnöki pozíció felület*/}
                <SectionBox
                    title="Elnök"
                    subtitle="Elnöki pozíció átadáasa"
                >
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-xl p-4">
                            <p className="text-sm font-semibold">Jelenlegi elnök:</p>
                            <p className="text-yellow-600 text-sm mt-1">!!ELNÖK NEVE!!</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <select name="" id="">
                                <option value=""></option>
                            </select>
                            <button className="flex-1 min-w-[200px] border-2 border-[#6034e3] text-[#6034e3] py-3 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all">
                                Pozíció átadása
                            </button>
                        </div>
                    </div>
                </SectionBox>


                {/* Év végi műveletek */}
                <SectionBox
                    title="Év végi műveletek"
                    subtitle="Évfolyam bump és végzős diákok törlése — csak tanév végén futtasd!"
                >
                    <div className="flex flex-col gap-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-yellow-700 text-sm font-semibold">⚠️ Figyelem</p>
                            <p className="text-yellow-600 text-sm mt-1">Ezek a műveletek visszafordíthatatlanok. Csak tanév végén használd!</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button className="flex-1 min-w-[200px] border-2 border-[#6034e3] text-[#6034e3] py-3 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all">
                                Évfolyam bump (+1 év minden diáknak)
                            </button>
                            <button className="flex-1 min-w-[200px] border-2 border-red-400 text-red-400 py-3 rounded-xl font-semibold hover:bg-red-400 hover:text-white transition-all">
                                Végzősök törlése (12-13. évfolyam)
                            </button>
                        </div>
                    </div>
                </SectionBox>

                {/* Lezárt események */}
                <SectionBox
                    title="Lezárt események"
                    subtitle="Már véget ért események archívuma"
                >
                    {endedEvents.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nincs lezárt esemény.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {endedEvents.map(e => (
                                <div key={e.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap opacity-60">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-[#171717]">{e.topic}</p>
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