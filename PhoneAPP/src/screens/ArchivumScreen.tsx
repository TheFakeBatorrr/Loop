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
  Modal,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ============================================================
// TÍPUSOK — valós API struktúra alapján
// ============================================================

type EventType = 'ido_only' | 'ido_school' | 'school_ido' | 'external'

interface ArchivedEvent {
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
  // Elnök látja ezeket
  revenue?: string | null
  expanses?: string | null
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
}

// ============================================================
// DETAIL MODAL
// ============================================================

function DetailModal({
  event,
  visible,
  onClose,
  isElnok,
}: {
  event: ArchivedEvent | null
  visible: boolean
  onClose: () => void
  isElnok: boolean
}) {
  if (!event) return null

  const accentColor = isElnok ? colors.primaryLight : colors.primary
  const rating = event.avg_rating ? Number(event.avg_rating) : null

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={modal.header}>
            <Text style={modal.title}>{event.name}</Text>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Típus badge */}
          <View style={[modal.typeBadge, { borderColor: accentColor, backgroundColor: `${accentColor}18` }]}>
            <Text style={[modal.typeBadgeText, { color: accentColor }]}>{typeLabel[event.type]}</Text>
          </View>

          {/* Meta */}
          <View style={modal.metaBlock}>
            <View style={modal.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={modal.metaText}>{event.date}</Text>
            </View>
            <View style={modal.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={modal.metaText}>{event.location}</Text>
            </View>
            <View style={modal.metaRow}>
              <Ionicons name="people-outline" size={14} color={colors.textMuted} />
              <Text style={modal.metaText}>{event.target_audience} · max {event.max_capacity} fő</Text>
            </View>
          </View>

          {/* Főszervező */}
          <View style={modal.section}>
            <Text style={modal.sectionLabel}>FŐSZERVEZŐ</Text>
            <Text style={modal.sectionValue}>
              {event.main_organiser_name
                ? `${event.main_organiser_name}`
                : '—'}
            </Text>
          </View>

          {/* Értékelés */}
          <View style={modal.section}>
            <Text style={modal.sectionLabel}>ÉRTÉKELÉS</Text>
            {rating ? (
              <View style={modal.ratingRow}>
                <Text style={modal.ratingValue}>★ {rating.toFixed(1)}</Text>
                <Text style={modal.ratingCount}>({event.review_count} értékelés)</Text>
              </View>
            ) : (
              <Text style={modal.sectionValue}>Nincs értékelés</Text>
            )}
          </View>

          {/* Elnök: pénzügyek */}
          {isElnok && (event.revenue !== undefined || event.expanses !== undefined) && (
            <View style={modal.section}>
              <Text style={modal.sectionLabel}>PÉNZÜGYEK</Text>
              <View style={modal.financeGrid}>
                <View style={modal.financeItem}>
                  <Text style={modal.financeLabel}>Bevétel</Text>
                  <Text style={[modal.financeValue, { color: colors.success }]}>
                    {event.revenue ?? '—'}
                  </Text>
                </View>
                <View style={modal.financeItem}>
                  <Text style={modal.financeLabel}>Kiadás</Text>
                  <Text style={[modal.financeValue, { color: colors.error }]}>
                    {event.expanses ?? '—'}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </View>
    </Modal>
  )
}

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingTop: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, flex: 1, paddingRight: 12 },
  closeBtn: { padding: 4 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, marginBottom: 20 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  metaBlock: { gap: 8, marginBottom: 24 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 14, color: colors.textSecondary },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 9, letterSpacing: 2, color: colors.textMuted, fontWeight: '700', marginBottom: 6 },
  sectionValue: { fontSize: 14, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingValue: { fontSize: 20, fontWeight: '800', color: colors.warning },
  ratingCount: { fontSize: 13, color: colors.textMuted },
  financeGrid: { flexDirection: 'row', gap: 12 },
  financeItem: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 14, alignItems: 'center' },
  financeLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  financeValue: { fontSize: 18, fontWeight: '800' },
})

// ============================================================
// ARCHÍVUM KÁRTYA
// ============================================================

function ArchivumKartya({
  event,
  isElnok,
  onPress,
}: {
  event: ArchivedEvent
  isElnok: boolean
  onPress: () => void
}) {
  const accentColor = isElnok ? colors.primaryLight : colors.primary
  const rating = event.avg_rating ? Number(event.avg_rating) : null

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={[styles.topicBadge, { borderColor: accentColor, backgroundColor: `${accentColor}15` }]}>
          <Text style={[styles.topicBadgeText, { color: accentColor }]}>{event.topic}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>

      <Text style={styles.cardTitle}>{event.name}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
        <Text style={styles.metaText}>{event.date}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
        <Text style={styles.metaText}>{event.location}</Text>
      </View>

      <View style={styles.cardBottom}>
        {event.main_organiser_name && (
          <View style={styles.organiserRow}>
            <Ionicons name="star" size={11} color={colors.warning} />
            <Text style={styles.organiserText}>{event.main_organiser_name}</Text>
          </View>
        )}
        {rating && (
          <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

// ============================================================
// FŐSCREEN
// ============================================================

export default function ArchivumScreen() {
  const { user } = useAuth()
  const isElnok = String(user?.role) === 'President'
  const accentColor = isElnok ? colors.primaryLight : colors.primary

  const [events, setEvents] = useState<ArchivedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ArchivedEvent | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const res = await api.get('/esemeny/archivum')
      setEvents(res.data)
    } catch {
      setError('Nem sikerült betölteni az archívumot.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>IDÖ</Text>
          <Text style={styles.headerTitle}>Archívum</Text>
        </View>
        {!loading && (
          <Text style={styles.countText}>{events.length} esemény</Text>
        )}
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
              onRefresh={() => { setRefreshing(true); fetchData() }}
              tintColor={accentColor}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="archive-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyText}>Az archívum üres</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ArchivumKartya
              event={item}
              isElnok={isElnok}
              onPress={() => setSelected(item)}
            />
          )}
        />
      )}

      <DetailModal
        event={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        isElnok={isElnok}
      />
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
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSub: { fontSize: 10, letterSpacing: 2.5, color: colors.textMuted, fontWeight: '700' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  countText: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },

  list: { padding: 16, gap: 10, paddingBottom: 32 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topicBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  topicBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: colors.textMuted },
  metaDot: { fontSize: 12, color: colors.textMuted },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  organiserRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  organiserText: { fontSize: 12, color: colors.textSecondary },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.warning },

  errorText: { color: colors.error, fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textMuted },
})