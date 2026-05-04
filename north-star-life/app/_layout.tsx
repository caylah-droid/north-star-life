import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { C } from '../lib/theme';

export default function RootLayout() {
  const { loadProfile, loadTodayLog, setLoggedIn } = useStore();
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stage, setStage] = useState('starting');

  useEffect(() => {
    async function init() {
      try {
        setStage('loading fonts');
        await Font.loadAsync({
          Marcellus_400Regular: require('@expo-google-fonts/marcellus/400Regular/Marcellus_400Regular.ttf'),
          Raleway_400Regular: require('@expo-google-fonts/raleway/400Regular/Raleway_400Regular.ttf'),
          Raleway_600SemiBold: require('@expo-google-fonts/raleway/600SemiBold/Raleway_600SemiBold.ttf'),
          Raleway_700Bold: require('@expo-google-fonts/raleway/700Bold/Raleway_700Bold.ttf'),
          DMSans_400Regular: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
          DMSans_500Medium: require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
          CinzelDecorative_400Regular: require('@expo-google-fonts/cinzel-decorative/400Regular/CinzelDecorative_400Regular.ttf'),
        });
        setStage('fonts done');
      } catch (e: any) {
        setStage('font error');
        setErrorMsg(`FONT ERROR: ${e?.message ?? String(e)}`);
        return;
      }

      try {
        setStage('checking auth');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setStage('auth checked');

        if (session) {
          setStage('loading profile');
          await loadProfile();
          setStage('loading log');
          await loadTodayLog();
          setLoggedIn(true);
          setReady(true);
          router.replace('/(tabs)');
        } else {
          setReady(true);
          router.replace('/(auth)/login');
        }
      } catch (e: any) {
        setErrorMsg(`AUTH ERROR at stage [${stage}]: ${e?.message ?? String(e)}`);
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

  if (errorMsg) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#04111A' }}
        contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <Text style={{ color: '#FF6B6B', fontSize: 16, marginBottom: 12 }}>
          CRASH DETAILS:
        </Text>
        <Text style={{ color: '#ffffff', fontSize: 12, lineHeight: 20 }}>
          {errorMsg}
        </Text>
        <Text style={{ color: '#2A7A8A', fontSize: 12, marginTop: 20 }}>
          Stage: {stage}
        </Text>
      </ScrollView>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg0, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color={C.accent} size="small" />
        <Text style={{ color: C.textMuted, fontSize: 11, letterSpacing: 1 }}>
          {stage.toUpperCase()}
        </Text>
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