'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authFetch } = useAuth()
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    const verifyUrl = searchParams.get('verify_url')
    const pending = searchParams.get('pending')

    // Login után átirányítva — várakozó képernyő
    if (pending === '1') {
      setStatus('pending')
      return
    }

    // Mailből jött link — automatikus verifikáció
    if (!verifyUrl) {
      setStatus('error')
      setMessage('Érvénytelen link — hiányzik a verifikációs URL.')
      return
    }

    fetch(decodeURIComponent(verifyUrl), {
      headers: { 'Accept': 'application/json' },
    })
      .then(async res => {
        const data = await res.json()
        if (res.ok) {
          setStatus('success')
          setTimeout(() => router.push('/dashboard?verified=1'), 2000)
        } else {
          setStatus('error')
          setMessage(data.message ?? 'Hiba történt a verifikáció során.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Nem sikerült kapcsolódni a szerverhez.')
      })
  }, [])

  const handleResend = async () => {
    setResending(true)
    const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email/resend`, {
      method: 'POST',
    })
    setResending(false)
    if (res.ok) setResent(true)
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">

        {status === 'pending' && (
          <>
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-black text-[#6034e3] mb-2">Erősítsd meg az emailed!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Küldtünk egy megerősítő emailt. Kattints a benne lévő linkre a folytatáshoz.
            </p>
            {resent ? (
              <p className="text-green-500 text-sm font-semibold">✅ Email újraküldve!</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className={`border-2 border-[#6034e3] text-[#6034e3] px-6 py-2 rounded-xl font-semibold transition-all duration-300
                  ${resending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#6034e3] hover:text-white'}`}>
                {resending ? 'Küldés...' : 'Email újraküldése'}
              </button>
            )}
          </>
        )}

        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-black text-[#6034e3] mb-2">Verifikáció folyamatban...</h1>
            <p className="text-gray-500 text-sm">Kérjük várj egy pillanatot.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-black text-[#6034e3] mb-2">Email megerősítve!</h1>
            <p className="text-gray-500 text-sm">Átirányítunk az irányítópultra...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-black text-[#6034e3] mb-2">Hiba történt</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="border-2 border-[#6034e3] text-[#6034e3] px-6 py-2 rounded-xl font-semibold hover:bg-[#6034e3] hover:text-white transition-all duration-300">
              Vissza a bejelentkezéshez
            </button>
          </>
        )}

      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}