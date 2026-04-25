'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import type { Event, StaffApplication, StaffApplicant } from './types'
import { typeLabel } from './types'

type Props = {
  event: Event
  userId: number | undefined
}

export default function IdosEsemenyKartya({ event, userId }: Props) {
  const { authFetch } = useAuth()
  const [open, setOpen] = useState(false)
  const [applying, setApplying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingApplication, setExistingApplication] = useState<StaffApplication | null>(null)
  const [allStaff, setAllStaff] = useState<StaffApplicant[]>([])
  const [staffLoading, setStaffLoading] = useState(false)

  // Betöltés — párhuzamosan kéri le a saját jelentkezést és az összes staffot
  useEffect(() => {
    if (!userId) return
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([checkApplication(), fetchAllStaff()])
      setLoading(false)
    }
    fetchAll()
  }, [userId, event.id])

  const checkApplication = async () => {
    const response = await authFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/staff/user/${userId}/event/${event.id}`
    )
    if (response.status === 404) setExistingApplication(null)
    else if (response.ok) setExistingApplication(await response.json())
  }

  const fetchAllStaff = async () => {
    setStaffLoading(true)
    const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/event/${event.id}`)
    if (res.ok) setAllStaff(await res.json())
    setStaffLoading(false)
  }

  const handleApply = async (role: 'szervező' | 'főszervező') => {
    setApplying(true)
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_user_id: userId, staff_event_id: event.id, role }),
    })
    if (!response.ok) { alert('Hiba történt a jelentkezés során!'); setApplying(false); return }
    await checkApplication()
    await fetchAllStaff()
    setApplying(false)
  }

  const handleAcceptSzervezo = async (staffId: number) => {
    await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepted: true }),
    })
    await fetchAllStaff()
  }

  const handleRejectSzervezo = async (staffId: number) => {
    await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepted: false }),
    })
    await fetchAllStaff()
  }

  const hasAcceptedFoszervezo = allStaff.some(s => s.role === 'főszervező' && Boolean(s.accepted))
  const iAmFoszervezo = allStaff.some(s => s.staff_user_id === userId && s.role === 'főszervező' && Boolean(s.accepted))

  const szorvezokPending = allStaff.filter(s => s.role === 'szervező' && s.accepted === false)
  const szervezokAccepted = allStaff.filter(s => s.role === 'szervező' && s.accepted === true)

  const renderJelentkezesGomb = () => {
    if (loading) {
      return <p className="text-white/50 text-sm">Betöltés...</p>
    }

    if (existingApplication !== null) {
      return (
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/80 text-sm font-semibold mb-1">Már jelentkeztél</p>
          <p className="text-white/60 text-sm">
            Szerepkör:{' '}
            <span className="text-white font-semibold">
              {existingApplication.role === 'főszervező' ? '👑 Főszervező' : 'Szervező'}
            </span>
          </p>
          <p className="text-white/60 text-sm">
            Státusz:{' '}
            <span className={`font-semibold ${existingApplication.accepted ? 'text-green-300' : 'text-yellow-300'}`}>
              {existingApplication.accepted ? 'Elfogadva' : 'Várakozik'}
            </span>
          </p>
        </div>
      )
    }

    if (event.type === 'ido_school') {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Jelentkezés szerepkörre</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleApply('főszervező')}
              disabled={applying || hasAcceptedFoszervezo}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                ${applying || hasAcceptedFoszervezo
                  ? 'border-white/20 text-white/30 cursor-not-allowed'
                  : 'border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/20'}`}>
              {hasAcceptedFoszervezo ? '👑 Már van főszervező' : '👑 Főszervező'}
            </button>
            <button
              onClick={() => handleApply('szervező')}
              disabled={applying}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                ${applying
                  ? 'border-white/20 text-white/30 cursor-not-allowed'
                  : 'border-white text-white hover:bg-white hover:text-[#6034e3]'}`}>
              Szervező
            </button>
          </div>
        </div>
      )
    }

    return (
      <button
        onClick={() => handleApply('szervező')}
        disabled={applying}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
          ${applying
            ? 'border-white/20 text-white/30 cursor-not-allowed'
            : 'border-white text-white hover:bg-white hover:text-[#6034e3]'}`}>
        {applying ? 'Jelentkezés...' : 'Jelentkezés szervezőnek'}
      </button>
    )
  }

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
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
          {iAmFoszervezo && (
            <span className="bg-yellow-400/20 text-yellow-300 text-xs px-2 py-1 rounded-full font-semibold">
              👑 Főszervező
            </span>
          )}
          <span className="bg-blue-400/20 text-blue-300 text-xs px-2 py-1 rounded-full font-semibold">Staff gyűjtés</span>
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

          {renderJelentkezesGomb()}

          {iAmFoszervezo && (
            <div className="bg-white/5 rounded-xl p-3 mt-1">
              <p className="text-white/80 text-sm font-semibold mb-3">Szervező jelentkezők</p>
              {staffLoading ? (
                <p className="text-white/50 text-sm">Betöltés...</p>
              ) : szorvezokPending.length === 0 && szervezokAccepted.length === 0 ? (
                <p className="text-white/50 text-sm">Még nincs szervező jelentkező.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {szervezokAccepted.map(s => (
                    <div key={s.id} className="bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-semibold">{s.name}</p>
                        <p className="text-white/50 text-xs">{s.class_number}.{s.class_letter}</p>
                      </div>
                      <span className="bg-green-400/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold">Elfogadva</span>
                    </div>
                  ))}
                  {szorvezokPending.map(s => (
                    <div key={s.id} className="bg-white/10 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white text-sm font-semibold">{s.name}</p>
                          <p className="text-white/50 text-xs">{s.class_number}.{s.class_letter}</p>
                        </div>
                        <span className="bg-yellow-400/20 text-yellow-300 text-xs px-2 py-1 rounded-full font-semibold">Várakozik</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectSzervezo(s.id)}
                          className="flex-1 border border-red-400 text-red-300 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-400 hover:text-white transition-all">
                          Elutasít
                        </button>
                        <button
                          onClick={() => handleAcceptSzervezo(s.id)}
                          className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition-all">
                          Elfogad
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}