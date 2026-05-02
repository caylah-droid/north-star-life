import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore, useTheme, useProfile, useTodayLog, usePartner } from '../../lib/store';
import { C, K, getDailyGreeting, getRank, getXpToNextRank, getRankProgress, PILLARS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { PillarKey } from '../../lib/supabase';
import PillarCard from '../../components/PillarCard';
import SeptemberCountdown from '../../components/SeptemberCountdown';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const todayLog = useTodayLog();
  const { profile: partner, log: partnerLog } = usePartner();
  const { loadTodayLog, loadPartner, loadProfile, togglePillar } = useStore();

  const t = theme === 'c' ? C : K;
  const [refreshing, setRefreshing] = React.useState(false);

  // Star twinkle refs — bioluminescent background
  const starAnims = useRef(
    Array.from({ length: theme === 'c' ? 60 : 20 }, () => new Animated.Value(0.3 + Math.random() * 0.7))
  ).current;

  useEffect(() => {
    loadTodayLog();
    loadPartner();
    startStarTwinkle();
    setupRealtimePartner();
  }, []);

  function startStarTwinkle() {
    starAnims.forEach((anim, i) => {
      const delay = i * 120;
      const duration = 2000 + Math.random() * 3000;
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.15, duration, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.9, duration, useNativeDriver: true }),
        ])
      ).start();
    });
  }

  function setupRealtimePartner() {
    if (!profile?.partner_id) return;
    const channel = supabase
      .channel('partner-log')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_logs',
        filter: `user_id=eq.${profile.partner_id}`,
      }, () => {
        loadPartner();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadTodayLog(), loadPartner()]);
    setRefreshing(false);
  }, []);

  const completedCount = todayLog
    ? (['move', 'nourish', 'mind', 'build'] as PillarKey[]).filter((k) => todayLog[k]).length
    : 0;
  const allComplete = completedCount === 4;

  const greeting = profile ? getDailyGreeting(theme, profile.name) : '';
  const rank = profile ? getRank(theme, profile.xp) : '';
  const xpToNext = profile ? getXpToNextRank(profile.xp) : 0;
  const rankProgress = profile ? getRankProgress(profile.xp) : 0;

  if (!profile) return null;

  const STAR_DATA = useRef(
    Array.from({ length: theme === 'c' ? 60 : 20 }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: i % 4 === 0 ? 2.5 : 1.5,
      isTeal: i % 4 === 0 && theme === 'c',
    }))
  ).current;

  return (
    <View style={[styles.container, { backgroundColor: t.bg0 }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={theme === 'c' ? [C.bg0, C.bg1, C.bg2] : [K.bg0, K.bg1, K.bg2]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars */}
      {STAR_DATA.map((s, i) => (
        <Animated.View
          key={i}
          style={[styles.star, {
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: s.size,
            backgroundColor: s.isTeal ? C.accent : '#FFFFFF',
            opacity: starAnims[i],
            shadowColor: s.isTeal ? C.accentGlow : '#fff',
            shadowOpacity: s.isTeal ? 0.9 : 0.3,
            shadowRadius: s.isTeal ? 4 : 2,
          }]}
        />
      ))}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: t.textSecondary, fontFamily: t.fontUI }]}>
                {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
              </Text>
              <Text style={[styles.name, { color: t.textPrimary, fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular' }]}>
                {profile.name}
              </Text>
            </View>

            {/* Partner dot cluster */}
            {partner && (
              <View style={styles.partnerCluster}>
                <View style={[styles.partnerDot, { backgroundColor: theme === 'c' ? K.accent : C.accent }]} />
                <Text style={[styles.partnerLabel, { color: t.textMuted }]}>
                  {partner.name.split(' ')[0]}
                </Text>
                <View style={styles.partnerPillars}>
                  {(['move', 'nourish', 'mind', 'build'] as PillarKey[]).map((p) => (
                    <View
                      key={p}
                      style={[styles.partnerPillarDot, {
                        backgroundColor: partnerLog?.[p]
                          ? (theme === 'c' ? K.accent : C.accent)
                          : t.textMuted + '30',
                      }]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Daily message */}
          <Text style={[styles.dailyMessage, {
            color: t.textSecondary,
            fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'Raleway_400Regular',
            fontStyle: theme === 'c' ? 'italic' : 'normal',
          }]}>
            {greeting}
          </Text>
        </View>

        {/* September countdown */}
        <SeptemberCountdown theme={theme} septemberDate={profile.september_date} />

        {/* Non-Negotiables */}
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

        <View style={styles.pillarsGrid}>
          {(Object.values(PILLARS) as { key: PillarKey; label: string; runeChar: string; runeName: string }[]).map((pillar) => (
            <PillarCard
              key={pillar.key}
              pillar={pillar}
              theme={theme}
              done={todayLog?.[pillar.key] ?? false}
              onToggle={() => togglePillar(pillar.key)}
            />
          ))}
        </View>

        {/* All complete celebration */}
        {allComplete && (
          <View style={[styles.completeCard, {
            backgroundColor: t.cardBg,
            borderColor: t.accent,
            shadowColor: t.accentGlow,
          }]}>
            <Text style={[styles.completeIcon, { color: t.accent }]}>✦</Text>
            <Text style={[styles.completeTitle, {
              color: t.textPrimary,
              fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
            }]}>
              {theme === 'c' ? 'All tides aligned.' : 'The raid is complete.'}
            </Text>
            <Text style={[styles.completeSubtitle, { color: t.textSecondary }]}>
              {theme === 'c' ? '+100 XP earned today' : '+100 XP — Valhalla records it.'}
            </Text>
          </View>
        )}

        {/* XP / Rank strip */}
        <View style={[styles.rankCard, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <View style={styles.rankRow}>
            <Text style={[styles.rankName, { color: t.accent, fontFamily: t.fontUI }]}>
              {rank}
            </Text>
            <Text style={[styles.xpText, { color: t.xpGold, fontFamily: 'DMSans_400Regular' }]}>
              {profile.xp.toLocaleString()} XP
            </Text>
          </View>
          <View style={[styles.xpTrack, { backgroundColor: t.accentSoft }]}>
            <Animated.View
              style={[styles.xpBar, {
                width: `${rankProgress * 100}%`,
                backgroundColor: t.accent,
                shadowColor: t.accentGlow,
              }]}
            />
          </View>
          <Text style={[styles.xpToNext, { color: t.textMuted }]}>
            {xpToNext} XP to next rank
          </Text>
        </View>

        {/* Debrief button */}
        <TouchableOpacity
          style={[styles.debriefBtn, { borderColor: t.cardBorder }]}
          onPress={() => router.push('/debrief')}
          activeOpacity={0.8}
        >
          <Text style={[styles.debriefText, { color: t.textSecondary, fontFamily: t.fontUI }]}>
            {theme === 'c' ? 'Close the chapter →' : 'END OF DAY LOG →'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    letterSpacing: 0.5,
  },
  partnerCluster: {
    alignItems: 'center',
    gap: 4,
  },
  partnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  partnerLabel: {
    fontSize: 10,
    fontFamily: 'Raleway_400Regular',
    letterSpacing: 0.5,
  },
  partnerPillars: {
    flexDirection: 'row',
    gap: 4,
  },
  partnerPillarDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dailyMessage: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
  },
  completionCount: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  pillarsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  completeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  completeIcon: {
    fontSize: 24,
  },
  completeTitle: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
  completeSubtitle: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  rankCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankName: {
    fontSize: 14,
    letterSpacing: 1,
  },
  xpText: {
    fontSize: 13,
  },
  xpTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBar: {
    height: 3,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  xpToNext: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  debriefBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  debriefText: {
    fontSize: 12,
    letterSpacing: 2,
  },
});
