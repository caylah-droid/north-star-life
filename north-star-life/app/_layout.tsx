import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import {
  useFonts,
  Marcellus_400Regular,
} from '@expo-google-fonts/marcellus';
import {
  Raleway_400Regular,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  CinzelDecorative_400Regular,
} from '@expo-google-fonts/cinzel-decorative';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { C } from '../lib/theme';

export default function RootLayout() {
  const { loadProfile, loadTodayLog, setLoggedIn } = useStore();
  const [authReady, setAuthReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Marcellus_400Regular,
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    CinzelDecorative_400Regular,
  });

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile().then(() => {
          loadTodayLog().then(() => {
            setLoggedIn(true);
            setAuthReady(true);
            router.replace('/(tabs)');
          });
        });
      } else {
        setAuthReady(true);
        router.replace('/(auth)/login');
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadProfile();
          await loadTodayLog();
          setLoggedIn(true);
          router.replace('/(tabs)');
        } else if (event === 'SIGNED_OUT') {
          setLoggedIn(false);
          router.replace('/(auth)/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Block render until fonts + auth both ready
  if (!fontsLoaded || !authReady) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: C.bg0,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator color={C.accent} size="small" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="debrief"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}
