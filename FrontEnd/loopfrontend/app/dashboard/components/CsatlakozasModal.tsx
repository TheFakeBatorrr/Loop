'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
  onSubmit: (motivacio: string, tapasztalat: string) => void
}

export default function CsatlakozasModal({ onClose, onSubmit }: Props) {
  const [motivacio, setMotivacio] = useState('')
  const [tapasztalat, setTapasztalat] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-black text-[#6034e3] mb-6">Csatlakozás az IDÖ-höz</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Motiváció</label>
            <textarea
              value={motivacio}
              onChange={e => setMotivacio(e.target.value)}
              placeholder="Miért szeretnél csatlakozni az IDÖ-höz?"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all duration-300 resize-none h-28 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Tapasztalat</label>
            <textarea
              value={tapasztalat}
              onChange={e => setTapasztalat(e.target.value)}
              placeholder="Van-e korábbi tapasztalatod hasonló tevékenységben?"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all duration-300 resize-none h-24 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all duration-300"
          >
            Mégse
          </button>
          <button
            onClick={() => onSubmit(motivacio, tapasztalat)}
            className="flex-1 bg-[#6034e3] text-white py-3 rounded-xl font-semibold hover:bg-[#8643eb] transition-all duration-300"
          >
            Küldés
          </button>
        </div>
      </div>
    </div>
  )
}
