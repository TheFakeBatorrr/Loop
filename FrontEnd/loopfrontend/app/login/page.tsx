'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../components/AuthProvider"

type View = 'choice' | 'register' | 'login' | 'profile'

export default function Login() {
    const router = useRouter()
    const { user, login: authLogin, logout: authLogout } = useAuth()

    const [view, setView] = useState<View>('choice')
    const [showFirstLoginPopup, setShowFirstLoginPopup] = useState(false)
    const [profileData, setProfileData] = useState<{ fullName: string, osztaly: string } | null>(null)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passagain, setPassagain] = useState("")
    const [username, setUsername] = useState("")

    const [fullName, setFullName] = useState("")
    const [osztaly, setOsztaly] = useState("")

    const canLogin = username !== "" && password !== ""
    const canRegister = email !== "" && password !== "" && username !== "" && passagain !== ""
    const samePass = password === passagain

    // FAKE credentials
    const testusername = "asd"
    const testpassword = "asd"

    useEffect(() => {
        if (user) {
            setView('profile')
            const saved = localStorage.getItem('userProfile')
            if (saved) setProfileData(JSON.parse(saved))
        }
    }, [user])

    const generateFakeToken = () => `fake-token-${Math.random().toString(36).substring(2)}`

    const testLogin = () => {
        if (!canLogin) return alert('Tölts ki minden adatot!')
        if (username !== testusername || password !== testpassword) {
            alert('Helytelen felhasználónév vagy jelszó!')
            setPassword("")
            setUsername("")
            return
        }

        const fakeToken = generateFakeToken()
        const fakeUser = { id: 1, email: 'test@loop.hu', role: 'diak' }
        authLogin(fakeToken, fakeUser)

        const isFirstLogin = !localStorage.getItem('hasLoggedInBefore')
        if (isFirstLogin) {
            localStorage.setItem('hasLoggedInBefore', 'true')
            setShowFirstLoginPopup(true)
        } else {
            router.push('/main')
        }
    }

    const testRegister = () => {
        if (!samePass) return alert("A jelszavak nem egyeznek!")

        const fakeToken = generateFakeToken()
        const fakeUser = { id: 1, email, role: 'diak' }
        authLogin(fakeToken, fakeUser)

        localStorage.setItem('hasLoggedInBefore', 'true')
        setShowFirstLoginPopup(true)
    }

    const handlePopupSubmit = () => {
        localStorage.setItem('userProfile', JSON.stringify({ fullName, osztaly }))
        setProfileData({ fullName, osztaly })
        setShowFirstLoginPopup(false)
        router.push('/main')
    }

    const handleLogout = () => {
        authLogout()
        localStorage.removeItem('userProfile')
        localStorage.removeItem('hasLoggedInBefore')
        setView('choice')
    }

    return (
        <main className="min-h-screen bg-[#6034e3] flex items-center justify-center">

            {/* ELSŐ BEJELENTKEZÉS POPUP */}
            {showFirstLoginPopup && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 flex flex-col gap-4 w-full max-w-sm mx-4">
                        <h2 className="text-xl font-black text-[#171717]">Még egy dolog! 👋</h2>
                        <p className="text-gray-500 text-sm">Töltsd ki az adataidat a teljes élményhez.</p>
                        <input
                            type="text"
                            placeholder="Teljes neved"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all"
                        />
                        <input
                            type="text"
                            placeholder="Osztályod (pl. 12.A)"
                            value={osztaly}
                            onChange={e => setOsztaly(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#6034e3] transition-all"
                        />
                        <button
                            onClick={handlePopupSubmit}
                            className="bg-[#6034e3] text-white font-bold py-3 rounded-xl hover:bg-[#8643eb] transition-all"
                        >
                            Kész!
                        </button>
                    </div>
                </div>
            )}

            {view === 'choice' && (
                <div className="fixed inset-0 z-50 bg-[#6034e3] flex flex-col items-center justify-center gap-4">
                    <button
                        onClick={() => setView('login')}
                        className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#6034e3] hover:rounded-[21px] transition-all duration-500 font-semibold w-64"
                    >
                        Bejelentkezés
                    </button>
                    <button
                        onClick={() => setView('register')}
                        className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#6034e3] hover:rounded-[21px] transition-all duration-500 font-semibold w-64"
                    >
                        Regisztráció
                    </button>
                </div>
            )}

            {view === 'login' && (
                <div className="fade-in login-box bg-white/10 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-md">
                    <h1 className="text-white text-2xl font-bold text-center">Bejelentkezés</h1>
                    <input
                        type="text"
                        placeholder="Felhasználónév"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <input
                        type="password"
                        placeholder="Jelszó"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <button
                        className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={testLogin}
                    >
                        Bejelentkezés
                    </button>
                    <button
                        onClick={() => { setView('register'); setEmail(''); setPassword(''); setUsername('') }}
                        style={{ color: "white" }}
                        className="py-2 rounded-xl border-white border w-fit mx-auto px-3"
                    >
                        Először regisztrálok
                    </button>
                </div>
            )}

            {view === 'register' && (
                <div className="fade-in login-box bg-white/10 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-md">
                    <h1 className="text-white text-2xl font-bold text-center">Regisztráció</h1>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <input
                        type="text"
                        placeholder="Felhasználónév"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <input
                        type="password"
                        placeholder="Jelszó"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <input
                        type="password"
                        placeholder="Jelszó megerősítése"
                        value={passagain}
                        onChange={e => setPassagain(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <button
                        className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={testRegister}
                    >
                        Regisztráció
                    </button>
                    <button
                        onClick={() => { setView('login'); setEmail(''); setPassword(''); setUsername('') }}
                        style={{ color: "white" }}
                        className="py-2 rounded-xl border-white border w-fit mx-auto px-3"
                    >
                        Inkább bejelentkezek
                    </button>
                </div>
            )}

            {view === 'profile' && (
                <div className="w-full max-w-md flex flex-col gap-4 px-6 py-16">
                    <h1 className="text-3xl font-black text-center text-white">
                        Szia, {profileData?.fullName ?? 'Ismeretlen'}!
                    </h1>
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span className="text-gray-500 text-sm font-semibold">Osztály</span>
                            <span className="font-bold text-[#171717]">{profileData?.osztaly ?? '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm font-semibold">Leadott értékelések</span>
                            <span className="font-bold text-[#171717]">3 db</span>
                        </div>
                    </div>
                    <div className="bg-[#111111] rounded-2xl p-6 flex flex-col gap-3">
                        <p className="text-white font-black text-lg mb-1">IDÖ profil</p>
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <span className="text-white/60 text-sm font-semibold">Staff részvételek</span>
                            <span className="font-bold text-white">7 db</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm font-semibold">IDÖ-s évek</span>
                            <span className="font-bold text-white">2 év</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard?tab=reviews')}
                        className="bg-white text-[#6034e3] font-bold py-3 rounded-xl hover:bg-white/80 transition-all duration-300"
                    >
                        Értékeléseim
                    </button>
                    <button
                        onClick={handleLogout}
                        className="border-2 border-red-400 text-red-400 py-3 rounded-xl font-semibold hover:bg-red-400 hover:text-white transition-all duration-300"
                    >
                        Kijelentkezés
                    </button>
                </div>
            )}
        </main>
    )
}