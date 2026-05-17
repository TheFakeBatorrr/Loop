import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '../context/AuthContext'
import { RootStackParamList, MainTabParamList } from '../types'

import LoginScreen from '../screens/LoginScreen'
import GatheringScreen from '../screens/GatheringScreen'
import ArchivumScreen from '../screens/ArchivumScreen'
import ProfilScreen from '../screens/ProfilScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

// Boundless lila — megegyezik a webes branddel
const PURPLE = '#6034e3'
const PURPLE_LIGHT = '#8643eb'
const BG_SURFACE = '#111111'
const BORDER = '#222222'
const MUTED = '#4A4744'

function MainTabs() {
  const { user } = useAuth()

  // DB-ben 'President' és 'Idos' — nem 'elnok'/'tag'
  const isElnok = String(user?.role) === 'President'
  const accentColor = isElnok ? PURPLE_LIGHT : PURPLE

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // Tab bar stílus — nagyobb magasság, több hely a feliratoknak
        tabBarStyle: {
          backgroundColor: BG_SURFACE,
          borderTopColor: BORDER,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'web' ? 12 : 20,
          height: Platform.OS === 'web' ? 64 : 80,
        },
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.8,
          marginTop: 4,
        },

        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Gathering') {
            iconName = 'calendar-outline'
          } else if (route.name === 'Archivum') {
            iconName = 'archive-outline'
          } else {
            iconName = 'person-outline'
          }

          return <Ionicons name={iconName} size={22} color={color} />
        },
      })}
    >
      <Tab.Screen
        name="Gathering"
        component={GatheringScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="Archivum"
        component={ArchivumScreen}
        options={{ tabBarLabel: 'Archívum' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
})