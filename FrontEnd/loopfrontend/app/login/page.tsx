'use client'
import { useEffect, useState } from "react"
import { useAuth } from "../components/AuthProvider"

type View = 'choice' | 'register' | 'login' | 'profile'


const users : {
        email:string,
        username:string,
        password:string
    }[] = []

export default function Login(){

    const [view,setView] = useState<View>('choice')
    const [modalOpen,setModalOpen] = useState(false)
    
    const [email,setEmail] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    
    const [passagain, setPassagain] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    const canLogin = email != "" && password != ""
    const canRegister = email != "" && password != "" && username != "" && passagain != ""
    const samePass = password === passagain
    
    const { user, login: authLogin } = useAuth()

    

    useEffect(() => {
        if(user) setView('profile')
    }, [user])
    

    const userLogin = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        })
        const data = await response.json()
        authLogin(data.token, data.user)
    }

    const userRegister = async () => {
        const response = await fetch('',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body:JSON.stringify({email,password})
        })
        const data = await response.json()
    }

    {/* Teszt Bejelentkezés funkció */}
    const testLogin = () => {
        if(canLogin)
        {
            authLogin('test-token-123', { id: 1, email: email, role: 'student' })
        }
        else
        {
            alert('Tölts ki minden adatot!')
        }
    }

    {/* Teszt Regisztrációs funkció */}
    const testRegister = async () => {
        // szimulált sikeres regisztráció
        if(samePass)
        {
            users.push({ username, email, password})
            console.log('Regisztráltak: ', users)
            setView('login')
            setModalOpen(true)
            
        }
        else
        {
            alert("A jelszavak nem helyesek!")
        }
    }
    
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
                        ${canLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={testLogin}>
                        Bejelentkezés
                    </button>

                    <button onClick={() => {setView('register'); setEmail('');setPassword('');setUsername('')}} style={{color:"white"}} className={`py-2 rounded-xl`}>
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

                    <button className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500
                        ${canRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        onClick={testRegister}>
                        Regisztráció
                    </button>

                    <button onClick={() => {setView('login'); setEmail('');setPassword('');setUsername('')}} style={{color:"white"}} className={`py-2 rounded-xl`}>
                        Inkább bejelentkezek
                    </button>
                </div>
            )}

            {view == 'profile' && (

                <div className="fade-in login-box bg-white/10 rounded-2xl p-10 flex flex-col gap-6 w-full max-w-md">
                    Szia {/* Felhasználó neve*/} !nagy!

                    Osztály {/* Felhasználó osztálya*/}
                    Értékelések {/* leadott értékelések száma*/}
                    stb.

                </div>

            )}

        </main>
    )
}
