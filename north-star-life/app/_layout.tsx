import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../lib/store';

// TEMP: Hardcoded profile for development — remove when auth is ready
const DEV_PROFILE = {
  id: 'dev-user',
  name: 'Caylah',
  theme: 'c' as const,
  partner_id: null,
  streak: 7,
  longest_streak: 12,
  xp: 340,
  september_date: '2025-09-01',
  income_current: 45000,
  income_target: 100000,
  savings_current: 80000,
  identity_statement: 'explores the world freely, builds income online, and creates a life rich in experiences.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEV_LOG = {
  id: 'dev-log',
  user_id: 'dev-user',
  date: new Date().toISOString().split('T')[0],
  move: false,
  nourish: false,
  mind: false,
  build: false,
  all_complete: false,
  xp_earned: 0,
  miss_reasons: [],
  story_line: '',
  win_log: '',
  created_at: new Date().toISOString(),
};

export default function RootLayout() {
  const { setProfile, setTodayLog, setLoggedIn } = useStore();

  useEffect(() => {
    setProfile(DEV_PROFILE);
    setTodayLog(DEV_LOG);
    setLoggedIn(true);
    // Wait for Root Layout to mount before navigating
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="debrief" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}
