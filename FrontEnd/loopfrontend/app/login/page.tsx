'use client'
import { useState } from "react"

type View = 'choice' | 'register' | 'login' | 'profile'
 
export default function Login(){

    const [view,setView] = useState<View>('choice')
    const [modalOpen,setModalOpen] = useState(false)
    
    const [email,setEmail] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    const [user, setUser] = useState<string>("")

    const canLogin = email != "" && password != ""
    const canRegister = email != "" && password != "" && user != ""
    
    const logged = false
    
    return (
        <main className="min-h-screen bg-[#6034e3] flex items-center justify-center">
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
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    
                    <input
                        type="password"
                        placeholder="Jelszó"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />

                    <button className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        Bejelentkezés
                    </button>

                    <button onClick={() => {setView('register'); setEmail('');setPassword('');setUser('')}} style={{color:"white"}} className={`py-2 rounded-xl`}>
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
                        type="string"
                        placeholder="Felhasználónév"
                        value={user}
                        onChange={e => setUser(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />
                    
                    <input
                        type="password"
                        placeholder="Jelszó"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 outline-none focus:border-white transition-all duration-300"
                    />

                    <button className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        Regisztráció
                    </button>

                    <button onClick={() => {setView('login'); setEmail('');setPassword('');setUser('')}} style={{color:"white"}} className={`py-2 rounded-xl`}>
                        Inkább bejelentkezek
                    </button>
                </div>
            )}

            {view == 'profile' && (

                <div className="fade-in login-box bg-white/10 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-md">

                </div>

            )}

        </main>
    )
}
