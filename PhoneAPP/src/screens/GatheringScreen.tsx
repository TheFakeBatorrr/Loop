import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import UjEsemenyModal from '../components/UjEsemenyModal'

// ============================================================
// TÍPUSOK
// ============================================================

type EventType = 'ido_only' | 'ido_school' | 'school_ido' | 'external'

interface Event {
  id: number
  name: string
  type: EventType
  status: string
  topic: string
  target_audience: string
  date: string
  location: string
  max_capacity: number
  visibility: string
  created_by: number
}

interface StaffApplicant {
  id: number
  staff_user_id: number
  staff_event_id: number
  role: string
  accepted: number | null
  name: string
  class_number: number
  class_letter: string
}

interface StaffApplication {
  id: number
  staff_user_id: number
  staff_event_id: number
  role: string
  accepted: number | null
}

// ============================================================
// SEGÉDEK
// ============================================================

const typeLabel: Record<EventType, string> = {
  ido_only: 'Csak IDÖ',
  ido_school: 'IDÖ + Iskolai',
  school_ido: 'Iskolai + IDÖ',
  external: 'Külsős',
}

const colors = {
  bg: '#0a0a0a',
  surface: '#111111',
  card: '#161616',
  border: '#222222',
  primary: '#6034e3',
  primaryLight: '#8643eb',
  text: '#F0EDE8',
  textSecondary: '#8A8480',
  textMuted: '#4A4744',
  error: '#ef4444',
  success: '#4A9E6B',
  warning: '#f59e0b',
  white: '#ffffff',
}

// ============================================================
// STAFF JELENTKEZŐ SOR (elnök POV)
// ============================================================

function StaffJelentkezoSor({
  applicant,
  eventId,
  onUpdated,
}: {
  applicant: StaffApplicant
  eventId: number
  onUpdated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const isFo = applicant.role === 'főszervező'
  const roleColor = isFo ? colors.warning : colors.primary

  const handleAccept = async () => {
    setLoading(true)
    try {
      await api.put(`/staff/${applicant.id}`, { accepted: true })
      // Ha főszervező, beírjuk az ido_events-be is
      if (isFo) {
        await api.put(`/ido-events/${eventId}`, {
          main_organiser_id: applicant.staff_user_id,
        })
      }
      onUpdated()
    } catch {
      // silent fail — a lista refresh megmutatja az állapotot
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await api.put(`/staff/${applicant.id}`, { accepted: false })
      onUpdated()
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={staffStyles.row}>
      <View style={staffStyles.info}>
        <View style={staffStyles.nameRow}>
          <Text style={staffStyles.name}>{applicant.name}</Text>
          <View style={[staffStyles.tipusBadge, { borderColor: roleColor, backgroundColor: `${roleColor}18` }]}>
            <Text style={[staffStyles.tipusBadgeText, { color: roleColor }]}>
              {isFo ? '👑 FŐSZERVEZŐ' : 'SZERVEZŐ'}
            </Text>
          </View>
        </View>
        {applicant.accepted == 1 && (
          <Text style={[staffStyles.statusText, { color: colors.success }]}>✓ Elfogadva</Text>
        )}
        {applicant.accepted == 0 && (
          <Text style={[staffStyles.statusText, { color: colors.error }]}>✗ Elutasítva</Text>
        )}
      </View>

      {/* Csak pending jelentkezőnél mutatjuk a gombokat */}
      {applicant.accepted === null && (
        <View style={staffStyles.btnRow}>
          <TouchableOpacity
            style={staffStyles.rejectBtn}
            onPress={handleReject}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator size="small" color={colors.error} />
              : <Ionicons name="close" size={16} color={colors.error} />
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={staffStyles.acceptBtn}
            onPress={handleAccept}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Ionicons name="checkmark" size={16} color={colors.white} />
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const staffStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 13, fontWeight: '600', color: colors.text },
  tipusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  tipusBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  statusText: { fontSize: 11 },
  btnRow: { flexDirection: 'row', gap: 6 },
  rejectBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: `${colors.error}44`,
    backgroundColor: `${colors.error}11`,
    alignItems: 'center', justifyContent: 'center',
  },
  acceptBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
})

// ============================================================
// ESEMÉNY KÁRTYA
// ============================================================

function EsemenyKartya({
  event,
  userId,
  isElnok,
}: {
  event: Event
  userId: number
  isElnok: boolean
}) {
  const [open, setOpen] = useState(false)
  const [sajatJelentkezes, setSajatJelentkezes] = useState<StaffApplication | null>(null)
  const [staffList, setStaffList] = useState<StaffApplicant[]>([])
  const [loading, setLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ido_only és school_ido esetén elnök automatikusan főszervező
  const elnokAutomatikusFoszervezo =
    isElnok && (event.type === 'ido_only' || event.type === 'school_ido')

  const fetchStaff = useCallback(async () => {
    console.log('fetch staff hívás')
    try {
      const res = await api.get(`/staff/event/${event.id}`)
      console.log('fetch staff:', res.data)
      setStaffList(res.data)
    } catch {
      setStaffList([])
    }
  }, [event.id])

  // Idos elfogadott főszervező-e ezen az eventen?
  const iAmFoszervezo = !isElnok &&
    staffList.some(s => s.staff_user_id === userId && s.role === 'főszervező' && s.accepted == 1)

  // Szervező jelentkezők a főszervező kezeléséhez
  const szervezoJelentkezok = staffList.filter(s => s.role === 'szervező')

  useEffect(() => {
    if (!open) return

    if (isElnok) {
      // Elnök: csak a staff lista kell
      fetchStaff()
    } else {
      // Idos: saját jelentkezés külön endpointról + staff lista párhuzamosan
      const check = async () => {
        setCheckLoading(true)
        try {
          const results = await Promise.allSettled([
            api.get(`/staff/user/${userId}/event/${event.id}`),
            api.get(`/staff/event/${event.id}`),
          ])

          // Saját jelentkezés — 404 esetén null (nincs még jelentkezés)
          if (results[0].status === 'fulfilled') {
            setSajatJelentkezes(results[0].value.data)
          } else {
            setSajatJelentkezes(null)
          }

          // Staff lista — főszervező check és szervező kezeléshez
          if (results[1].status === 'fulfilled') {
            setStaffList(results[1].value.data)
          }
        } finally {
          setCheckLoading(false)
        }
      }
      check()
    }
  }, [open])

  const handleJelentkezes = async (role: 'szervező' | 'főszervező') => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/staff', {
        staff_user_id: userId,
        staff_event_id: event.id,
        role,
      })
      const res = await api.get(`/staff/user/${userId}/event/${event.id}`)
      setSajatJelentkezes(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Hiba történt a jelentkezés során.')
    } finally {
      setLoading(false)
    }
  }

  const accentColor = isElnok ? colors.primaryLight : colors.primary

  // Pending jelentkezők száma — badge-hez
  const pendingCount = staffList.filter(s => s.accepted === null).length

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      {/* Fejléc */}
      <TouchableOpacity style={styles.cardHeader} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{event.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{event.date}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{typeLabel[event.type]}</Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          {/* Pending badge elnöknek */}
          {isElnok && pendingCount > 0 && !open && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          )}
          {/* Automatikus főszervező badge */}
          {elnokAutomatikusFoszervezo && (
            <View style={[styles.autoBadge, { borderColor: colors.warning }]}>
              <Text style={[styles.autoBadgeText, { color: colors.warning }]}>👑 Főszervező</Text>
            </View>
          )}
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      {/* Részletek */}
      {open && (
        <View style={styles.cardBody}>
          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TÉMA</Text>
              <Text style={styles.infoValue}>{event.topic}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CÉLCSOPORT</Text>
              <Text style={styles.infoValue}>{event.target_audience}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>HELYSZÍN</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>MAX LÉTSZÁM</Text>
              <Text style={styles.infoValue}>{event.max_capacity} fő</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── ELNÖK NÉZET — minden staff ── */}
          {isElnok && (
            <View style={styles.staffBlock}>
              <Text style={styles.staffBlockTitle}>
                Staff jelentkezők
                {pendingCount > 0 && (
                  <Text style={{ color: colors.warning }}> · {pendingCount} várakozik</Text>
                )}
              </Text>
              {staffList.length === 0 ? (
                <Text style={styles.emptyStaffText}>Még nincs jelentkező</Text>
              ) : (
                staffList.map(s => (
                  <StaffJelentkezoSor
                    key={s.id}
                    applicant={s}
                    eventId={event.id}
                    onUpdated={fetchStaff}
                  />
                ))
              )}
            </View>
          )}

          {/* ── IDOS NÉZET ── */}
          {!isElnok && (
            checkLoading ? (
              <ActivityIndicator size="small" color={accentColor} />
            ) : (
              <>
                {/* Saját jelentkezés státusza vagy jelentkezés gombok */}
                {sajatJelentkezes ? (
                  <View style={[styles.statusBox, { borderColor: accentColor, backgroundColor: `${accentColor}15` }]}>
                    <Ionicons name="checkmark-circle" size={16} color={accentColor} />
                    <View>
                      <Text style={[styles.statusTitle, { color: accentColor }]}>Már jelentkeztél</Text>
                      <Text style={styles.statusSub}>
                        {sajatJelentkezes.role === 'főszervező' ? '👑 Főszervező' : 'Szervező'}
                        {' · '}
                        {sajatJelentkezes.accepted === null
                          ? 'Elbírálás alatt'
                          : sajatJelentkezes.accepted == 1
                          ? 'Elfogadva'
                          : 'Elutasítva'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    {event.type === 'ido_school' && (
                      <TouchableOpacity
                        style={[styles.applyBtn, { borderColor: colors.warning, flex: 1 }]}
                        onPress={() => handleJelentkezes('főszervező')}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="star" size={13} color={colors.warning} />
                        <Text style={[styles.applyBtnText, { color: colors.warning }]}>Főszervező</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.applyBtn, { borderColor: accentColor, flex: 1 }]}
                      onPress={() => handleJelentkezes('szervező')}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading
                        ? <ActivityIndicator size="small" color={accentColor} />
                        : <>
                            <Ionicons name="person-add-outline" size={13} color={accentColor} />
                            <Text style={[styles.applyBtnText, { color: accentColor }]}>Szervező</Text>
                          </>
                      }
                    </TouchableOpacity>
                  </View>
                )}

                {/* Főszervező: szervező jelentkezők kezelése */}
                {iAmFoszervezo && (
                  <View style={styles.staffBlock}>
                    <Text style={styles.staffBlockTitle}>
                      Szervező jelentkezők
                      {szervezoJelentkezok.filter(s => s.accepted === null).length > 0 && (
                        <Text style={{ color: colors.warning }}>
                          {' · '}{szervezoJelentkezok.filter(s => s.accepted === null).length} várakozik
                        </Text>
                      )}
                    </Text>
                    {szervezoJelentkezok.length === 0 ? (
                      <Text style={styles.emptyStaffText}>Még nincs szervező jelentkező</Text>
                    ) : (
                      szervezoJelentkezok.map(s => (
                        <StaffJelentkezoSor
                          key={s.id}
                          applicant={s}
                          eventId={event.id}
                          onUpdated={fetchStaff}
                        />
                      ))
                    )}
                  </View>
                )}
              </>
            )
          )}
        </View>
      )}
    </View>
  )
}

// ============================================================
// FŐSCREEN
// ============================================================

export default function GatheringScreen() {
  const { user } = useAuth()
  const isElnok = String(user?.role) === 'President'
  const accentColor = isElnok ? colors.primaryLight : colors.primary

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ujEsemenyModal, setUjEsemenyModal] = useState(false)

  const fetchEvents = useCallback(async () => {
    setError(null)
    try {
      const res = await api.get('/esemeny')
      const filtered = res.data.filter(
        (e: Event) => e.status === 'staff_gathering' && e.type !== 'external'
      )
      setEvents(filtered)
    } catch {
      setError('Nem sikerült betölteni az eseményeket.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>IDÖ PANEL</Text>
          <Text style={styles.headerTitle}>Staff Events</Text>
        </View>
        <View style={styles.headerRight}>
          {isElnok && (
            <>
              <View style={[styles.roleBadge, { borderColor: colors.primaryLight }]}>
                <Ionicons name="shield" size={11} color={colors.primaryLight} />
                <Text style={[styles.roleBadgeText, { color: colors.primaryLight }]}>ELNÖK</Text>
              </View>
              <TouchableOpacity
                style={styles.ujEsemenyBtn}
                onPress={() => setUjEsemenyModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={styles.ujEsemenyBtnText}>Új esemény</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchEvents() }}
              tintColor={accentColor}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nincs aktív staff gyűjtés</Text>
            </View>
          }
          renderItem={({ item }) => (
            <EsemenyKartya
              event={item}
              userId={user!.id}
              isElnok={isElnok}
            />
          )}
        />
      )}

      {isElnok && user && (
        <UjEsemenyModal
          visible={ujEsemenyModal}
          onClose={() => setUjEsemenyModal(false)}
          onCreated={fetchEvents}
          userId={user.id}
        />
      )}
    </View>
  )
}

// ============================================================
// STÍLUSOK
// ============================================================

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerSub: { fontSize: 10, letterSpacing: 2.5, color: colors.textMuted, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1, backgroundColor: '#1a1030',
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  ujEsemenyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, backgroundColor: colors.primary,
  },
  ujEsemenyBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  card: { backgroundColor: colors.card, borderRadius: 14, borderLeftWidth: 3, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: colors.textMuted },
  metaDot: { fontSize: 12, color: colors.textMuted },

  pendingBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.warning,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pendingBadgeText: { fontSize: 11, fontWeight: '800', color: colors.bg },
  autoBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, borderWidth: 1,
    backgroundColor: `${colors.warning}15`,
  },
  autoBadgeText: { fontSize: 10, fontWeight: '700' },

  cardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 12, borderTopWidth: 1, borderTopColor: colors.border },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 10 },
  infoItem: { width: '47%' },
  infoLabel: { fontSize: 9, letterSpacing: 1.5, color: colors.textMuted, fontWeight: '700', marginBottom: 2 },
  infoValue: { fontSize: 13, color: colors.text },

  // Staff blokk
  staffBlock: { gap: 2 },
  staffBlockTitle: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 6 },
  emptyStaffText: { fontSize: 13, color: colors.textMuted, paddingVertical: 8 },

  btnRow: { flexDirection: 'row', gap: 8 },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, backgroundColor: '#1a1030',
  },
  applyBtnText: { fontSize: 13, fontWeight: '700' },

  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  statusTitle: { fontSize: 13, fontWeight: '700' },
  statusSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

  errorBox: { backgroundColor: '#2a0f0f', borderWidth: 1, borderColor: '#7f1d1d', borderRadius: 10, padding: 10 },
  errorText: { color: colors.error, fontSize: 13 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textMuted },
})