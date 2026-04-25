'use client'

import { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import type { ArchivedEvent } from './types'
import { typeLabel } from './types'

type Props = {
  event: ArchivedEvent
  onSaved: () => void
}

export default function ArchivKartya({ event, onSaved }: Props) {
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
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events/${event.ido_event_id}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revenue, expanses }) }
      )
      if (!response.ok) { setError('Hiba történt a mentés során.'); setLoading(false); return }
    } else {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ido-events`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ido_event_id: event.id, revenue, expanses }) }
      )
      if (!response.ok) { setError('Hiba történt a mentés során.'); setLoading(false); return }
    }

    setLoading(false)
    setEditing(false)
    onSaved()
  }

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden opacity-90">
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
          {!hasIdoData && <span className="bg-orange-400/20 text-orange-300 text-xs px-2 py-1 rounded-full font-semibold">Hiányos</span>}
          <span className="bg-red-400/20 text-red-300 text-xs px-2 py-1 rounded-full font-semibold">Lezárt</span>
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

          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/80 text-sm font-semibold">Pénzügyek</p>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-white/60 hover:text-white text-xs font-semibold transition-all">✏️ Szerkesztés</button>
              )}
            </div>
            {editing ? (
              <div className="flex flex-col gap-2">
                {error && <p className="text-red-300 text-xs">{error}</p>}
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1 block">Bevétel</label>
                  <input type="text" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="pl. 50000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/50 transition-all" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-1 block">Kiadás</label>
                  <input type="text" value={expanses} onChange={e => setExpanses(e.target.value)} placeholder="pl. 30000"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-white/50 transition-all" />
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => { setEditing(false); setError(null) }}
                    className="flex-1 border border-white/20 text-white/60 py-1.5 rounded-lg text-sm font-semibold hover:border-white/40 transition-all">Mégse</button>
                  <button onClick={handleSave} disabled={loading}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${loading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-[#6034e3] hover:bg-white/90'}`}>
                    {loading ? 'Mentés...' : 'Mentés'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Bevétel</p><p className="text-white font-semibold">{event.revenue ?? '—'}</p></div>
                <div><p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Kiadás</p><p className="text-white font-semibold">{event.expanses ?? '—'}</p></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
