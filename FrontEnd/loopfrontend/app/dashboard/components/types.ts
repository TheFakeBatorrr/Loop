export type View = 'compact' | 'reviews' | 'staff'
export type ElnokPanel = null | 'esemenyek' | 'archivum' | 'staff'
export type IdosPanel = null | 'esemenyek' | 'archivum'
export type EventType = 'ido_only' | 'ido_school' | 'school_ido' | 'external'
export type EventStatus = 'draft' | 'staff_gathering' | 'pending_review' | 'published' | 'ended'

export type Application = {
  id: number
  ido_applys_users_id: number
  motivation: string
  experince: string
  accepted: 'Pending' | 'Accepted' | 'Rejected'
  name: string
  class_number: number
  class_letter: string
}

export type Event = {
  id: number
  name: string
  type: EventType
  topic: string
  target_audience: string
  date: string
  location: string
  max_capacity: number
  status: EventStatus
  visibility: 'public' | 'ido_only'
  created_by: number
}


export type ArchivedEvent = {
  id: number,
  name: string,
  type: EventType,
  topic: string,
  date: string,
  location: string,
  max_capacity: number,
  target_audience: string,
  visibility: string,
  ido_event_id: number,
  revenue: string | null,
  expanses: string | null,
  main_organiser_id: number | null,
  main_organiser_name: string | null,
  main_organiser_class_number: number | null,
  main_organiser_class_letter: string | null,
  avg_rating: string,
  review_count: number
}

export type Member = {
  id: number
  email: string
  name: string
  class_number: number
  class_letter: string
}

export type StaffApplication = {
  id: number
  staff_user_id: number
  staff_event_id: number
  role: string
  accepted: boolean
}

export type StaffApplicant = {
  id: number
  staff_user_id: number
  staff_event_id: number
  role: string
  accepted: boolean
  name: string
  class_number: number
  class_letter: string
}

export const statusLabel: Record<EventStatus, string> = {
  draft: 'Tervezet',
  staff_gathering: 'Staff gyűjtés',
  pending_review: 'Jóváhagyásra vár',
  published: 'Publikált',
  ended: 'Lezárt',
}

export const statusColor: Record<EventStatus, string> = {
  draft: 'bg-gray-400/20 text-gray-200',
  staff_gathering: 'bg-blue-400/20 text-blue-300',
  pending_review: 'bg-yellow-400/20 text-yellow-300',
  published: 'bg-green-400/20 text-green-300',
  ended: 'bg-red-400/20 text-red-300',
}

export const typeLabel: Record<EventType, string> = {
  ido_only: 'Csak IDÖ',
  ido_school: 'IDÖ + Iskolai',
  school_ido: 'Iskolai + IDÖ',
  external: 'Külsős',
}
