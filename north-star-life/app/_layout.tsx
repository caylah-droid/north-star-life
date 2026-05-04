import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // No fonts, no supabase, no store — just navigate
    setTimeout(() => {
      setReady(true);
      router.replace('/(auth)/login');
    }, 500);
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#04111A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#00D4DC" size="small" />
        <Text style={{ color: '#00D4DC', marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="debrief" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}