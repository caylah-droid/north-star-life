import { useEffect } from 'react';
import { Stack, SplashScreen, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadProfile, setLoggedIn, setLoading } = useStore();

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
    if (!fontsLoaded) return;
    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLoggedIn(true);
        loadProfile().then(() => {
          router.replace('/(tabs)');
        });
      } else {
        router.replace('/(auth)/login');
      }
    });

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setLoggedIn(true);
          await loadProfile();
          router.replace('/(tabs)');
        } else if (event === 'SIGNED_OUT') {
          setLoggedIn(false);
          router.replace('/(auth)/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="debrief" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
