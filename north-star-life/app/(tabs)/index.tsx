import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import PillarCard from '../../components/PillarCard';
import SeptemberCountdown from '../../components/SeptemberCountdown';
import {
  C, K, PILLARS, getDailyGreeting, getRank, getXpToNextRank, getRankProgress,
} from '../../lib/theme';
import {
  useStore, useTheme, useProfile, useTodayLog, usePartner,
} from '../../lib/store';
import { PillarKey } from '../../lib/supabase';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Stable star data — generated once at module level ────────────────────────
interface StarDatum {
  top: number;
  left: number;
  size: number;
  isTeal: boolean;
  duration: number;
  delay: number;
  lo: number;
  hi: number;
}

const ALL_STARS: StarDatum[] = Array.from({ length: 20 }, (_, i) => ({
  top: Math.random() * SCREEN_H * 0.65,
  left: Math.random() * SCREEN_W,
  size: 0.8 + Math.random() * 2.2,
  isTeal: i % 4 === 0,
  duration: 2000 + Math.random() * 4000,
  delay: Math.random() * 5000,
  lo: 0.08 + Math.random() * 0.18,
  hi: i % 4 === 0 ? 0.7 + Math.random() * 0.3 : 0.35 + Math.random() * 0.5,
}));

// ── Single star ──────────────────────────────────────────────────────────────
function Star({ d, isCaylah }: { d: StarDatum; isCaylah: boolean }) {
  const opacity = useRef(new Animated.Value(d.lo)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(d.delay),
        Animated.timing(opacity, { toValue: d.hi, duration: d.duration / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: d.lo, duration: d.duration / 2, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const color = d.isTeal && isCaylah ? C.accent : '#FFFFFF';

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: d.top,
        left: d.left,
        width: d.size,
        height: d.size,
        borderRadius: d.size / 2,
        backgroundColor: color,
        opacity,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: d.isTeal && isCaylah ? 0.9 : 0.2,
        shadowRadius: d.isTeal && isCaylah ? d.size * 2 : d.size,
      }}
    />
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function TodayScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const todayLog = useTodayLog();
  const { profile: partner, log: partnerLog } = usePartner();
  const { loadProfile, loadTodayLog, loadPartner, togglePillar } = useStore();

  const [refreshing, setRefreshing] = useState(false);

  const t = theme === 'c' ? C : K;
  const isCaylah = theme === 'c';

  // XP bar animation
  const xpBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!profile) return;
    const progress = getRankProgress(profile.xp);
    Animated.spring(xpBarAnim, {
      toValue: progress,
      tension: 80,
      friction: 20,
      useNativeDriver: false,
    }).start();
  }, [profile?.xp]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadTodayLog(), loadPartner()]);
    setRefreshing(false);
  }, []);

  if (!profile) return null;

  const completedCount = todayLog
    ? (['move', 'nourish', 'mind', 'build'] as PillarKey[]).filter((k) => todayLog[k]).length
    : 0;
  const allComplete = completedCount === 4;

  const greeting = getDailyGreeting(theme, profile.name);
  const rank = getRank(theme, profile.xp);
  const xpToNext = getXpToNextRank(profile.xp);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={isCaylah ? [C.bg0, C.bg1, C.bg2] : [K.bg0, K.bg1, K.bg2]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars disabled temporarily */}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.accent}
          />
        }
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.dateLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
                {new Date().toLocaleDateString('en-ZA', {
                  weekday: 'long', day: 'numeric', month: 'long',
                }).toUpperCase()}
              </Text>
              <Text style={[styles.name, {
                color: t.textPrimary,
                fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
                fontSize: isCaylah ? 28 : 20,
                letterSpacing: isCaylah ? 0.3 : 0.08,
              }]}>
                {profile.name}
              </Text>
            </View>

            {/* Partner cluster */}
            {partner && (
              <View style={styles.partnerCluster}>
                <View style={[styles.partnerDot, {
                  backgroundColor: isCaylah ? K.accent : C.accent,
                  shadowColor: isCaylah ? K.accent : C.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                }]} />
                <Text style={[styles.partnerName, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                  {partner.name.split(' ')[0]}
                </Text>
                <View style={styles.partnerPillars}>
                  {(['move', 'nourish', 'mind', 'build'] as PillarKey[]).map((p) => (
                    <View
                      key={p}
                      style={[styles.partnerPillarDot, {
                        backgroundColor: partnerLog?.[p]
                          ? (isCaylah ? K.accent : C.accent)
                          : `${t.textMuted}40`,
                      }]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Greeting */}
          <Text style={[styles.greeting, {
            color: t.textSecondary,
            fontFamily: isCaylah ? 'Marcellus_400Regular' : t.fontUIReg,
            fontStyle: isCaylah ? 'italic' : 'normal',
            letterSpacing: isCaylah ? 0.2 : 1.5,
            textTransform: isCaylah ? 'none' : 'uppercase',
          }]}>
            {greeting}
          </Text>
        </View>

        {/* ── SEPTEMBER COUNTDOWN ── */}
        <SeptemberCountdown
          theme={theme}
          septemberDate={profile.september_date}
          currentStreak={profile.streak}
        />

        {/* ── NON-NEGOTIABLES ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
            NON-NEGOTIABLES
          </Text>
          <Text style={[styles.completionCount, {
            color: allComplete ? t.accent : t.textSecondary,
            fontFamily: 'DMSans_500Medium',
          }]}>
            {completedCount}/4
          </Text>
        </View>

        <View style={styles.pillarsStack}>
          {(Object.values(PILLARS) as {
            key: PillarKey; label: string; runeChar: string; runeName: string;
          }[]).map((pillar) => (
            <PillarCard
              key={pillar.key}
              pillar={pillar}
              theme={theme}
              done={todayLog?.[pillar.key] ?? false}
              onToggle={() => togglePillar(pillar.key)}
            />
          ))}
        </View>

        {/* ── ALL COMPLETE CELEBRATION ── */}
        {allComplete && (
          <View style={[styles.celebCard, {
            backgroundColor: t.cardBg,
            borderColor: t.accent,
            shadowColor: t.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 6,
          }]}>
            <Text style={[styles.celebIcon, { color: t.accent }]}>✦</Text>
            <Text style={[styles.celebTitle, {
              color: t.textPrimary,
              fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
            }]}>
              {isCaylah ? 'All tides aligned.' : 'VALHALLA LOGGED'}
            </Text>
            <Text style={[styles.celebSub, {
              color: t.textSecondary,
              fontFamily: t.fontUIReg,
            }]}>
              {isCaylah
                ? '+100 XP — the ocean remembers.'
                : '+100 XP — Odin records it.'}
            </Text>
          </View>
        )}

        {/* ── RANK / XP ── */}
        <View style={[styles.rankCard, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <View style={styles.rankRow}>
            <Text style={[styles.rankName, {
              color: t.textPrimary,
              fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
              fontSize: isCaylah ? 15 : 12,
            }]}>
              {rank}
            </Text>
            <Text style={[styles.xpValue, { color: t.xpGold, fontFamily: 'DMSans_500Medium' }]}>
              {profile.xp.toLocaleString()} XP
            </Text>
          </View>

          <View style={[styles.xpTrack, { backgroundColor: t.accentSoft }]}>
            <Animated.View
              style={[styles.xpFill, {
                width: xpBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: t.accent,
                shadowColor: t.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
              }]}
            />
          </View>

          <Text style={[styles.xpNext, {
            color: t.textMuted,
            fontFamily: t.fontUIReg,
            letterSpacing: isCaylah ? 0.3 : 0.8,
          }]}>
            {isCaylah ? `${xpToNext} XP to next rank` : `${xpToNext} XP TO NEXT RANK`}
          </Text>
        </View>

        {/* ── STREAK ── */}
        <View style={styles.streakRow}>
          {[
            { num: profile.streak, label: 'DAY STREAK', color: t.accent },
            { num: profile.longest_streak, label: 'BEST STREAK', color: t.textPrimary },
          ].map((item, i) => (
            <View key={i} style={[styles.streakCard, {
              backgroundColor: t.cardBg,
              borderColor: t.cardBorder,
            }]}>
              <Text style={[styles.streakNum, { color: item.color, fontFamily: 'DMSans_500Medium' }]}>
                {item.num}
              </Text>
              <Text style={[styles.streakLabel, {
                color: t.textMuted,
                fontFamily: t.fontUI,
                letterSpacing: isCaylah ? 1 : 1.5,
              }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── DEBRIEF CTA ── */}
        <TouchableOpacity
          style={[styles.debriefBtn, { borderColor: t.cardBorder }]}
          onPress={() => router.push('/debrief')}
          activeOpacity={0.75}
        >
          <Text style={[styles.debriefText, {
            color: t.textSecondary,
            fontFamily: t.fontUI,
            letterSpacing: isCaylah ? 2 : 2.5,
          }]}>
            {isCaylah ? 'CLOSE THE CHAPTER →' : 'END OF DAY LOG →'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 58, paddingHorizontal: 20, paddingBottom: 20 },

  header: { marginBottom: 14, gap: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dateLabel: { fontSize: 9, letterSpacing: 1.8, marginBottom: 2 },
  name: { lineHeight: 34 },

  partnerCluster: { alignItems: 'center', gap: 4, marginTop: 4 },
  partnerDot: { width: 8, height: 8, borderRadius: 4 },
  partnerName: { fontSize: 9, letterSpacing: 0.5 },
  partnerPillars: { flexDirection: 'row', gap: 4 },
  partnerPillarDot: { width: 5, height: 5, borderRadius: 2.5 },

  greeting: { fontSize: 14, lineHeight: 22 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  sectionLabel: { fontSize: 9, letterSpacing: 2.5 },
  completionCount: { fontSize: 14 },

  pillarsStack: { gap: 8, marginBottom: 10 },

  celebCard: {
    borderRadius: 12, borderWidth: 1, padding: 18,
    alignItems: 'center', gap: 5, marginBottom: 10,
  },
  celebIcon: { fontSize: 22 },
  celebTitle: { fontSize: 16 },
  celebSub: { fontSize: 11, letterSpacing: 0.8 },

  rankCard: {
    borderRadius: 12, borderWidth: 1,
    padding: 14, gap: 7, marginBottom: 8,
  },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankName: {},
  xpValue: { fontSize: 12 },
  xpTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: 3, borderRadius: 2 },
  xpNext: { fontSize: 10 },

  streakRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  streakCard: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center', gap: 3,
  },
  streakNum: { fontSize: 26, lineHeight: 30 },
  streakLabel: { fontSize: 8 },

  debriefBtn: { borderRadius: 10, borderWidth: 1, paddingVertical: 16, alignItems: 'center' },
  debriefText: { fontSize: 10 },
});
