import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, K } from '../lib/theme';
import { Theme } from '../lib/supabase';

interface Props {
  theme: Theme;
  septemberDate: string;
}

export default function SeptemberCountdown({ theme, septemberDate }: Props) {
  const t = theme === 'c' ? C : K;

  const now = new Date();
  const target = new Date(septemberDate);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const diffWeeks = Math.floor(diffDays / 7);
  const remainderDays = diffDays % 7;

  const totalDays = Math.ceil(
    (target.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = totalDays - diffDays;
  const progress = Math.min(1, Math.max(0, elapsed / totalDays));

  const isReached = diffDays === 0;

  const label = theme === 'c'
    ? isReached ? 'The tide has turned. Zanzibar awaits.' : 'Until the ocean'
    : isReached ? 'The raid begins. Valhalla is close.' : 'Until the conquest';

  return (
    <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
      <View style={styles.row}>
        <View>
          <Text style={[styles.label, { color: t.textMuted, fontFamily: t.fontUI }]}>
            {label.toUpperCase()}
          </Text>
          <View style={styles.numberRow}>
            {!isReached && (
              <>
                <Text style={[styles.bigNumber, {
                  color: t.accent,
                  fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
                }]}>
                  {diffDays}
                </Text>
                <Text style={[styles.unit, { color: t.textSecondary }]}>days</Text>
              </>
            )}
            {isReached && (
              <Text style={[styles.reachedText, { color: t.accent, fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular' }]}>
                ✦ NOW
              </Text>
            )}
          </View>
          {!isReached && diffWeeks > 0 && (
            <Text style={[styles.breakdown, { color: t.textMuted }]}>
              {diffWeeks}w {remainderDays}d · {new Date(septemberDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Arc progress visual */}
        <View style={styles.progressVisual}>
          <Text style={[styles.progressPercent, {
            color: t.accent,
            fontFamily: 'DMSans_500Medium',
          }]}>
            {Math.round(progress * 100)}%
          </Text>
          <Text style={[styles.progressLabel, { color: t.textMuted }]}>there</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.track, { backgroundColor: t.accentSoft }]}>
        <View style={[styles.fill, {
          width: `${progress * 100}%`,
          backgroundColor: t.accent,
          shadowColor: t.accentGlow,
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bigNumber: {
    fontSize: 42,
    lineHeight: 48,
  },
  unit: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  breakdown: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 11,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  reachedText: {
    fontSize: 32,
  },
  progressVisual: {
    alignItems: 'center',
    gap: 2,
  },
  progressPercent: {
    fontSize: 22,
  },
  progressLabel: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 10,
    letterSpacing: 1,
  },
  track: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: 2,
    borderRadius: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
