'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            alert(data.message || 'Hiba történt')
            setLoading(false)
            return
        }

        alert('Reset link elküldve emailben.')
        setLoading(false)
    }

    return (
        <main className="min-h-screen bg-[#6034e3] flex items-center justify-center px-6">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md flex flex-col gap-4">
                <h1 className="text-2xl font-black text-[#171717]">
                    Jelszó visszaállítás
                </h1>

                <input
                    type="email"
                    placeholder="Email címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded-xl px-4 py-3 outline-none focus:border-[#6034e3]"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#6034e3] text-white py-3 rounded-xl font-bold"
                >
                    Reset link küldése
                </button>
            </div>
        </main>
    )
}