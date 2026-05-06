'use client'

import { useState } from 'react'
import { typeLabel } from './types'

type IdosArchivedEvent = {
  id: number
  name: string
  type: string
  topic: string
  date: string
  location: string
  target_audience: string
  main_organiser_name: string | null
  avg_rating: number | null
}

type Props = { event: IdosArchivedEvent }

export default function IdosArchivKartya({ event }: Props) {
  const [open, setOpen] = useState(false)

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-white/40 text-sm">Nincs értékelés</span>
    const rounded = Math.round(rating * 10) / 10
    return (
      <span className="text-white font-semibold">
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rounded}/5
      </span>
    )
  }

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-all"
      >
        <div className="flex flex-col gap-0.5">
          <p className="text-white font-semibold">{event.name}</p>
          <p className="text-white/50 text-xs">{event.date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-red-400/20 text-red-300 text-xs px-2 py-1 rounded-full font-semibold">Lezárt</span>
          <span className="text-white/40 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 pt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Típus</p>
              <p className="text-white">{typeLabel[event.type as keyof typeof typeLabel] ?? event.type}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Téma</p>
              <p className="text-white">{event.topic}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Helyszín</p>
              <p className="text-white">{event.location}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Célcsoport</p>
              <p className="text-white">{event.target_audience}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Főszervező</p>
              <p className="text-white">{event.main_organiser_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-0.5">Értékelés</p>
              {renderStars(event.avg_rating)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}