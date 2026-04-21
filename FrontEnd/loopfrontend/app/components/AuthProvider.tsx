'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: number
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) { setInitialized(true); return }
    setToken(savedToken)
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))
    setInitialized(true)
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userProfile')
    setToken(null)
    setUser(null)
  }

  // Wrapper fetch — automatikus Authorization header + 401 kezelés
  const authFetch = async (url: string, options?: RequestInit): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options?.headers,
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      logout()
    }

    return response
  }

  // Nem renderelünk semmit amíg a localStorage nincs betöltve
  // Ez megakadályozza hogy a fetchek üres tokennel fussanak le hard refresh után
  if (!initialized) return null

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}