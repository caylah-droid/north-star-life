import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

// Pearl SVG icons for Caylah (thin line art via paths rendered as Unicode or description)
// We use text-based representations since we're in RN without SVG lib dependency
const CAYLAH_ICONS: Record<PillarKey, string> = {
  move:    '☽',  // Crescent moon
  nourish: '✦',  // Star of the sea
  mind:    'ॐ',  // Om
  build:   '✶',  // 6-point star
};

export default function PillarCard({ pillar, theme, done, onToggle }: Props) {
  const t = theme === 'c' ? C : K;

  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(done ? 1 : 0)).current;
  const checkScale = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(glowOpacity, {
        toValue: done ? 1 : 0,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: done ? 1 : 0,
        tension: 400,
        friction: 18,
        useNativeDriver: true,
      }),
    ]).start();
  }, [done]);

  function handlePress() {
    // Spring press feedback
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.96, tension: 400, friction: 15, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 300, friction: 20, useNativeDriver: true }),
    ]).start();
    onToggle();
  }

  const cardBorderColor = done ? t.accent : t.cardBorder;
  const cardBg = done
    ? theme === 'c' ? 'rgba(0,212,220,0.08)' : 'rgba(192,208,224,0.06)'
    : t.cardBg;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorderColor,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Glow overlay when done */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glowOverlay,
            {
              borderRadius: 12,
              backgroundColor: theme === 'c' ? 'rgba(0,212,220,0.05)' : 'rgba(192,208,224,0.04)',
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Left: Icon + Label */}
        <View style={styles.left}>
          {theme === 'c' ? (
            <Text style={[styles.caylahIcon, {
              color: done ? C.accentHi : C.textMuted,
              textShadowColor: done ? C.accentGlow : 'transparent',
              textShadowRadius: done ? 8 : 0,
            }]}>
              {CAYLAH_ICONS[pillar.key]}
            </Text>
          ) : (
            <Text style={[styles.runeIcon, {
              color: done ? K.accentHi : K.textMuted,
              textShadowColor: done ? K.accentGlow : 'transparent',
              textShadowRadius: done ? 10 : 0,
            }]}>
              {pillar.runeChar}
            </Text>
          )}

          <View style={styles.labelContainer}>
            <Text style={[styles.pillarLabel, {
              color: done ? t.textPrimary : t.textSecondary,
              fontFamily: t.fontUI,
              letterSpacing: theme === 'k' ? 2 : 1,
            }]}>
              {pillar.label}
            </Text>
            {theme === 'k' && (
              <Text style={[styles.runeName, { color: K.textMuted }]}>
                {pillar.runeName}
              </Text>
            )}
          </View>
        </View>

        {/* Right: Ring */}
        <View style={styles.right}>
          {theme === 'c' ? (
            <PearlRing done={done} accent={C.accent} accentHi={C.accentHi} />
          ) : (
            <RuneRing done={done} accent={K.accent} accentHi={K.accentHi} />
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Pearl Ring ────────────────────────────────────────────────────────────────
function PearlRing({ done, accent, accentHi }: { done: boolean; accent: string; accentHi: string }) {
  const PEARL_COUNT = 20;
  const RADIUS = 20;
  const CENTER = 24;
  const lit = done ? PEARL_COUNT : 0;

  return (
    <View style={{ width: CENTER * 2, height: CENTER * 2 }}>
      {Array.from({ length: PEARL_COUNT }, (_, i) => {
        const angle = (i / PEARL_COUNT) * Math.PI * 2 - Math.PI / 2;
        const x = CENTER + RADIUS * Math.cos(angle) - 3;
        const y = CENTER + RADIUS * Math.sin(angle) - 3;
        const isLit = done; // all or none for simplicity — progressive in Phase 2
        const isCardinal = i % 5 === 0;
        const size = isCardinal ? 6 : 4;

        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isLit ? accentHi : 'rgba(0,210,220,0.18)',
              shadowColor: isLit ? accent : 'transparent',
              shadowOpacity: isLit ? 0.9 : 0,
              shadowRadius: isLit ? 4 : 0,
              shadowOffset: { width: 0, height: 0 },
              elevation: isLit ? 2 : 0,
            }}
          />
        );
      })}

      {/* Centre tick */}
      {done && (
        <View style={{
          position: 'absolute',
          left: CENTER - 8,
          top: CENTER - 8,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: accent,
          shadowOpacity: 0.8,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>
        </View>
      )}
    </View>
  );
}

// ── Rune Ring ─────────────────────────────────────────────────────────────────
function RuneRing({ done, accent, accentHi }: { done: boolean; accent: string; accentHi: string }) {
  const TICK_COUNT = 24;
  const RADIUS = 20;
  const CENTER = 24;

  return (
    <View style={{ width: CENTER * 2, height: CENTER * 2 }}>
      {Array.from({ length: TICK_COUNT }, (_, i) => {
        const angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
        const isMajor = i % 4 === 0;
        const tickLen = isMajor ? 7 : 4;
        const innerR = RADIUS - tickLen;
        const outerR = RADIUS;

        const x1 = CENTER + innerR * Math.cos(angle);
        const y1 = CENTER + innerR * Math.sin(angle);
        const x2 = CENTER + outerR * Math.cos(angle);
        const y2 = CENTER + outerR * Math.sin(angle);

        // Render tick as a thin View rotated
        const tickWidth = isMajor ? 1.5 : 1;
        const color = done ? (isMajor ? accentHi : accent) : (isMajor ? 'rgba(192,208,224,0.3)' : 'rgba(192,208,224,0.15)');

        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: CENTER + innerR * Math.cos(angle) - tickWidth / 2,
              top: CENTER + innerR * Math.sin(angle) - tickWidth / 2,
              width: tickWidth,
              height: tickLen,
              backgroundColor: color,
              transform: [{ rotate: `${angle + Math.PI / 2}rad` }],
              transformOrigin: 'top center',
              shadowColor: done ? accent : 'transparent',
              shadowOpacity: done && isMajor ? 0.8 : 0,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        );
      })}

      {/* Centre */}
      {done && (
        <View style={{
          position: 'absolute',
          left: CENTER - 8,
          top: CENTER - 8,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: accent,
          shadowOpacity: 0.8,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}>
          <Text style={{ color: '#07080B', fontSize: 10, fontWeight: '700' }}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glowOverlay: {
    pointerEvents: 'none',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  labelContainer: {
    gap: 2,
  },
  caylahIcon: {
    fontSize: 22,
    width: 28,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
  },
  runeIcon: {
    fontSize: 24,
    fontFamily: 'CinzelDecorative_400Regular',
    width: 30,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
  },
  pillarLabel: {
    fontSize: 14,
  },
  runeName: {
    fontFamily: 'Raleway_400Regular',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  right: {
    marginLeft: 12,
  },
});
