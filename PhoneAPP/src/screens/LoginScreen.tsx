'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useAuth } from '../context/AuthContext'

// ============================================================
// DESIGN TOKENEK — Boundless lila téma
// ============================================================

const colors = {
  bg: '#0a0a0a',
  surface: '#111111',
  border: '#222222',
  borderFocus: '#8643eb',
  primary: '#6034e3',
  textPrimary: '#F0EDE8',
  textSecondary: '#8A8480',
  textMuted: '#4A4744',
  error: '#ef4444',
  white: '#ffffff',
}

// ============================================================
// LOGIN SCREEN
// ============================================================

export default function LoginScreen() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)

  const canSubmit = email.trim() !== '' && password.trim() !== ''

  const handleLogin = async () => {
    if (!canSubmit) {
      setError('Kérlek töltsd ki az összes mezőt.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await login(email.trim(), password)
    } catch (err: any) {
        if(err?.message == 'NO_ACCESS')
        {
          setError('Ez az alkalmazás kizárólag IDÖ tagok számára érhető el!');
        }
        else
        {
          setError(err?.response?.data?.message || 'Sikertelen bejelentkezés!')
        }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.inner}>

        {/* ── Logo ── */}
        <View style={styles.brandArea}>
          <View style={styles.logoRing}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.appName}>Boundless</Text>
          <View style={styles.insiderBadge}>
            <Text style={styles.insiderBadgeText}>INSIDER 1.0</Text>
          </View>
          <Text style={styles.tagline}>Staff Portal</Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>

          {/* Hibaüzenet */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="email@iskola.hu"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              editable={!loading}
            />
          </View>

          {/* Jelszó */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>JELSZÓ</Text>
            <TextInput
              style={[styles.input, passFocused && styles.inputFocused]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              editable={!loading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
          </View>

          {/* Belépés gomb */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              (!canSubmit || loading) && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.loginBtnText}>BELÉPÉS</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Ez az alkalmazás kizárólag IDÖ tagok számára érhető el.
        </Text>

      </View>
    </KeyboardAvoidingView>
  )
}

// ============================================================
// STÍLUSOK
// ============================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 32,
  },

  // Brand
  brandArea: {
    alignItems: 'center',
    gap: 8,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#6034e3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1030',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#8643eb',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  insiderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6034e3',
    backgroundColor: '#1a1030',
  },
  insiderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: '#8643eb',
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 1.5,
    fontWeight: '400',
  },

  // Form
  form: {
    gap: 16,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: '#1a1030',
  },

  // Error
  errorBox: {
    backgroundColor: '#2a0f0f',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
  },

  // Gomb
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginBtnDisabled: {
    opacity: 0.45,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: colors.white,
  },

  // Footer
  footer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
})