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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      // Load fonts first — everything depends on this
      try {
        await Font.loadAsync({
          Marcellus_400Regular: require('@expo-google-fonts/marcellus/400Regular/Marcellus_400Regular.ttf'),
          Raleway_400Regular: require('@expo-google-fonts/raleway/400Regular/Raleway_400Regular.ttf'),
          Raleway_600SemiBold: require('@expo-google-fonts/raleway/600SemiBold/Raleway_600SemiBold.ttf'),
          Raleway_700Bold: require('@expo-google-fonts/raleway/700Bold/Raleway_700Bold.ttf'),
          DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
          DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
          CinzelDecorative_400Regular: require('@expo-google-fonts/cinzel-decorative/400Regular/CinzelDecorative_400Regular.ttf'),
        });
      } catch (e) {
        console.warn('Font loading failed:', e);
      }

      // Then check auth
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await loadProfile().catch(() => {});
          await loadTodayLog().catch(() => {});
          setLoggedIn(true);
          setReady(true);
          router.replace('/(tabs)');
        } else {
          setReady(true);
          router.replace('/(auth)/login');
        }
      } catch (e) {
        setReady(true);
        router.replace('/(auth)/login');
      }
    }

    init();

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

  if (!ready) {
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