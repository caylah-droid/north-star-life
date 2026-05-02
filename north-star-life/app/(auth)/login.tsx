import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { C } from '../../lib/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('', 'Enter your email and password.');
      return;
    }
    setLoading(true);

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      Alert.alert('', error.message);
      return;
    }

    if (mode === 'signup') {
      // New user → onboarding
      router.replace('/onboarding');
    }
    // Login → _layout handles redirect
  }

  return (
    <LinearGradient colors={[C.bg0, C.bg1, C.bg2]} style={styles.container}>
      {/* Star field — lightweight */}
      {STARS.map((s, i) => (
        <View key={i} style={[styles.star, { top: s.top, left: s.left, opacity: s.opacity, width: s.size, height: s.size, borderRadius: s.size }]} />
      ))}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo / wordmark */}
        <View style={styles.header}>
          <Text style={styles.star_char}>✦</Text>
          <Text style={styles.title}>North Star Life</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Welcome back.' : 'The journey begins.'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={C.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={C.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={C.bg0} />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Enter' : 'Begin'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? "First time? Create account"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Simple star data — pre-computed, no animation lib needed at auth screen
const STARS = Array.from({ length: 40 }, (_, i) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  opacity: 0.1 + Math.random() * 0.5,
  size: i % 4 === 0 ? 2.5 : 1.5,
}));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  star_char: {
    fontSize: 28,
    color: C.accent,
    marginBottom: 12,
    textShadowColor: C.accentGlow,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontFamily: 'Marcellus_400Regular',
    fontSize: 28,
    color: C.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 0.5,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: 'Raleway_400Regular',
    fontSize: 15,
    color: C.textPrimary,
  },
  button: {
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: C.accentGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    color: C.bg0,
    letterSpacing: 1.5,
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 13,
    color: C.textMuted,
  },
});
