'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../components/AuthProvider"
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

type View = 'choice' | 'register' | 'login' | 'profile'

export default function Login() {
    const router = useRouter()
    const { user, login: authLogin, logout: authLogout, token, authFetch } = useAuth()

    const [view, setView] = useState<View>('choice')
    const [showFirstLoginPopup, setShowFirstLoginPopup] = useState(false)
    const [profileData, setProfileData] = useState<{ fullName: string, osztaly: string } | null>(null)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [password_confirmation, setPassword_confirmation] = useState("")
    const [username, setUsername] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [fullName, setFullName] = useState("")
    const [osztaly, setOsztaly] = useState("")

    const [idoEvents, setIdoEvents] = useState<any[]>([])
    const [idoProfileOpen, setIdoProfileOpen] = useState(false)

    const canLogin = email !== "" && password !== ""
    const canRegister = email !== "" && password !== "" && username !== "" && password_confirmation !== ""

    useEffect(() => {
        if (user) {
            if (user.role === 'Admin') {
                router.push('/admin')
                return
            }
            setView('profile')
            const saved = localStorage.getItem('userProfile')
            if (saved) setProfileData(JSON.parse(saved))
        }
    }, [user])

    useEffect(() => {
        if (!user) return

        const fetchIdoEvents = async () => {
            const response = await authFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/staff/ido-profil/${user.id}`
            )

            if (!response.ok) return

            const data = await response.json()
            setIdoEvents(data)
        }

        if (user.role === 'Idos' || user.role === 'President' || user.role === "Graduate") {
            fetchIdoEvents()
        }
    }, [user])

    // Sima fetch — login előtt még nincs token
    const userLogin = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password, device_name: 'web' }),
        })

        if (!response.ok) {
            alert('Helytelen email vagy jelszó!')
            setPassword("")
            setUsername("")
            return
        }

        const data = await response.json()

        // Email nincs verifikálva
        if (!data.users.email_verified_at) {
            authLogin(data.token, data.users)
            router.push('/main/verify-email?pending=1')
            return
        }

        authLogin(data.token, data.users)

        if (data.users.role === 'Admin') {
            router.push('/admin')
            return
        }

        await checkFirstLogin(data.users.id, data.token)
    }

    // checkFirstLogin — token már megvan de authFetch state még nem frissült,
    // ezért itt még direktben adjuk át a tokent
    const checkFirstLogin = async (userId: number, token: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
        })

        if (response.status === 404) {
            setShowFirstLoginPopup(true)
        } else {
            const data = await response.json()
            const osztaly = `${data.class_number}.${data.class_letter}`
            localStorage.setItem('userProfile', JSON.stringify({ fullName: data.name, osztaly }))
            setProfileData({ fullName: data.name, osztaly })
            router.push('/main')
        }
    }

    // Sima fetch — regisztráció előtt nincs token
    const userRegister = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, email, password, password_confirmation, device_name: 'web' }),
        })
        const data = await response.json()

        if (!response.ok) {
            alert(data.message ?? 'Hiba történt a regisztráció során!')
            return
        }

        authLogin(data.token, data.diak)
        router.push('/main/verify-email?pending=1')
    }

    // authFetch — token már megvan (regisztráció után)
    const handlePopupSubmit = async () => {
        const [class_year, class_letter] = osztaly.split('.')

        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                users_id: user?.id,
                name: fullName,
                class_number: parseInt(class_year),
                class_letter: class_letter
            })
        })

        if (!response.ok) {
            alert('Hiba történt!')
            return
        }

        localStorage.setItem('userProfile', JSON.stringify({ fullName, osztaly }))
        setProfileData({ fullName, osztaly })
        setShowFirstLoginPopup(false)
        router.push('/main')
    }

    const handleLogout = () => {
        authLogout()
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
                            onChange={e => setOsztaly(e.target.value.toUpperCase())}
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
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Jelszó"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-all"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button
                        className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={userLogin}
                    >
                        Bejelentkezés
                    </button>
                    <button
                        onClick={() => { setView('register'); setEmail(''); setPassword(''); setUsername(''); setPassword_confirmation('') }}
                        style={{ color: "white" }}
                        className="py-2 rounded-xl border-white border w-fit mx-auto px-3"
                    >
                        Először regisztrálok
                    </button>
                    <button
                        onClick={() => {setEmail(''); setPassword(''); setUsername(''); setPassword_confirmation(''); router.push('/forgot-password') }}
                        style={{ color: "white" }}
                        className="py-2 rounded-xl border-white border w-fit mx-auto px-3"
                    >
                        Elfelejtett jelszó
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
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Jelszó"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-all"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <input
                        type="password"
                        placeholder="Jelszó megerősítése"
                        value={password_confirmation}
                        onChange={e => setPassword_confirmation(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    <button
                        className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={userRegister}
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
                    <p className="font-black text-center text-white">{profileData?.osztaly}</p>

                    <button
                        onClick={() => router.push('/dashboard?tab=reviews')}
                        className="bg-white text-[#6034e3] font-bold py-3 rounded-xl hover:bg-white/80 transition-all duration-300"
                    >
                        Értékeléseim
                    </button>

                    {(user?.role === 'Idos' || user?.role === 'President' || user?.role === "Graduate") && (
                        <div className="bg-[#111111] rounded-2xl p-6 flex flex-col gap-3">
                            <button
                                onClick={() => setIdoProfileOpen(!idoProfileOpen)}
                                className="flex items-center justify-between text-left"
                            >
                                <div>
                                    <p className="text-white font-black text-lg">
                                        IDÖ profil
                                    </p>

                                    <p className="text-white/70 text-sm mt-1">
                                        {user?.role === 'President'
                                            ? 'IDÖ elnök 👑'
                                            : user?.role === 'Idos'
                                            ? 'IDÖ tag'
                                            : user?.role}
                                    </p>
                                </div>

                                <span className="text-white text-xl">
                                    {idoProfileOpen ? '−' : '+'}
                                </span>
                            </button>

                            {idoProfileOpen && (
                                <div className="flex flex-col gap-3 pt-2">
                                    {idoEvents.length > 0 ? (
                                        idoEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="border border-white/10 rounded-xl p-4"
                                            >
                                                <p className="text-white font-semibold">
                                                    {event.name}
                                                </p>

                                                <p className="text-white/60 text-sm mt-1">
                                                    {event.date}
                                                </p>

                                                <p className="text-white/80 text-sm mt-2">
                                                    {event.user_event_role}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white/60 text-sm">
                                            Nincs még kapcsolódó esemény.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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