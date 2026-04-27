'use client'

import { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'

type Props = {
  onClose: () => void
  onCreated: () => void
  userId: number | undefined
}

export default function UjEsemenyModal({ onClose, onCreated, userId }: Props) {
  const { authFetch } = useAuth()

  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<'ido_only' | 'ido_school'>('ido_only')
  const [targetAudience, setTargetAudience] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'ido_only'>('ido_only')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name !== '' && topic !== '' && targetAudience !== '' && date !== '' && location !== '' && maxCapacity !== ''

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/esemeny`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, topic, type,
        target_audience: targetAudience,
        date, location,
        max_capacity: parseInt(maxCapacity),
        visibility,
        status: 'draft',
        created_by: userId,
      }),
    })

    if (!response.ok) { setError('Hiba történt az esemény létrehozásakor.'); setLoading(false); return }
    setLoading(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-[#6034e3] mb-6">Új esemény létrehozása</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Név</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="pl. Gólyabál 2025"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Téma</label>
            <select value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
              <option value="">— Válassz témát —</option>
              <option value="Sport">Sport</option>
              <option value="Kultúra">Kultúra</option>
              <option value="Tanulmány">Tanulmány</option>
              <option value="Tovább tanulás">Továbbtanulás</option>
              <option value="Iskolai élet">Iskolai élet</option>
              <option value="Szórakozás">Szórakozás</option>
              <option value="Csapatépítés">Csapatépítés</option>
              <option value="Egyéb">Egyéb</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Típus</label>
            <select value={type} onChange={e => setType(e.target.value as 'ido_only' | 'ido_school')}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
              <option value="ido_only">Csak IDÖ</option>
              <option value="ido_school">IDÖ + Iskolai</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Láthatóság</label>
            <div className="flex gap-3">
              {(['ido_only', 'public'] as const).map(v => (
                <button key={v} onClick={() => setVisibility(v)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${visibility === v ? 'bg-[#6034e3] border-[#6034e3] text-white' : 'border-gray-200 text-gray-500'}`}>
                  {v === 'public' ? 'Publikus' : 'Csak IDÖ'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Célcsoport</label>
            <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm">
              <option value="">— Válassz célcsoportot —</option>
              <option value="Minden diák">Minden diák</option>
              <option value="9. évfolyam">9. évfolyam</option>
              <option value="10. évfolyam">10. évfolyam</option>
              <option value="11. évfolyam">11. évfolyam</option>
              <option value="12. évfolyam">12. évfolyam</option>
              <option value="13. évfolyam">13. évfolyam</option>
              <option value="Info tech">Info tech</option>
              <option value="Gazd tech">Gazd tech</option>
              <option value="Reál">Reál</option>
              <option value="Humán">Humán</option>
              <option value="Kéttannyelvű">Kéttannyelvű</option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Dátum</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">Max létszám</label>
              <input type="number" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value)} placeholder="pl. 30"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">Helyszín</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="pl. Városliget"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all text-sm" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all">Mégse</button>
          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${canSubmit && !loading ? 'bg-[#6034e3] text-white hover:bg-[#8643eb]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {loading ? 'Létrehozás...' : 'Létrehozás'}
          </button>
        </div>
      </div>
    </div>
  )
}
