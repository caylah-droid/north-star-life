import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { C, K } from '../lib/theme';

const { width: SW, height: SH } = Dimensions.get('screen');

const TOTAL_STEPS = 4;

// Subtle background stars
const STARS = Array.from({ length: 30 }, (_, i) => ({
  top: Math.random() * SH,
  left: Math.random() * SW,
  opacity: 0.06 + Math.random() * 0.18,
  size: i % 5 === 0 ? 2.5 : 1.5,
}));

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<'c' | 'k'>('c');
  const [identity, setIdentity] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { loadProfile } = useStore();

  const t = theme === 'c' ? C : K;
  const isLast = step === TOTAL_STEPS - 1;

  // Dot animation
  const dotWidths = useRef(
    Array.from({ length: TOTAL_STEPS }, (_, i) => new Animated.Value(i === 0 ? 20 : 6))
  ).current;

  function goToStep(next: number) {
    Animated.parallel([
      Animated.spring(dotWidths[step], { toValue: 6, tension: 300, friction: 20, useNativeDriver: false }),
      Animated.spring(dotWidths[next], { toValue: 20, tension: 300, friction: 20, useNativeDriver: false }),
    ]).start();
    setStep(next);
  }

  async function finish() {
    if (!name.trim()) {
      Alert.alert('', 'What should we call you?');
      return;
    }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    console.log('USER:', user?.id);
    if (!user) { 
      Alert.alert('Error', 'No user session found. Please log in again.');
      setLoading(false);
      return; 
    }
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

    await loadProfile();
    setLoading(false);
    router.replace('/(tabs)');
  }

  const steps = [
    // Step 0 — Name
    <View style={styles.stepContainer} key="name">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>WHO ARE YOU BECOMING?</Text>
      <Text style={[styles.stepTitle, {
        color: t.textPrimary,
        fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium',
      }]}>
        What do we call you?
      </Text>
      <TextInput
        style={[styles.input, {
          color: t.textPrimary,
          borderColor: t.cardBorder,
          backgroundColor: t.cardBg,
        }]}
        placeholder="Your name"
        placeholderTextColor={t.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => goToStep(1)}
      />
    </View>,

    // Step 1 — Theme selection
    <View style={styles.stepContainer} key="theme">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>YOUR FUEL</Text>
      <Text style={[styles.stepTitle, {
        color: t.textPrimary,
        fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium',
      }]}>
        Which element drives you?
      </Text>

      {/* Caylah — Ocean card */}
      <TouchableOpacity
        style={[styles.themeCard, {
          borderColor: theme === 'c' ? C.accent : 'rgba(0,210,220,0.10)',
          backgroundColor: theme === 'c' ? 'rgba(0,212,220,0.07)' : 'rgba(4,17,26,0.6)',
          shadowColor: C.accent,
          shadowOpacity: theme === 'c' ? 0.5 : 0,
          shadowRadius: 16,
        }]}
        onPress={() => setTheme('c')}
        activeOpacity={0.85}
      >
        {/* Teal accent line top */}
        {theme === 'c' && (
          <View style={[styles.cardAccentLine, { backgroundColor: C.accent }]} />
        )}

        <View style={styles.themeIconBox}>
          {/* Pearl / ocean symbol — crescent + dots */}
          <Text style={[styles.themeSymbol, {
            color: theme === 'c' ? C.accentHi : C.textMuted,
            textShadowColor: theme === 'c' ? C.accentGlow : 'transparent',
            textShadowRadius: theme === 'c' ? 12 : 0,
          }]}>
            ☽
          </Text>
          {theme === 'c' && (
            <View style={styles.pearlDots}>
              {[0,1,2].map(i => (
                <View key={i} style={[styles.pearlDot, { backgroundColor: C.accentHi }]} />
              ))}
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.themeTitle, {
            color: C.textPrimary,
            fontFamily: 'Marcellus_400Regular',
          }]}>
            Ocean · Caylah
          </Text>
          <Text style={[styles.themeDesc, { color: theme === 'c' ? C.textSecondary : C.textMuted }]}>
            Bioluminescent · Teal glow · Pearl rings
          </Text>
        </View>

        <View style={[styles.selectIndicator, {
          borderColor: theme === 'c' ? C.accent : 'rgba(0,210,220,0.15)',
          backgroundColor: theme === 'c' ? C.accent : 'transparent',
        }]}>
          {theme === 'c' && (
            <Text style={{ color: C.bg0, fontSize: 10, fontWeight: '700' }}>✓</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Kyle — Norse card */}
      <TouchableOpacity
        style={[styles.themeCard, {
          borderColor: theme === 'k' ? K.accent : 'rgba(160,180,200,0.08)',
          backgroundColor: theme === 'k' ? 'rgba(192,208,224,0.05)' : 'rgba(7,8,11,0.6)',
          shadowColor: K.accent,
          shadowOpacity: theme === 'k' ? 0.4 : 0,
          shadowRadius: 16,
        }]}
        onPress={() => setTheme('k')}
        activeOpacity={0.85}
      >
        {theme === 'k' && (
          <View style={[styles.cardAccentLine, { backgroundColor: K.accent }]} />
        )}

        <View style={styles.themeIconBox}>
          {/* Elder Futhark rune — Uruz (primal strength, raw power) */}
          <Text style={[styles.runeSymbol, {
            color: theme === 'k' ? K.accentHi : K.textMuted,
            textShadowColor: theme === 'k' ? K.accentGlow : 'transparent',
            textShadowRadius: theme === 'k' ? 12 : 0,
          }]}>
            ᚢ
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.themeTitle, {
            color: K.textPrimary,
            fontFamily: 'DMSans_500Medium',
            letterSpacing: 1,
          }]}>
            Norse · Kyle
          </Text>
          <Text style={[styles.themeDesc, { color: theme === 'k' ? K.textSecondary : K.textMuted }]}>
            Dark steel · Silver runes · Shield rings
          </Text>
        </View>

        <View style={[styles.selectIndicator, {
          borderColor: theme === 'k' ? K.accent : 'rgba(192,208,224,0.15)',
          backgroundColor: theme === 'k' ? K.accent : 'transparent',
        }]}>
          {theme === 'k' && (
            <Text style={{ color: K.bg0, fontSize: 10, fontWeight: '700' }}>✓</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>,

    // Step 2 — Identity statement
    <View style={styles.stepContainer} key="identity">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>ANCHOR STATEMENT</Text>
      <Text style={[styles.stepTitle, {
        color: t.textPrimary,
        fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium',
      }]}>
        Complete this:
      </Text>
      <Text style={[styles.identityPrompt, { color: t.accent }]}>
        "I am becoming someone who..."
      </Text>
      <TextInput
        style={[styles.input, styles.identityInput, {
          color: t.textPrimary,
          borderColor: t.cardBorder,
          backgroundColor: t.cardBg,
        }]}
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

    // Step 3 — Partner
    <View style={styles.stepContainer} key="partner">
      <Text style={[styles.stepLabel, { color: t.textMuted }]}>YOUR CREW</Text>
      <Text style={[styles.stepTitle, {
        color: t.textPrimary,
        fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'DMSans_500Medium',
      }]}>
        Building with someone?
      </Text>
      <Text style={[styles.partnerNote, { color: t.textSecondary }]}>
        Optional — link your partner later in settings.
      </Text>
      <TextInput
        style={[styles.input, {
          color: t.textPrimary,
          borderColor: t.cardBorder,
          backgroundColor: t.cardBg,
        }]}
        placeholder="Partner's email (optional)"
        placeholderTextColor={t.textMuted}
        value={partnerEmail}
        onChangeText={setPartnerEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
    </View>,
  ];

  return (
    <LinearGradient
      colors={theme === 'c' ? [C.bg0, C.bg1, C.bg2] : [K.bg0, K.bg1, K.bg2]}
      style={styles.container}
    >
      {/* Stars */}
      {STARS.map((s, i) => (
        <View key={i} style={[styles.star, {
          top: s.top, left: s.left, opacity: s.opacity,
          width: s.size, height: s.size, borderRadius: s.size / 2,
          backgroundColor: theme === 'c' && i % 4 === 0 ? C.accent : '#fff',
        }]} />
      ))}

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, {
              width: dotWidths[i],
              backgroundColor: i <= step ? t.accent : t.textMuted + '40',
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
            onPress={() => goToStep(Math.max(0, step - 1))}
          >
            <Text style={[styles.backText, { color: t.textMuted }]}>← Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextBtn,
            {
              borderColor: t.accent,
              shadowColor: t.accent,
            },
          ]}
          onPress={isLast ? finish : () => goToStep(Math.min(TOTAL_STEPS - 1, step + 1))}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={theme === 'c'
              ? ['#00D4DC', '#00B8C0']
              : ['#C0D0E0', '#A0B8CC']}
            style={styles.nextBtnInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={theme === 'c' ? C.bg0 : K.bg0} />
            ) : (
              <Text style={[styles.nextText, { color: theme === 'c' ? C.bg0 : K.bg0 }]}>
                {isLast
                  ? (theme === 'c' ? '✦ Begin the Journey' : 'ᚠ Enter the Raid')
                  : 'Continue →'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 24,
    paddingBottom: 44,
  },
  star: {
    position: 'absolute',
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 52,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    gap: 18,
  },
  stepLabel: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 10,
    letterSpacing: 2.5,
  },
  stepTitle: {
    fontSize: 26,
    lineHeight: 34,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontFamily: 'Raleway_400Regular',
    fontSize: 15,
  },
  identityPrompt: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: -4,
  },
  identityInput: {
    height: 110,
    paddingTop: 15,
  },
  partnerNote: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 13,
    marginTop: -6,
  },

  // Theme cards
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    overflow: 'hidden',
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  themeIconBox: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSymbol: {
    fontSize: 26,
    textShadowOffset: { width: 0, height: 0 },
  },
  runeSymbol: {
    fontSize: 34,
    fontFamily: 'DMSans_500Medium',
    textShadowOffset: { width: 0, height: 0 },
  },
  pearlDots: {
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    bottom: 2,
  },
  pearlDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  themeTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  themeDesc: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  selectIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Navigation
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
  },
  backBtn: {
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  backText: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 14,
  },
  nextBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
    minWidth: 180,
  },
  nextBtnInner: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontFamily: 'Raleway_700Bold',
    fontSize: 15,
    letterSpacing: 0.8,
  },
});
