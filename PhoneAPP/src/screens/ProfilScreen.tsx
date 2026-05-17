import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ============================================================
// TÍPUSOK — /api/staff/ido-profil/:id response alapján
// ============================================================

interface IdoEsemeny {
  id: number
  name: string
  date: string
  location?: string
  user_event_role: string  // 'szervező' | 'főszervező'
}

// ============================================================
// SEGÉDEK
// ============================================================

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
  warning: '#f59e0b',
  success: '#4A9E6B',
}

const roleLabel: Record<string, string> = {
  Student: 'Diák',
  Idos: 'IDÖ Tag',
  President: 'IDÖ Elnök',
  Admin: 'Admin',
  Graduated: 'Végzett',
}

// ============================================================
// ESEMÉNY SOR
// ============================================================

function EsemenyRow({ item }: { item: IdoEsemeny }) {
  const isFo = item.user_event_role === 'főszervező'
  const color = isFo ? colors.warning : colors.primary

  return (
    <View style={styles.esemenyRow}>
      <View style={[styles.esemenyIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={isFo ? 'star' : 'person'} size={13} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.esemenyNev}>{item.name}</Text>
        <Text style={styles.esemenyMeta}>{item.date}</Text>
      </View>
      <View style={[styles.tipusBadge, { borderColor: color, backgroundColor: `${color}15` }]}>
        <Text style={[styles.tipusBadgeText, { color }]}>
          {isFo ? 'FŐSZERVEZŐ' : 'SZERVEZŐ'}
        </Text>
      </View>
    </View>
  )
}

// ============================================================
// FŐSCREEN
// ============================================================

export default function ProfilScreen() {
  const { user, logout } = useAuth()
  const isElnok = user?.role === 'President'
  const accentColor = isElnok ? colors.primaryLight : colors.primary

  const [esemenyek, setEsemenyek] = useState<IdoEsemeny[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setError(null)
    try {
      const res = await api.get(`/staff/ido-profil/${user.id}`)
      setEsemenyek(res.data)
    } catch {
      setError('Nem sikerült betölteni az eseményeket.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => { fetchData() }, [])

  const handleLogout = () => {
    // Alert weben nem működik jól, inline confirm helyett egyből logout
    logout()
  }

  const szervezoCount = esemenyek.filter(e => e.user_event_role === 'szervező').length
  const foszervezoCount = esemenyek.filter(e => e.user_event_role === 'főszervező').length

  // Osztály megjelenítése — DB-ből class_number + class_letter jön
  const osztalyStr = user?.class_number && user?.class_letter
    ? `${user.class_number}.${user.class_letter}`
    : null

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData() }}
            tintColor={accentColor}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>IDÖ</Text>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.profileCard}>
          <View style={[styles.avatarRing, { borderColor: accentColor }]}>
            <View style={[styles.avatar, { backgroundColor: `${accentColor}22` }]}>
              <Text style={[styles.avatarInitial, { color: accentColor }]}>
                {user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.email}</Text>

          {osztalyStr && (
            <View style={styles.osztalyRow}>
              <Ionicons name="school-outline" size={13} color={colors.textMuted} />
              <Text style={styles.osztalyText}>{osztalyStr}</Text>
            </View>
          )}

          <View style={[styles.roleBadge, { borderColor: accentColor, backgroundColor: `${accentColor}15` }]}>
            <Ionicons name={isElnok ? 'shield' : 'people'} size={12} color={accentColor} />
            <Text style={[styles.roleBadgeText, { color: accentColor }]}>
              {roleLabel[user?.role ?? ''] ?? user?.role}
            </Text>
          </View>
        </View>

        {/* Statisztikák */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: accentColor }]}>
            <Text style={[styles.statValue, { color: accentColor }]}>{esemenyek.length}</Text>
            <Text style={styles.statLabel}>Összes</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: colors.primary }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{szervezoCount}</Text>
            <Text style={styles.statLabel}>Szervező</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: colors.warning }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{foszervezoCount}</Text>
            <Text style={styles.statLabel}>Főszervező</Text>
          </View>
        </View>

        {/* Események */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SZERVEZETT ESEMÉNYEK</Text>

          {loading ? (
            <ActivityIndicator size="small" color={accentColor} style={{ marginTop: 16 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : esemenyek.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>Még nem voltál szervező</Text>
            </View>
          ) : (
            <View style={styles.esemenyList}>
              {esemenyek.map(e => <EsemenyRow key={e.id} item={e} />)}
            </View>
          )}
        </View>

        {/* Fiók */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FIÓK</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
        </View>

        {/* Kijelentkezés gomb */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtnFull} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color={colors.error} />
            <Text style={styles.logoutBtnText}>Kijelentkezés</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionNote}>Boundless · Insider 1.0</Text>
      </ScrollView>
    </View>
  )
}

// ============================================================
// STÍLUSOK
// ============================================================

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

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
  logoutBtn: { padding: 8, marginBottom: 2 },

  // Avatar
  profileCard: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  avatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 28, fontWeight: '800' },
  userName: { fontSize: 18, fontWeight: '700', color: colors.text },
  osztalyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  osztalyText: { fontSize: 13, color: colors.textMuted },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, marginTop: 4 },
  roleBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, alignItems: 'center', borderTopWidth: 2, gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { fontSize: 9, letterSpacing: 2, color: colors.textMuted, fontWeight: '700', marginBottom: 10 },

  // Esemény lista
  esemenyList: { backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' },
  esemenyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  esemenyIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  esemenyNev: { fontSize: 13, fontWeight: '600', color: colors.text },
  esemenyMeta: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  tipusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  tipusBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },

  emptyEvents: { alignItems: 'center', paddingVertical: 24, gap: 8, backgroundColor: colors.card, borderRadius: 12 },
  emptyText: { fontSize: 13, color: colors.textMuted },

  // Info sor
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 10, padding: 14 },
  infoText: { fontSize: 13, color: colors.textSecondary },

  // Logout gomb
  logoutBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: `${colors.error}44`, borderRadius: 10, padding: 13, backgroundColor: `${colors.error}0f` },
  logoutBtnText: { fontSize: 14, fontWeight: '700', color: colors.error },

  errorText: { color: colors.error, fontSize: 13 },
  versionNote: { textAlign: 'center', fontSize: 11, color: colors.textMuted, paddingBottom: 32, paddingTop: 8 },
})