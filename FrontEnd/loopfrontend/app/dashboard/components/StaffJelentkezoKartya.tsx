'use client'

import { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import type { StaffApplicant, Event } from './types'

type Props = {
  applicant: StaffApplicant
  event: Event
  onUpdated: () => void
}

export default function StaffJelentkezoKartya({ applicant, event, onUpdated }: Props) {
  const { authFetch } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)

    const staffRes = await authFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/staff/${applicant.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted: true }),
      }
    )
    if (!staffRes.ok) { alert('Hiba a staff elfogadásakor!'); setLoading(false); return }

    if (applicant.role === 'főszervező') {
      const idoRes = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events/${event.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ main_organiser_id: applicant.staff_user_id }),
        }
      )
      if (!idoRes.ok) alert('Staff elfogadva, de a főszervező beállítása sikertelen!')
    }

    setLoading(false)
    onUpdated()
  }

  const handleReject = async () => {
    setLoading(true)
    const res = await authFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/staff/${applicant.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted: false }),
      }
    )
    if (!res.ok) { alert('Hiba az elutasításkor!'); setLoading(false); return }
    setLoading(false)
    onUpdated()
  }

  return (
    <div className="bg-white/10 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-white font-semibold">{applicant.name}</p>
          <p className="text-white/60 text-sm">
            {applicant.class_number}.{applicant.class_letter} ·{' '}
            <span className={applicant.role === 'főszervező' ? 'text-yellow-300 font-semibold' : 'text-white/60'}>
              {applicant.role === 'főszervező' ? '👑 Főszervező' : 'Szervező'}
            </span>
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${applicant.accepted ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}`}>
          {applicant.accepted ? 'Elfogadva' : 'Várakozik'}
        </span>
      </div>

      {!applicant.accepted && (
        <div className="flex gap-2 mt-2">
          <button onClick={handleReject} disabled={loading}
            className="flex-1 border border-red-400 text-red-300 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-400 hover:text-white transition-all disabled:opacity-40">
            Elutasít
          </button>
          <button onClick={handleAccept} disabled={loading}
            className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all disabled:opacity-40">
            {loading ? '...' : 'Elfogad'}
          </button>
        </div>
      )}
    </div>
  )
}
