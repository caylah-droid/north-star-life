import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, K } from '../lib/theme';
import { Theme } from '../lib/supabase';

interface Props {
  theme: Theme;
  septemberDate: string; // ISO date string e.g. '2025-09-01'
  currentStreak: number;
}

const ZANZIBAR_STREAK_REQUIRED = 30;

export default function SeptemberCountdown({ theme, septemberDate, currentStreak }: Props) {
  const t = theme === 'c' ? C : K;

  const { daysLeft, progressPct } = useMemo(() => {
    const target = new Date(septemberDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const total = Math.round((target.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
    const elapsed = Math.round((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
    const left = Math.max(0, Math.round((target.getTime() - now.getTime()) / 86400000));
    const pct = Math.min(1, elapsed / total);
    return { daysLeft: left, progressPct: pct };
  }, [septemberDate]);

  const zanzibarUnlocked = currentStreak >= ZANZIBAR_STREAK_REQUIRED;
  const streakToUnlock = Math.max(0, ZANZIBAR_STREAK_REQUIRED - currentStreak);

  return (
    <View style={[styles.card, {
      backgroundColor: t.cardBg,
      borderColor: t.cardBorder,
    }]}>
      {/* Kyle top accent line */}
      {theme === 'k' && (
        <View style={[styles.topAccent, { backgroundColor: K.accent }]} />
      )}

      <View style={styles.row}>
        {/* Left: countdown */}
        <View style={styles.left}>
          <Text style={[styles.label, {
            color: t.textMuted,
            fontFamily: t.fontUI,
            letterSpacing: theme === 'k' ? 2 : 1.5,
          }]}>
            {theme === 'c' ? 'SEPTEMBER COUNTDOWN' : 'DEPARTURE CLOCK'}
          </Text>

          <View style={styles.daysRow}>
            <Text style={[styles.daysNum, {
              color: t.accent,
              fontFamily: 'DMSans_500Medium',
            }]}>
              {daysLeft}
            </Text>
            <Text style={[styles.daysUnit, {
              color: t.textMuted,
              fontFamily: t.fontUI,
            }]}>
              {' DAYS'}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={[styles.track, { backgroundColor: t.accentSoft }]}>
            <View style={[styles.fill, {
              width: `${Math.round(progressPct * 100)}%` as any,
              backgroundColor: t.accent,
              shadowColor: t.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 4,
              elevation: 2,
            }]} />
          </View>
        </View>

        {/* Right: destination */}
        <View style={styles.right}>
          <Text style={[styles.label, {
            color: t.textMuted,
            fontFamily: t.fontUI,
            letterSpacing: theme === 'k' ? 2 : 1.5,
          }]}>
            {theme === 'c' ? 'DESTINATION' : 'FIRST RAID'}
          </Text>

          <Text style={[styles.destName, {
            color: t.textPrimary,
            fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
            fontSize: theme === 'k' ? 12 : 15,
          }]}>
            {theme === 'c' ? 'Kendwa' : 'Zanzibar'}
          </Text>

          <Text style={[styles.destSub, {
            color: t.textMuted,
            fontFamily: t.fontUIReg,
          }]}>
            {theme === 'c' ? '🌊 Zanzibar' : '30-day streak'}
          </Text>

          {zanzibarUnlocked ? (
            <Text style={[styles.unlockText, {
              color: t.accent,
              fontFamily: 'DMSans_500Medium',
            }]}>
              ✦ UNLOCKED
            </Text>
          ) : (
            <Text style={[styles.unlockText, {
              color: t.xpGold,
              fontFamily: 'DMSans_500Medium',
            }]}>
              {streakToUnlock} days →
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 6,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  label: {
    fontSize: 8,
    letterSpacing: 1.5,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  daysNum: {
    fontSize: 28,
    lineHeight: 32,
  },
  daysUnit: {
    fontSize: 11,
    lineHeight: 32,
  },
  track: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: 2,
    borderRadius: 1,
  },
  destName: {
    lineHeight: 20,
  },
  destSub: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  unlockText: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
});
