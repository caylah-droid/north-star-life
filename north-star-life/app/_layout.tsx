import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { C } from '../lib/theme';

export default function RootLayout() {
  const { loadProfile, loadTodayLog, setLoggedIn } = useStore();
  const [authReady, setAuthReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    // Load fonts manually — more reliable in preview builds
    Font.loadAsync({
  Marcellus_400Regular: require('@expo-google-fonts/marcellus/400Regular/Marcellus_400Regular.ttf'),
  Raleway_400Regular: require('@expo-google-fonts/raleway/400Regular/Raleway_400Regular.ttf'),
  Raleway_600SemiBold: require('@expo-google-fonts/raleway/600SemiBold/Raleway_600SemiBold.ttf'),
  Raleway_700Bold: require('@expo-google-fonts/raleway/700Bold/Raleway_700Bold.ttf'),
  DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
  DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
  CinzelDecorative_400Regular: require('@expo-google-fonts/cinzel-decorative/400Regular/CinzelDecorative_400Regular.ttf'),
}).catch(() => {}).finally(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile()
          .then(() => loadTodayLog())
          .then(() => {
            setLoggedIn(true);
            setAuthReady(true);
            router.replace('/(tabs)');
          })
          .catch(() => {
            setAuthReady(true);
            router.replace('/(auth)/login');
          });
      } else {
        setAuthReady(true);
        router.replace('/(auth)/login');
      }
    }).catch(() => {
      setAuthReady(true);
      router.replace('/(auth)/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadProfile().catch(() => {});
          await loadTodayLog().catch(() => {});
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

  if (!fontsReady || !authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg0, alignItems: 'center', justifyContent: 'center' }}>
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
        <Stack.Screen name="debrief" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}