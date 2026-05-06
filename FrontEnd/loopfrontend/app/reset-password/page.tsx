'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            alert(data.message || 'Hiba történt')
            setLoading(false)
            return
        }

        alert('Jelszó sikeresen módosítva')
        router.push('/login')
    }

    return (
        <main className="min-h-screen bg-[#6034e3] flex items-center justify-center px-6">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col gap-4">
                <h1 className="text-2xl font-black text-[#171717]">
                    Új jelszó beállítása
                </h1>

                <input
                    type="password"
                    placeholder="Új jelszó"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded-xl px-4 py-3 outline-none focus:border-[#6034e3]"
                />

                <input
                    type="password"
                    placeholder="Jelszó megerősítése"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="border rounded-xl px-4 py-3 outline-none focus:border-[#6034e3]"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#6034e3] text-white py-3 rounded-xl font-bold"
                >
                    Jelszó módosítása
                </button>
            </div>
        </main>
    )
}