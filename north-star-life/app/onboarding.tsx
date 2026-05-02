import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { C, K } from '../lib/theme';

const { width } = Dimensions.get('window');

type Step = 0 | 1 | 2 | 3;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<'c' | 'k'>('c');
  const [identity, setIdentity] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { loadProfile } = useStore();

  const t = theme === 'c' ? C : K;

  async function finish() {
    if (!name.trim()) {
      Alert.alert('', 'What should we call you?');
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        theme,
        identity_statement: identity.trim(),
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('', error.message);
      setLoading(false);
      return;
    }

    // Try to link partner
    if (partnerEmail.trim()) {
      const { data: partnerData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (
          await supabase
            .from('profiles')
            .select('id')
            .limit(1)
        ).data?.[0]?.id ?? '')
        .single();

      // Find partner by email via auth lookup — limited without admin key
      // Partner linking: user enters partner's email, we store it and link when partner logs in
      // For MVP: set partner_id manually via Supabase dashboard or via a link code (Phase 2)
    }

    await loadProfile();
    setLoading(false);
    router.replace('/(tabs)');
  }

  const steps = [
    // Step 0 — Name
    <View style={styles.stepContainer} key="name">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>WHO ARE YOU BECOMING?</Text>
      <Text style={[styles.stepTitle, { color: t.textPrimary, fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium' }]}>
        What do we call you?
      </Text>
      <TextInput
        style={[styles.input, { color: t.textPrimary, borderColor: t.cardBorder, backgroundColor: t.cardBg }]}
        placeholder="Your name"
        placeholderTextColor={t.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => setStep(1)}
      />
    </View>,

    // Step 1 — Theme selection
    <View style={styles.stepContainer} key="theme">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>YOUR FUEL</Text>
      <Text style={[styles.stepTitle, { color: t.textPrimary, fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium' }]}>
        Which element drives you?
      </Text>

      <TouchableOpacity
        style={[styles.themeCard, {
          borderColor: theme === 'c' ? C.accent : 'rgba(0,210,220,0.12)',
          backgroundColor: theme === 'c' ? 'rgba(0,212,220,0.08)' : C.cardBg,
          shadowColor: theme === 'c' ? C.accentGlow : 'transparent',
          shadowOpacity: theme === 'c' ? 1 : 0,
          shadowRadius: 12,
        }]}
        onPress={() => setTheme('c')}
        activeOpacity={0.8}
      >
        <Text style={styles.themeEmoji}>🌊</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.themeTitle, { color: C.textPrimary, fontFamily: 'Marcellus_400Regular' }]}>
            Ocean — Caylah
          </Text>
          <Text style={[styles.themeDesc, { color: C.textSecondary }]}>
            Bioluminescent · Teal glow · Pearl rings
          </Text>
        </View>
        {theme === 'c' && <Text style={{ color: C.accent, fontSize: 18 }}>✦</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.themeCard, {
          borderColor: theme === 'k' ? K.accent : 'rgba(160,180,200,0.10)',
          backgroundColor: theme === 'k' ? 'rgba(192,208,224,0.05)' : K.cardBg,
          shadowColor: theme === 'k' ? K.accentGlow : 'transparent',
          shadowOpacity: theme === 'k' ? 1 : 0,
          shadowRadius: 12,
        }]}
        onPress={() => setTheme('k')}
        activeOpacity={0.8}
      >
        <Text style={styles.themeEmoji}>⚔️</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.themeTitle, { color: K.textPrimary, fontFamily: 'DMSans_500Medium' }]}>
            Norse — Kyle
          </Text>
          <Text style={[styles.themeDesc, { color: K.textSecondary }]}>
            Dark steel · Silver runes · Shield rings
          </Text>
        </View>
        {theme === 'k' && <Text style={{ color: K.accent, fontSize: 18 }}>✦</Text>}
      </TouchableOpacity>
    </View>,

    // Step 2 — Identity statement
    <View style={styles.stepContainer} key="identity">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>ANCHOR STATEMENT</Text>
      <Text style={[styles.stepTitle, { color: t.textPrimary, fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium' }]}>
        Complete this:
      </Text>
      <Text style={[styles.identityPrompt, { color: t.textSecondary }]}>
        "I am becoming someone who..."
      </Text>
      <TextInput
        style={[styles.input, styles.identityInput, { color: t.textPrimary, borderColor: t.cardBorder, backgroundColor: t.cardBg }]}
        placeholder={
          theme === 'c'
            ? "lives freely, by the ocean, doing work she loves"
            : "earns freedom through discipline and conquest"
        }
        placeholderTextColor={t.textMuted}
        value={identity}
        onChangeText={setIdentity}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>,

    // Step 3 — Partner (optional)
    <View style={styles.stepContainer} key="partner">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>YOUR CREW</Text>
      <Text style={[styles.stepTitle, { color: t.textPrimary, fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium' }]}>
        Building with someone?
      </Text>
      <Text style={[styles.partnerNote, { color: t.textSecondary }]}>
        Optional — you can link your partner later in settings.
      </Text>
      <TextInput
        style={[styles.input, { color: t.textPrimary, borderColor: t.cardBorder, backgroundColor: t.cardBg }]}
        placeholder="Partner's email (optional)"
        placeholderTextColor={t.textMuted}
        value={partnerEmail}
        onChangeText={setPartnerEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
    </View>,
  ];

  const isLast = step === 3;

  return (
    <LinearGradient
      colors={theme === 'c' ? [C.bg0, C.bg1, C.bg2] : [K.bg0, K.bg1, K.bg2]}
      style={styles.container}
    >
      {/* Progress dots */}
      <View style={styles.progressDots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, {
              backgroundColor: i <= step ? t.accent : t.textMuted,
              width: i === step ? 20 : 6,
            }]}
          />
        ))}
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {steps[step]}
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep((s) => (s - 1) as Step)}
          >
            <Text style={[styles.backText, { color: t.textMuted }]}>← Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, {
            backgroundColor: t.accent,
            shadowColor: t.accentGlow,
            flex: step === 0 ? 1 : 0,
          }]}
          onPress={isLast ? finish : () => setStep((s) => (s + 1) as Step)}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme === 'c' ? C.bg0 : K.bg0} />
          ) : (
            <Text style={[styles.nextText, { color: theme === 'c' ? C.bg0 : K.bg0 }]}>
              {isLast ? 'Begin the Journey' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 48,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    transition: 'width 0.3s',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    gap: 16,
  },
  stepLabel: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
  },
  stepTitle: {
    fontSize: 26,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: 'Raleway_400Regular',
    fontSize: 15,
  },
  identityPrompt: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    fontStyle: 'italic',
  },
  identityInput: {
    height: 100,
    paddingTop: 14,
  },
  partnerNote: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 13,
    marginTop: -6,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  themeEmoji: {
    fontSize: 28,
  },
  themeTitle: {
    fontSize: 17,
    marginBottom: 3,
  },
  themeDesc: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 24,
  },
  backBtn: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  backText: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 14,
  },
  nextBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  nextText: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
