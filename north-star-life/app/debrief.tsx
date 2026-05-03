import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Animated, Dimensions, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore, useTheme, useProfile, useTodayLog } from '../lib/store';
import { C, K } from '../lib/theme';
import { PillarKey, MissReason } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const { width: SW, height: SH } = Dimensions.get('screen');

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = 'win' | 'miss' | 'story' | 'done';

const MISS_REASONS: { key: MissReason; label: string; sublabel: string }[] = [
  { key: 'Energy',    label: 'Energy',    sublabel: 'Didn\'t have it in me' },
  { key: 'Time',      label: 'Time',      sublabel: 'The day ran out first' },
  { key: 'Avoidance', label: 'Avoidance', sublabel: 'I knew. I didn\'t.' },
  { key: 'Life',      label: 'Life',      sublabel: 'Something real got in the way' },
];

const PILLARS: { key: PillarKey; label: string; cIcon: string; runeChar: string }[] = [
  { key: 'move',    label: 'Move',    cIcon: '☽', runeChar: 'ᚦ' },
  { key: 'nourish', label: 'Nourish', cIcon: '✦', runeChar: 'ᚢ' },
  { key: 'mind',    label: 'Mind',    cIcon: 'ॐ', runeChar: 'ᚹ' },
  { key: 'build',   label: 'Build',   cIcon: '✶', runeChar: 'ᚠ' },
];

// Stable stars
const STARS = Array.from({ length: 40 }, (_, i) => ({
  top: Math.random() * SH,
  left: Math.random() * SW,
  size: i % 4 === 0 ? 2 : 1.5,
  isTeal: i % 4 === 0,
  opacity: 0.08 + Math.random() * 0.25,
}));

// ── Story generation via Claude ────────────────────────────────────────────────
async function generateStoryLine(
  theme: 'c' | 'k',
  name: string,
  completedPillars: string[],
  missedPillars: string[],
  win: string,
): Promise<string> {
  try {
    const isAllComplete = missedPillars.length === 0;
    const completedStr = completedPillars.join(', ') || 'nothing today';
    const missedStr = missedPillars.join(', ') || 'nothing';

    const systemPrompt = theme === 'c'
      ? `You write one sentence story lines for Caylah — a woman transforming her life to become a digital nomad. 
Her destination is Kendwa Beach, Zanzibar. She is becoming the ocean woman she knows she is.
Tone: warm, poetic, aspirational. Never clinical. Never generic. One sentence only. No quotes.
Reference her real progress. Make her feel like the protagonist.`
      : `You write one sentence story lines for Kyle — a man building a life of conquest and freedom.
He is becoming a Viking-level operator. His destination is everywhere worth conquering.
Tone: terse, stoic, earned. Never soft. One sentence only. No quotes.
Reference his real progress. Make him feel the weight of the journey.`;

    const userPrompt = `Name: ${name}
Completed today: ${completedStr}
Missed today: ${missedStr}
Win they logged: "${win || 'nothing logged'}"
All complete: ${isAllComplete}

Write their one-sentence story line for today.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 120,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() ?? '';
    return text || fallbackStory(theme, isAllComplete);
  } catch {
    return fallbackStory(theme, missedPillars.length === 0);
  }
}

function fallbackStory(theme: 'c' | 'k', allComplete: boolean): string {
  if (theme === 'c') {
    return allComplete
      ? 'The tide moved with her today — every drop counted.'
      : 'She showed up anyway. That is always enough to begin.';
  }
  return allComplete
    ? 'Every pillar held. The shield wall did not break today.'
    : 'Not every raid succeeds. The warrior returns tomorrow.';
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DebriefScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const todayLog = useTodayLog();
  const { submitWinLog, logMissReason } = useStore();

  const t = theme === 'c' ? C : K;

  const [step, setStep] = useState<Step>('win');
  const [win, setWin] = useState('');
  // missSelections: { pillar: PillarKey, reason: MissReason | null }[]
  const [missSelections, setMissSelections] = useState<
    { pillar: PillarKey; reason: MissReason | null }[]
  >([]);
  const [storyLine, setStoryLine] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const completionScale = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  const missedPillars = todayLog
    ? PILLARS.filter((p) => !todayLog[p.key])
    : [];
  const completedPillars = todayLog
    ? PILLARS.filter((p) => todayLog[p.key])
    : [];
  const allComplete = missedPillars.length === 0;

  useEffect(() => {
    // Pre-populate miss selections
    setMissSelections(missedPillars.map((p) => ({ pillar: p.key, reason: null })));
  }, [todayLog]);

  function transitionTo(next: Step) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  async function handleWinNext() {
    if (win.trim()) await submitWinLog(win.trim());
    if (missedPillars.length > 0) {
      transitionTo('miss');
    } else {
      await handleGenerateStory();
    }
  }

  function setReasonForPillar(pillar: PillarKey, reason: MissReason) {
    setMissSelections((prev) =>
      prev.map((s) => s.pillar === pillar ? { ...s, reason } : s)
    );
  }

  async function handleMissSubmit() {
    // Submit all miss reasons
    for (const sel of missSelections) {
      if (sel.reason) {
        await logMissReason(sel.pillar, sel.reason);
      }
    }
    await handleGenerateStory();
  }

  async function handleGenerateStory() {
    transitionTo('story');
    setGeneratingStory(true);
    const story = await generateStoryLine(
      theme,
      profile?.name ?? '',
      completedPillars.map((p) => p.label),
      missedPillars.map((p) => p.label),
      win,
    );
    setStoryLine(story);

    // Save story line to Supabase
    if (todayLog) {
      await supabase
        .from('daily_logs')
        .update({ story_line: story })
        .eq('id', todayLog.id);
    }

    setGeneratingStory(false);
    startCompletionAnimation();
  }

  function startCompletionAnimation() {
    Animated.sequence([
      Animated.spring(completionScale, {
        toValue: 1,
        tension: 200,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripples
    const rippleConfig = { toValue: 1, duration: 900, useNativeDriver: true };
    Animated.loop(
      Animated.stagger(300, [
        Animated.timing(ripple1, rippleConfig),
        Animated.timing(ripple2, rippleConfig),
        Animated.timing(ripple3, rippleConfig),
      ])
    ).start();
  }

  function handleClose() {
    router.back();
  }

  if (!profile || !todayLog) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg0 }]}>
        <ActivityIndicator color={t.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme === 'c' ? [C.bg2, C.bg1, C.bg0] : [K.bg2, K.bg1, K.bg0]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />

      {/* Stars */}
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[styles.star, {
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            borderRadius: s.size / 2,
            opacity: s.opacity,
            backgroundColor: s.isTeal && theme === 'c' ? C.accent : '#ffffff',
          }]}
        />
      ))}

      {/* Close pill */}
      <TouchableOpacity style={styles.closePill} onPress={handleClose}>
        <View style={[styles.closePillInner, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <Text style={[styles.closePillText, { color: t.textMuted }]}>✕</Text>
        </View>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step header */}
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}>

            {/* ── WIN STEP ───────────────────────────────────────────── */}
            {step === 'win' && (
              <View style={styles.stepWrap}>
                <Text style={[styles.stepEyebrow, { color: t.textMuted, fontFamily: t.fontUI }]}>
                  {theme === 'c' ? 'CLOSE THE CHAPTER' : 'END OF DAY LOG'}
                </Text>
                <Text style={[styles.stepTitle, {
                  color: t.textPrimary,
                  fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
                }]}>
                  {theme === 'c'
                    ? 'One thing that moved today.'
                    : 'Name one victory.'}
                </Text>
                <Text style={[styles.stepSub, { color: t.textSecondary }]}>
                  {theme === 'c'
                    ? 'No matter how small. The ocean counts every wave.'
                    : 'Warriors account for every battle.'}
                </Text>

                {/* Pillar summary row */}
                <View style={[styles.pillarSummary, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
                  {PILLARS.map((p) => {
                    const done = todayLog[p.key];
                    return (
                      <View key={p.key} style={styles.pillarSummaryItem}>
                        <Text style={[
                          styles.pillarSummaryIcon,
                          {
                            color: done ? t.accent : t.textMuted + '50',
                            fontFamily: theme === 'k' ? 'CinzelDecorative_400Regular' : undefined,
                          },
                        ]}>
                          {theme === 'c' ? p.cIcon : p.runeChar}
                        </Text>
                        <View style={[styles.pillarDot, {
                          backgroundColor: done ? t.accent : t.textMuted + '30',
                          shadowColor: done ? t.accent : 'transparent',
                          shadowOpacity: done ? 0.8 : 0,
                          shadowRadius: 4,
                        }]} />
                      </View>
                    );
                  })}
                </View>

                <TextInput
                  style={[styles.winInput, {
                    backgroundColor: t.cardBg,
                    borderColor: t.cardBorder,
                    color: t.textPrimary,
                  }]}
                  placeholder={
                    theme === 'c'
                      ? 'I moved, I ate well, I wrote 500 words...'
                      : 'Trained. Ate clean. Applied for two roles...'
                  }
                  placeholderTextColor={t.textMuted}
                  multiline
                  numberOfLines={4}
                  value={win}
                  onChangeText={setWin}
                  textAlignVertical="top"
                  selectionColor={t.accent}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: t.accent }]}
                  onPress={handleWinNext}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.primaryBtnText, { color: t.bg0, fontFamily: t.fontUI }]}>
                    {missedPillars.length > 0
                      ? (theme === 'c' ? 'Next →' : 'Continue →')
                      : (theme === 'c' ? 'Close the day' : 'Log it')}
                  </Text>
                </TouchableOpacity>

                {/* Skip */}
                <TouchableOpacity onPress={handleWinNext} style={styles.skipBtn}>
                  <Text style={[styles.skipText, { color: t.textMuted }]}>
                    {theme === 'c' ? 'Skip for now' : 'Skip'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── MISS STEP ──────────────────────────────────────────── */}
            {step === 'miss' && (
              <View style={styles.stepWrap}>
                <Text style={[styles.stepEyebrow, { color: t.textMuted, fontFamily: t.fontUI }]}>
                  {theme === 'c' ? 'WHAT HAPPENED' : 'ASSESS THE MISS'}
                </Text>
                <Text style={[styles.stepTitle, {
                  color: t.textPrimary,
                  fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
                }]}>
                  {theme === 'c'
                    ? 'The tide asks — what got in the way?'
                    : 'Name what stopped you.'}
                </Text>
                <Text style={[styles.stepSub, { color: t.textSecondary }]}>
                  {theme === 'c'
                    ? 'No judgment. Just honesty. +20 XP for this.'
                    : 'Honest accounting earns +20 XP.'}
                </Text>

                {missedPillars.map((pillar) => {
                  const sel = missSelections.find((s) => s.pillar === pillar.key);
                  return (
                    <View
                      key={pillar.key}
                      style={[styles.missBlock, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}
                    >
                      <View style={styles.missBlockHeader}>
                        <Text style={[styles.missBlockIcon, {
                          color: t.textMuted,
                          fontFamily: theme === 'k' ? 'CinzelDecorative_400Regular' : undefined,
                        }]}>
                          {theme === 'c' ? pillar.cIcon : pillar.runeChar}
                        </Text>
                        <Text style={[styles.missBlockLabel, { color: t.textSecondary, fontFamily: t.fontUI }]}>
                          {pillar.label.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.reasonsGrid}>
                        {MISS_REASONS.map((r) => {
                          const selected = sel?.reason === r.key;
                          return (
                            <TouchableOpacity
                              key={r.key}
                              style={[styles.reasonBtn, {
                                backgroundColor: selected ? t.accent + '18' : t.cardBg,
                                borderColor: selected ? t.accent : t.cardBorder,
                              }]}
                              onPress={() => setReasonForPillar(pillar.key, r.key)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.reasonLabel, {
                                color: selected ? t.accent : t.textSecondary,
                                fontFamily: t.fontUI,
                              }]}>
                                {r.label}
                              </Text>
                              <Text style={[styles.reasonSub, { color: t.textMuted }]}>
                                {r.sublabel}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}

                {/* Grace note */}
                <View style={[styles.graceNote, { borderColor: t.cardBorder }]}>
                  <Text style={[styles.graceText, { color: t.textMuted }]}>
                    {theme === 'c'
                      ? 'Noted. Tomorrow we adjust. You\'re still in it.'
                      : 'Noted. The raid continues tomorrow.'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: t.accent }]}
                  onPress={handleMissSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.primaryBtnText, { color: t.bg0, fontFamily: t.fontUI }]}>
                    {theme === 'c' ? 'Close the chapter' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STORY STEP ─────────────────────────────────────────── */}
            {step === 'story' && (
              <View style={styles.stepWrap}>
                {generatingStory ? (
                  <View style={styles.generating}>
                    <ActivityIndicator color={t.accent} size="large" />
                    <Text style={[styles.generatingText, {
                      color: t.textMuted,
                      fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'Raleway_400Regular',
                    }]}>
                      {theme === 'c'
                        ? 'Writing your chapter...'
                        : 'Recording the battle...'}
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Completion visual */}
                    <View style={styles.completionVisual}>
                      {/* Ripple rings */}
                      {[ripple1, ripple2, ripple3].map((r, i) => (
                        <Animated.View
                          key={i}
                          style={[styles.ripple, {
                            borderColor: t.accent,
                            transform: [{
                              scale: r.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.4, 2.2 + i * 0.3],
                              }),
                            }],
                            opacity: r.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0.6, 0.2, 0],
                            }),
                          }]}
                        />
                      ))}

                      {/* Central icon */}
                      <Animated.View style={[
                        styles.completionIcon,
                        {
                          backgroundColor: t.accent,
                          transform: [{ scale: completionScale }],
                          shadowColor: t.accent,
                        },
                      ]}>
                        <Text style={[styles.completionSymbol, { color: t.bg0 }]}>✦</Text>
                      </Animated.View>
                    </View>

                    <Text style={[styles.stepEyebrow, {
                      color: t.textMuted,
                      fontFamily: t.fontUI,
                      textAlign: 'center',
                    }]}>
                      {theme === 'c' ? 'YOUR STORY TODAY' : 'THE DAY\'S RECORD'}
                    </Text>

                    <Text style={[styles.storyLine, {
                      color: t.textPrimary,
                      fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'Raleway_400Regular',
                      fontStyle: theme === 'c' ? 'italic' : 'normal',
                    }]}>
                      "{storyLine}"
                    </Text>

                    {/* XP earned */}
                    <View style={[styles.xpBadge, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
                      <Text style={[styles.xpBadgeText, { color: t.xpGold }]}>
                        +{todayLog.xp_earned} XP
                      </Text>
                      <Text style={[styles.xpBadgeSub, { color: t.textMuted }]}>
                        {allComplete ? 'All pillars complete' : 'Honest miss logged'}
                      </Text>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                      <View style={[styles.statItem, { borderColor: t.cardBorder }]}>
                        <Text style={[styles.statValue, { color: t.accent }]}>
                          {profile.streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textMuted }]}>
                          {theme === 'c' ? 'day streak' : 'days'}
                        </Text>
                      </View>
                      <View style={[styles.statItem, { borderColor: t.cardBorder }]}>
                        <Text style={[styles.statValue, { color: t.accent }]}>
                          {profile.xp.toLocaleString()}
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textMuted }]}>
                          total XP
                        </Text>
                      </View>
                      <View style={[styles.statItem, { borderColor: t.cardBorder }]}>
                        <Text style={[styles.statValue, { color: t.accent }]}>
                          {completedPillars.length}/4
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textMuted }]}>
                          pillars
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: t.accent }]}
                      onPress={handleClose}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.primaryBtnText, { color: t.bg0, fontFamily: t.fontUI }]}>
                        {theme === 'c' ? 'Until tomorrow ✦' : 'Rest. Return. Conquer.'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
  },
  closePill: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
  },
  closePillInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePillText: {
    fontSize: 14,
  },
  scroll: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  stepWrap: {
    gap: 16,
  },
  stepEyebrow: {
    fontSize: 10,
    letterSpacing: 2.5,
  },
  stepTitle: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  stepSub: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  pillarSummary: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillarSummaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  pillarSummaryIcon: {
    fontSize: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  pillarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  winInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    fontFamily: 'Raleway_400Regular',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 110,
  },
  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 15,
    letterSpacing: 1.5,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipText: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  missBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  missBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missBlockIcon: {
    fontSize: 18,
  },
  missBlockLabel: {
    fontSize: 11,
    letterSpacing: 2,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonBtn: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 3,
  },
  reasonLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  reasonSub: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  graceNote: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  graceText: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  generating: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 80,
  },
  generatingText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  completionVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    marginBottom: 8,
  },
  ripple: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
  },
  completionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
  completionSymbol: {
    fontSize: 26,
  },
  storyLine: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.2,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  xpBadge: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  xpBadgeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 22,
    letterSpacing: 1,
  },
  xpBadgeSub: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    borderTopWidth: 1,
    paddingTop: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 18,
  },
  statLabel: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 10,
    letterSpacing: 1,
  },
});
