'use client'

import { useState } from 'react'
import type { Event } from './types'
import { typeLabel } from './types'

type Props = { event: Event }

export default function PublikaltKartya({ event }: Props) {
  const [open, setOpen] = useState(false)

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
          <span className="bg-green-400/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold">Publikált</span>
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
          <div className="bg-green-400/10 rounded-xl p-3">
            <p className="text-green-300 text-sm">✅ Az esemény jelenleg aktív és nyilvános.</p>
          </div>
        </div>
      )}
    </div>
  )
}
