import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { C, K } from '../lib/theme';
import { Theme, PillarKey } from '../lib/supabase';

interface Pillar {
  key: PillarKey;
  label: string;
  runeChar: string;
  runeName: string;
}

interface Props {
  pillar: Pillar;
  theme: Theme;
  done: boolean;
  onToggle: () => void;
}

const CAYLAH_ICONS: Record<PillarKey, string> = {
  move:    '☽',
  nourish: '✦',
  mind:    'ॐ',
  build:   '✶',
};

// ── Pearl Ring ────────────────────────────────────────────────────────────────
function PearlRing({ done }: { done: boolean }) {
  const PEARL_COUNT = 20;
  const RADIUS = 20;
  const CENTER = 24;

  const centreScale = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(centreScale, {
      toValue: done ? 1 : 0,
      tension: 260,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [done]);

  return (
    <View style={{ width: CENTER * 2, height: CENTER * 2 }}>
      {Array.from({ length: PEARL_COUNT }, (_, i) => {
        const angle = (i / PEARL_COUNT) * Math.PI * 2 - Math.PI / 2;
        const x = CENTER + RADIUS * Math.cos(angle);
        const y = CENTER + RADIUS * Math.sin(angle);
        const isCardinal = i % 5 === 0;
        const size = isCardinal ? 6 : 4;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: done ? (isCardinal ? '#40EEF5' : '#00D4DC') : 'rgba(0,210,220,0.18)',
              shadowColor: done ? '#00D4DC' : 'transparent',
              shadowOpacity: done ? (isCardinal ? 1 : 0.6) : 0,
              shadowRadius: done ? (isCardinal ? 5 : 3) : 0,
              shadowOffset: { width: 0, height: 0 },
              elevation: done ? 2 : 0,
            }}
          />
        );
      })}
      {done && (
        <Animated.View style={{
          position: 'absolute',
          left: CENTER - 9,
          top: CENTER - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: C.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: C.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 8,
          elevation: 4,
          opacity: centreScale,
          transform: [{ scale: centreScale }],
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 14 }}>✓</Text>
        </Animated.View>
      )}
    </View>
  );
}

// ── Rune Ring ─────────────────────────────────────────────────────────────────
function RuneRing({ done }: { done: boolean }) {
  const TICK_COUNT = 24;
  const RADIUS = 20;
  const CENTER = 24;

  const centreScale = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(centreScale, {
      toValue: done ? 1 : 0,
      tension: 260,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [done]);

  return (
    <View style={{ width: CENTER * 2, height: CENTER * 2 }}>
      {Array.from({ length: TICK_COUNT }, (_, i) => {
        const angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
        const isMajor = i % 4 === 0;
        const tickLen = isMajor ? 7 : 4;
        const innerR = RADIUS - tickLen;
        const midR = innerR + tickLen / 2;
        const cx = CENTER + midR * Math.cos(angle);
        const cy = CENTER + midR * Math.sin(angle);
        const rotateDeg = (angle * 180) / Math.PI + 90;
        const color = done
          ? (isMajor ? '#E8EEF5' : '#C0D0E0')
          : (isMajor ? 'rgba(192,208,224,0.30)' : 'rgba(192,208,224,0.12)');
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: cx - (isMajor ? 0.75 : 0.5),
              top: cy - tickLen / 2,
              width: isMajor ? 1.5 : 1,
              height: tickLen,
              backgroundColor: color,
              transform: [{ rotate: `${rotateDeg}deg` }],
              shadowColor: done && isMajor ? '#C0D0E0' : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: done && isMajor ? 0.8 : 0,
              shadowRadius: done && isMajor ? 3 : 0,
            }}
          />
        );
      })}
      {done && (
        <Animated.View style={{
          position: 'absolute',
          left: CENTER - 8.5,
          top: CENTER - 8.5,
          width: 17,
          height: 17,
          borderRadius: 8.5,
          backgroundColor: K.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: K.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 4,
          opacity: centreScale,
          transform: [{ scale: centreScale }],
        }}>
          <Text style={{ color: '#07080B', fontSize: 9, fontWeight: '700', lineHeight: 13 }}>✓</Text>
        </Animated.View>
      )}
    </View>
  );
}

// ── PillarCard ────────────────────────────────────────────────────────────────
export default function PillarCard({ pillar, theme, done, onToggle }: Props) {
  const t = theme === 'c' ? C : K;

  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(glowOpacity, {
      toValue: done ? 1 : 0,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [done]);

  function handlePress() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.965, tension: 400, friction: 15, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 300, friction: 20, useNativeDriver: true }),
    ]).start();
    onToggle();
  }

  const cardBg = done
    ? theme === 'c' ? 'rgba(0,212,220,0.07)' : 'rgba(192,208,224,0.05)'
    : t.cardBg;

  const cardBorder = done
    ? theme === 'c' ? 'rgba(0,212,220,0.45)' : 'rgba(192,208,224,0.30)'
    : t.cardBorder;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              transform: [{ scale }],
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {/* Glow overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 12,
                backgroundColor: theme === 'c'
                  ? 'rgba(0,212,220,0.04)'
                  : 'rgba(192,208,224,0.03)',
                opacity: glowOpacity,
              },
            ]}
            pointerEvents="none"
          />

          {/* Left: icon + label */}
          <View style={styles.left}>
            {theme === 'c' ? (
              <Text style={[styles.caylahIcon, {
                color: done ? C.accentHi : C.textMuted,
                textShadowColor: done ? C.accentGlow : 'transparent',
                textShadowRadius: done ? 10 : 0,
                textShadowOffset: { width: 0, height: 0 },
              }]}>
                {CAYLAH_ICONS[pillar.key]}
              </Text>
            ) : (
              <Text style={[styles.runeIcon, {
                color: done ? K.accentHi : K.textMuted,
                textShadowColor: done ? K.accentGlow : 'transparent',
                textShadowRadius: done ? 12 : 0,
                textShadowOffset: { width: 0, height: 0 },
              }]}>
                {pillar.runeChar}
              </Text>
            )}

            <View style={styles.labelBlock}>
              <Text style={[styles.pillarLabel, {
                color: done ? t.textPrimary : t.textSecondary,
                fontFamily: t.fontUI,
                letterSpacing: theme === 'k' ? 2 : 1,
              }]}>
                {pillar.label}
              </Text>
              {theme === 'k' && (
                <Text style={[styles.runeName, {
                  color: K.textMuted,
                  fontFamily: K.fontUIReg,
                }]}>
                  {pillar.runeName}
                </Text>
              )}
            </View>
          </View>

          {/* Right: ring */}
          <View style={styles.right} pointerEvents="none">
            {theme === 'c' ? <PearlRing done={done} /> : <RuneRing done={done} />}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flex: 1,
  },
  labelBlock: {
    gap: 2,
  },
  caylahIcon: {
    fontSize: 20,
    width: 26,
    textAlign: 'center',
  },
  runeIcon: {
    fontSize: 22,
    fontFamily: 'CinzelDecorative_400Regular',
    width: 28,
    textAlign: 'center',
  },
  pillarLabel: {
    fontSize: 13,
  },
  runeName: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  right: {
    marginLeft: 8,
  },
});
