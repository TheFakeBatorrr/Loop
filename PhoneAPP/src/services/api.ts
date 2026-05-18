import axios, { AxiosInstance } from 'axios'
import { Platform } from 'react-native'
import {User} from '../types'

// ============================================================
// KONFIG
// ============================================================

const API_BASE_URL = 'http://10.106.18.212:8000/api'
const TOKEN_KEY = 'ido_auth_token'

// ============================================================
// PLATFORM-AWARE STORAGE
// Web → localStorage
// Natív → expo-secure-store (dynamic import, hogy weben ne crasheljen)
// ============================================================

const storage = {
  get: async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY)
    }
    const SecureStore = await import('expo-secure-store')
    return SecureStore.getItemAsync(TOKEN_KEY)
  },

  set: async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token)
      return
    }
    const SecureStore = await import('expo-secure-store')
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  },

  remove: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY)
      return
    }
    const SecureStore = await import('expo-secure-store')
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  },
}

export const saveToken = (token: string) => storage.set(token)
export const getToken = () => storage.get()
export const removeToken = () => storage.remove()

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor — Bearer token minden kérésre
api.interceptors.request.use(
  async (config) => {
    const token = await storage.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — 401 esetén token törlés
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.remove()
    }
    return Promise.reject(error)
  }
)

// ============================================================
// AUTH
// ============================================================

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', {
      email,
      password,
      device_name: 'web',
    })
    return response.data as { token: string; users: User; user: User }
  },

  logout: async () => {
    await api.post('/logout')
    await storage.remove()
  },

  me: async (): Promise<User> => {
    const response = await api.get('/me')
    return response.data as User
  },
}

// ============================================================
// STAFF GATHERING
// ============================================================

export const gatheringService = {
  getAll: async () => {
    const response = await api.get('/esemeny')
    return response.data
  },

  jelentkezes: async (event_id: number, role: 'szervező' | 'főszervező') => {
    const response = await api.post('/staff', {
      staff_event_id: event_id,
      role,
    })
    return response.data
  },

  sajatJelentkezes: async (user_id: number, event_id: number) => {
    const response = await api.get(`/staff/user/${user_id}/event/${event_id}`)
    return response.data
  },

  visszavonas: async (staff_id: number) => {
    const response = await api.delete(`/staff/${staff_id}`)
    return response.data
  },
}

// ============================================================
// ARCHÍVUM
// ============================================================

export const archivumService = {
  getAll: async () => {
    const response = await api.get('/esemeny/archivum')
    return response.data
  },
}

// ============================================================
// PROFIL
// ============================================================

export const profilService = {
  getSajat: async (user_id: number) => {
    const response = await api.get(`/staff/ido-profil/${user_id}`)
    return response.data
  },
}

export default api