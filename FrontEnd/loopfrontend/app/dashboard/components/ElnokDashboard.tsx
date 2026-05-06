'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import UjEsemenyModal from './UjEsemenyModal'
import EsemenyKartya from './EsemenyKartya'
import PublikaltKartya from './PublikaltKartya'
import ArchivKartya from './ArchivKartya'
import type { Application, Member, Event, ArchivedEvent, ElnokPanel } from './types'

type Props = { userId: number | undefined }

export default function ElnokDashboard({ userId }: Props) {
  const { authFetch } = useAuth()
  const [activePanel, setActivePanel] = useState<ElnokPanel>(null)
  const [ujEsemenyModal, setUjEsemenyModal] = useState(false)

  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [publishedEvents, setPublishedEvents] = useState<Event[]>([])
  const [archivedEvents, setArchivedEvents] = useState<ArchivedEvent[]>([])
  const [archivedLoading, setArchivedLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
    fetchMembers()
    fetchEvents()
    fetchPublishedEvents()
  }, [])

  const fetchApplications = async () => {
    setApplicationsLoading(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application/pending`)
    if (response.ok) setApplications(await response.json())
    setApplicationsLoading(false)
  }

  const fetchMembers = async () => {
    setMembersLoading(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/members`)
    if (response.ok) setMembers(await response.json())
    setMembersLoading(false)
  }

  const fetchEvents = async () => {
    setEventsLoading(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/elnok`)
    if (response.ok) setEvents(await response.json())
    setEventsLoading(false)
  }

  const fetchPublishedEvents = async () => {
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`)
    if (response.ok) {
      const data: Event[] = await response.json()
      setPublishedEvents(data.filter(e => e.status === 'published' && e.type !== 'external'))
    }
  }

  const fetchArchivedEvents = async () => {
    setArchivedLoading(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/archivum`)
    if (response.ok) setArchivedEvents(await response.json())
    setArchivedLoading(false)
  }

  const handleAccept = async (application: Application) => {
    const response = await authFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${application.id}/accept`,
      { method: 'PATCH' }
    )
    if (!response.ok) { alert('Hiba történt az elfogadás során!'); return }
    await fetchApplications()
    await fetchMembers()
  }

  const handleDecline = async (application: Application) => {
    const response = await authFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/application/${application.id}/reject`,
      { method: 'PATCH' }
    )
    if (!response.ok) { alert('Hiba történt az elutasítás során!'); return }
    await fetchApplications()
  }

  const pendingCount = applications.length

  if (activePanel === 'esemenyek') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        {ujEsemenyModal && (
          <UjEsemenyModal onClose={() => setUjEsemenyModal(false)} onCreated={fetchEvents} userId={userId} />
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-black">Események</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>
        <button onClick={() => setUjEsemenyModal(true)}
          className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-[#6034e3] transition-all duration-300 w-full mb-5">
          + Új esemény létrehozása
        </button>
        <div className="mb-5">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">Folyamatban lévő eseményeid</p>
          {eventsLoading ? (
            <p className="text-white/60 text-sm">Betöltés...</p>
          ) : events.length === 0 ? (
            <p className="text-white/60 text-sm">Még nincs folyamatban lévő esemény.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map(e => <EsemenyKartya key={e.id} event={e} onStatusUpdate={fetchEvents} />)}
            </div>
          )}
        </div>
        {publishedEvents.length > 0 && (
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">Aktív / publikált események</p>
            <div className="flex flex-col gap-2">
              {publishedEvents.map(e => <PublikaltKartya key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    )
  }

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
          <p className="text-white/60 text-sm">Még nincs lezárt esemény.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {archivedEvents.map(e => <ArchivKartya key={e.id} event={e} onSaved={fetchArchivedEvents} />)}
          </div>
        )}
      </div>
    )
  }

  if (activePanel === 'staff') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-black">Staff</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-white font-bold">Csatlakozási kérelmek</p>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{pendingCount}</span>
              )}
            </div>
            {applicationsLoading ? (
              <p className="text-white/60 text-sm">Betöltés...</p>
            ) : applications.length === 0 ? (
              <p className="text-white/60 text-sm">Nincs függő kérelem.</p>
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
          <div>
            <p className="text-white font-bold mb-3">IDÖ tagok</p>
            {membersLoading ? (
              <p className="text-white/60 text-sm">Betöltés...</p>
            ) : members.length === 0 ? (
              <p className="text-white/60 text-sm">Még nincs IDÖ tag.</p>
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
            <span className="mt-3 inline-block bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">{events.length} aktív</span>
          )}
        </button>
        <button onClick={() => { setActivePanel('archivum'); fetchArchivedEvents() }}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300">
          <div className="text-3xl mb-3">📁</div>
          <p className="text-white font-black text-lg">Archívum</p>
          <p className="text-white/60 text-sm mt-1">Lezárt események és pénzügyek</p>
        </button>
        <button onClick={() => setActivePanel('staff')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300 relative">
          {pendingCount > 0 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">{pendingCount}</span>
          )}
          <div className="text-3xl mb-3">👥</div>
          <p className="text-white font-black text-lg">Staff</p>
          <p className="text-white/60 text-sm mt-1">Tagok és csatlakozási kérelmek</p>
        </button>
      </div>
    </div>
  )
}
