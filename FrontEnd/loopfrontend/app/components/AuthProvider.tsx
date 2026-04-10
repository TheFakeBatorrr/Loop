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
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) return

    fetch('http://127.0.0.1:8000/api/me', {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setToken(savedToken)
      })
      .catch(() => localStorage.removeItem('token'))
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token)
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}