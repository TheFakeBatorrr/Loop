import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import api from '../services/api'

// ============================================================
// TÍPUSOK
// ============================================================

type EventType = 'ido_only' | 'ido_school'
type Visibility = 'public' | 'ido_only'

// ============================================================
// SEGÉDEK
// ============================================================

const colors = {
  bg: '#0a0a0a',
  surface: '#111111',
  border: '#222222',
  primary: '#6034e3',
  primaryLight: '#8643eb',
  text: '#F0EDE8',
  textSecondary: '#8A8480',
  textMuted: '#4A4744',
  error: '#ef4444',
  white: '#ffffff',
}

const temak = [
  'Sport', 'Kultúra', 'Tanulmány', 'Továbbtanulás',
  'Iskolai élet', 'Szórakozás', 'Csapatépítés', 'Egyéb',
]

const celcsoportok = [
  'Minden diák', '9. évfolyam', '10. évfolyam', '11. évfolyam',
  '12. évfolyam', '13. évfolyam', 'Info tech', 'Gazd tech',
  'Reál', 'Humán', 'Kéttannyelvű',
]

// ============================================================
// SELECT ROW — vízszintes chip választó
// ============================================================

function SelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
  labelMap,
}: {
  label: string
  options: T[]
  value: T | string
  onChange: (v: T) => void
  labelMap?: Record<string, string>
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, value === opt && styles.chipActive]}
              onPress={() => onChange(opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>
                {labelMap ? labelMap[opt] : opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

// ============================================================
// MODAL
// ============================================================

interface Props {
  visible: boolean
  onClose: () => void
  onCreated: () => void
  userId: number
}

export default function UjEsemenyModal({ visible, onClose, onCreated, userId }: Props) {
  const [nev, setNev] = useState('')
  const [tema, setTema] = useState('')
  const [tipus, setTipus] = useState<EventType>('ido_only')
  const [lathatosag, setLathatosag] = useState<Visibility>('ido_only')
  const [celcsoport, setCelcsoport] = useState('')
  const [datum, setDatum] = useState('')
  const [maxLetszam, setMaxLetszam] = useState('')
  const [helyszin, setHelyszin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = nev !== '' && tema !== '' && celcsoport !== '' &&
    datum !== '' && helyszin !== '' && maxLetszam !== ''

  const resetForm = () => {
    setNev(''); setTema(''); setTipus('ido_only'); setLathatosag('ido_only')
    setCelcsoport(''); setDatum(''); setMaxLetszam(''); setHelyszin('')
    setError(null)
  }

  const handleClose = () => { resetForm(); onClose() }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      await api.post('/esemeny', {
        name: nev,
        topic: tema,
        type: tipus,
        target_audience: celcsoport,
        date: datum,
        location: helyszin,
        max_capacity: parseInt(maxLetszam),
        visibility: lathatosag,
        status: 'draft',
        created_by: userId,
      })
      resetForm()
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Hiba történt az esemény létrehozásakor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.root}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Új esemény</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Név */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>NÉV</Text>
            <TextInput
              style={styles.input}
              placeholder="pl. Gólyabál 2026"
              placeholderTextColor={colors.textMuted}
              value={nev}
              onChangeText={setNev}
            />
          </View>

          {/* Téma */}
          <SelectRow label="TÉMA" options={temak} value={tema} onChange={setTema} />

          {/* Típus */}
          <SelectRow
            label="TÍPUS"
            options={['ido_only', 'ido_school'] as EventType[]}
            value={tipus}
            onChange={setTipus}
            labelMap={{ ido_only: 'Csak IDÖ', ido_school: 'IDÖ + Iskolai' }}
          />

          {/* Láthatóság */}
          <SelectRow
            label="LÁTHATÓSÁG"
            options={['ido_only', 'public'] as Visibility[]}
            value={lathatosag}
            onChange={setLathatosag}
            labelMap={{ ido_only: 'Csak IDÖ', public: 'Publikus' }}
          />

          {/* Célcsoport */}
          <SelectRow label="CÉLCSOPORT" options={celcsoportok} value={celcsoport} onChange={setCelcsoport} />

          {/* Dátum */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>DÁTUM</Text>
            <TextInput
              style={styles.input}
              placeholder="ÉÉÉÉ-HH-NN"
              placeholderTextColor={colors.textMuted}
              value={datum}
              onChangeText={setDatum}
            />
          </View>

          {/* Helyszín + Max létszám */}
          <View style={styles.rowFields}>
            <View style={[styles.fieldWrapper, { flex: 2 }]}>
              <Text style={styles.fieldLabel}>HELYSZÍN</Text>
              <TextInput
                style={styles.input}
                placeholder="pl. Aula"
                placeholderTextColor={colors.textMuted}
                value={helyszin}
                onChangeText={setHelyszin}
              />
            </View>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>MAX FŐ</Text>
              <TextInput
                style={styles.input}
                placeholder="200"
                placeholderTextColor={colors.textMuted}
                value={maxLetszam}
                onChangeText={setMaxLetszam}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Gombok */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Mégse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              {loading
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={styles.submitBtnText}>Létrehozás</Text>
              }
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </Modal>
  )
}

// ============================================================
// STÍLUSOK
// ============================================================

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  closeBtn: { padding: 4 },
  content: { padding: 24, gap: 20, paddingBottom: 40 },
  errorBox: { backgroundColor: '#2a0f0f', borderWidth: 1, borderColor: '#7f1d1d', borderRadius: 10, padding: 12 },
  errorText: { color: colors.error, fontSize: 13 },
  fieldWrapper: { gap: 8 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.5, color: colors.textMuted, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.text,
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: '#1a1030' },
  chipText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.primaryLight },
  rowFields: { flexDirection: 'row', gap: 12 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: colors.white },
})