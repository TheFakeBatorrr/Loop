// ============================================================
// USER / AUTH
// ============================================================

export type UserRole = 'Student' | 'Idos' | 'President' | 'Admin' | 'Graduated'

export interface User {
  id: number
  email: string
  role: string
  // /me endpoint adja vissza — class adatok a students táblából jönnek
  class_number?: number | null
  class_letter?: string | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

// ============================================================
// EVENTS
// ============================================================

export type EventType = 'ido_only' | 'ido_school' | 'school_ido' | 'external'
export type EventStatus = 'draft' | 'staff_gathering' | 'pending_review' | 'published' | 'ended'

export interface Event {
  id: number
  name: string
  type: EventType
  status: EventStatus
  topic: string
  target_audience: string
  date: string
  location: string
  max_capacity: number
  visibility: string
  created_by: number
}

// ============================================================
// ARCHÍVUM — /api/esemeny/archivum response
// ============================================================

export interface ArchivedEvent {
  id: number
  name: string
  type: EventType
  topic: string
  date: string
  location: string
  max_capacity: number
  target_audience: string
  main_organiser_name: string | null
  main_organiser_class_number: number | null
  main_organiser_class_letter: string | null
  avg_rating: string | null
  review_count: number
  // Csak elnöknek jön vissza
  revenue?: string | null
  expanses?: string | null
}

// ============================================================
// STAFF — staffs tábla
// ============================================================

export interface StaffApplication {
  id: number
  staff_user_id: number
  staff_event_id: number
  role: string           // 'szervező' | 'főszervező'
  accepted: boolean | null
}

// ============================================================
// PROFIL — /api/staff/ido-profil/:id response
// ============================================================

export interface IdoEsemeny {
  id: number
  name: string
  date: string
  location?: string
  user_event_role: string  // 'szervező' | 'főszervező'
}

// ============================================================
// NAVIGÁCIÓ
// ============================================================

export type RootStackParamList = {
  Login: undefined
  Main: undefined
}

export type MainTabParamList = {
  Gathering: undefined
  Archivum: undefined
  Profil: undefined
}