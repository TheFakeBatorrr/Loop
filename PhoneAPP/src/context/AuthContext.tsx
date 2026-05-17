import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService, saveToken, removeToken, getToken } from '../services/api'
import { User, AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  })

  // Alkalmazás induláskor — mentett token ellenőrzése
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getToken()
        if (token) {
          const user = await authService.me()
          setState({ user, token, isLoading: false })
        } else {
          setState({ user: null, token: null, isLoading: false })
        }
      } catch {
        await removeToken()
        setState({ user: null, token: null, isLoading: false })
      }
    }
    bootstrap()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password)

    // Laravel Sanctum: { token, users } formátum (a webes oldallal megegyező)
    const token = data.token
    const user = data.users ?? data.user ?? null

    if (!token || !user) {
      throw new Error('Érvénytelen szerver válasz.')
    }

    await saveToken(token)
    setState({ user, token, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // API hiba esetén is töröljük a lokális tokent
    } finally {
      await removeToken()
      setState({ user: null, token: null, isLoading: false })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}