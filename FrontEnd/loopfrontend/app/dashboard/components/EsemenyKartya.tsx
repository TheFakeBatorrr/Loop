'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import StaffJelentkezoKartya from './StaffJelentkezoKartya'
import type { Event, StaffApplicant } from './types'
import { statusLabel, statusColor, typeLabel } from './types'

type Props = {
  event: Event
  onStatusUpdate: () => void
}

export default function EsemenyKartya({ event, onStatusUpdate }: Props) {
  const { authFetch } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staffApplicants, setStaffApplicants] = useState<StaffApplicant[]>([])
  const [staffLoading, setStaffLoading] = useState(false)

  useEffect(() => {
    if (open && event.status === 'staff_gathering') fetchStaff()
  }, [open, event.status])

  const fetchStaff = async () => {
    setStaffLoading(true)
    const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/event/${event.id}`)
    if (res.ok) setStaffApplicants(await res.json())
    setStaffLoading(false)
  }

  const getNextLabel = (): string | null => {
    if (event.type === 'ido_only') {
      if (event.status === 'draft') return 'Publikálás'
      return null
    }
    if (event.status === 'draft') return 'Staff gyűjtés indítása'
    if (event.status === 'staff_gathering') return 'Staff gyűjtés lezárása → Jóváhagyásra küldés'
    return null
  }

  const nextLabel = getNextLabel()

  const handleNextStatus = async () => {
    setLoading(true)
    const response = await authFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/esemeny/${event.id}/next-status`,
      { method: 'PATCH' }
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
            <div><p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Téma</p><p className="text-white">{event.topic}</p></div>
            <div><p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Célcsoport</p><p className="text-white">{event.target_audience}</p></div>
            <div><p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Helyszín</p><p className="text-white">{event.location}</p></div>
            <div><p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Max férőhely</p><p className="text-white">{event.max_capacity} fő</p></div>
          </div>

          {event.status === 'staff_gathering' && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/80 text-sm font-semibold mb-3">Staff jelentkezők</p>
              {staffLoading ? (
                <p className="text-white/50 text-sm">Betöltés...</p>
              ) : staffApplicants.length === 0 ? (
                <p className="text-white/50 text-sm">Még nincs staff jelentkező.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {staffApplicants.map(a => (
                    <StaffJelentkezoKartya key={a.id} applicant={a} event={event} onUpdated={fetchStaff} />
                  ))}
                </div>
              )}
            </div>
          )}

          {nextLabel && (
            <button onClick={handleNextStatus} disabled={loading}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${loading ? 'border-white/20 text-white/30 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-[#6034e3]'}`}>
              {loading ? 'Frissítés...' : nextLabel}
            </button>
          )}

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
