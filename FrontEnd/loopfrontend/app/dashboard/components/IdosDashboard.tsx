'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import IdosEsemenyKartya from './IdosEsemenyKartya'
import type { Event, IdosPanel } from './types'

type Props = { userId: number | undefined }

export default function IdosDashboard({ userId }: Props) {
  const { authFetch } = useAuth()
  const [activePanel, setActivePanel] = useState<IdosPanel>(null)
  const [gatheringEvents, setGatheringEvents] = useState<Event[]>([])
  const [gatheringLoading, setGatheringLoading] = useState(true)

  useEffect(() => { fetchGatheringEvents() }, [])

  const fetchGatheringEvents = async () => {
    setGatheringLoading(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`)
    if (response.ok) {
      const data: Event[] = await response.json()
      setGatheringEvents(data.filter(e => e.status === 'staff_gathering' && e.type !== 'external'))
    }
    setGatheringLoading(false)
  }

  if (activePanel === 'esemenyek') {
    return (
      <div className="bg-[#6034e3] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-black">Események</h2>
          <button onClick={() => setActivePanel(null)} className="text-white/70 hover:text-white text-sm font-semibold">← Vissza</button>
        </div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">Staff gyűjtés alatt</p>
        {gatheringLoading ? (
          <p className="text-white/60 text-sm">Betöltés...</p>
        ) : gatheringEvents.length === 0 ? (
          <p className="text-white/60 text-sm">Jelenleg nincs staff gyűjtés alatt lévő esemény.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {gatheringEvents.map(e => <IdosEsemenyKartya key={e.id} event={e} userId={userId} />)}
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
        <p className="text-white/60 text-sm">Archívum hamarosan elérhető.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-[#171717] font-black text-lg">IDÖ tag felület</p>
          <p className="text-gray-500 text-sm">Esemény jelentkezések és archívum</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setActivePanel('esemenyek')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300 relative">
          {gatheringEvents.length > 0 && (
            <span className="absolute top-4 right-4 bg-blue-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
              {gatheringEvents.length}
            </span>
          )}
          <div className="text-3xl mb-3">📅</div>
          <p className="text-white font-black text-lg">Események</p>
          <p className="text-white/60 text-sm mt-1">Staff gyűjtés alatt lévő események</p>
        </button>
        <button onClick={() => setActivePanel('archivum')}
          className="bg-[#6034e3] rounded-2xl p-6 text-left hover:bg-[#8643eb] transition-all duration-300">
          <div className="text-3xl mb-3">📁</div>
          <p className="text-white font-black text-lg">Archívum</p>
          <p className="text-white/60 text-sm mt-1">Lezárt események áttekintése</p>
        </button>
      </div>
    </div>
  )
}
