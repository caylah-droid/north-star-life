import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Dimensions, RefreshControl, TextInput, Modal,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, useTheme } from '../../lib/store';
import { C, K } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

const { width: SW, height: SH } = Dimensions.get('screen');

const STARS = Array.from({ length: 55 }, (_, i) => ({
  top: Math.random() * SH,
  left: Math.random() * SW,
  opacity: 0.04 + Math.random() * 0.2,
  size: i % 5 === 0 ? 2.2 : 1.2,
  isTeal: i % 4 === 0,
}));

// ── Destination data ──────────────────────────────────────────────────────────
const DESTINATIONS = [
  {
    id: 'zanzibar',
    name: 'Kendwa Beach',
    kName: 'ZANZIBAR',
    country: 'Tanzania',
    region: 'East Africa',
    unlockStreak: 30,
    phase: 1,
    cDesc: 'Crystal turquoise water. White sand. The dream made real.',
    kDesc: 'First raid target. 30-day streak unlocks this.',
    cIcon: '🌊',
    kRune: 'ᛟ',
    costEstimate: 'R18,000 / 2 weeks',
    bestTime: 'Jun–Oct',
    coords: { x: 0.72, y: 0.52 },
  },
  {
    id: 'mauritius',
    name: 'Mauritius',
    kName: 'MAURITIUS',
    country: 'Mauritius',
    region: 'Indian Ocean',
    unlockStreak: 60,
    phase: 1,
    cDesc: 'Lagoons. Luxury. Earned rest.',
    kDesc: 'Island stronghold. 60-day streak.',
    cIcon: '✦',
    kRune: 'ᚢ',
    costEstimate: 'R24,000 / 2 weeks',
    bestTime: 'May–Dec',
    coords: { x: 0.76, y: 0.58 },
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    kName: 'CAPE TOWN',
    country: 'South Africa',
    region: 'Western Cape',
    unlockStreak: 14,
    phase: 1,
    cDesc: 'The mountain. The ocean. Home base elevated.',
    kDesc: 'Home territory. First base of operations.',
    cIcon: '⛰',
    kRune: 'ᚦ',
    costEstimate: 'R8,000 / 2 weeks',
    bestTime: 'Nov–Mar',
    coords: { x: 0.52, y: 0.72 },
  },
  {
    id: 'mozambique',
    name: 'Tofo Beach',
    kName: 'MOZAMBIQUE',
    country: 'Mozambique',
    region: 'Southern Africa',
    unlockStreak: 45,
    phase: 1,
    cDesc: 'Manta rays. Whale sharks. Wild ocean.',
    kDesc: 'Wild coast. 45-day streak.',
    cIcon: '◎',
    kRune: 'ᚱ',
    costEstimate: 'R14,000 / 2 weeks',
    bestTime: 'Oct–Mar',
    coords: { x: 0.65, y: 0.62 },
  },
  {
    id: 'bali',
    name: 'Canggu',
    kName: 'BALI',
    country: 'Indonesia',
    region: 'SE Asia',
    unlockStreak: 90,
    phase: 2,
    cDesc: 'Rice fields. Temples. Digital nomad heaven.',
    kDesc: 'SE Asia base camp. 90-day streak.',
    cIcon: '☽',
    kRune: 'ᛏ',
    costEstimate: 'R16,000 / month',
    bestTime: 'Apr–Oct',
    coords: { x: 0.84, y: 0.44 },
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    kName: 'LISBON',
    country: 'Portugal',
    region: 'Europe',
    unlockStreak: 120,
    phase: 2,
    cDesc: 'Pastel tiles. Atlantic light. Europe begins.',
    kDesc: 'European beachhead. 120-day streak.',
    cIcon: '✶',
    kRune: 'ᚹ',
    costEstimate: 'R28,000 / month',
    bestTime: 'Apr–Oct',
    coords: { x: 0.30, y: 0.24 },
  },
  {
    id: 'chiang-mai',
    name: 'Chiang Mai',
    kName: 'CHIANG MAI',
    country: 'Thailand',
    region: 'SE Asia',
    unlockStreak: 100,
    phase: 2,
    cDesc: 'Mountains. Markets. The nomad trail.',
    kDesc: 'Northern stronghold. 100-day streak.',
    cIcon: '◈',
    kRune: 'ᛚ',
    costEstimate: 'R10,000 / month',
    bestTime: 'Nov–Apr',
    coords: { x: 0.80, y: 0.32 },
  },
  {
    id: 'medellin',
    name: 'Medellín',
    kName: 'MEDELLÍN',
    country: 'Colombia',
    region: 'South America',
    unlockStreak: 150,
    phase: 2,
    cDesc: 'Spring forever. Mountains. The unexpected.',
    kDesc: 'South American conquest. 150-day streak.',
    cIcon: '⬡',
    kRune: 'ᛜ',
    costEstimate: 'R12,000 / month',
    bestTime: 'Year-round',
    coords: { x: 0.20, y: 0.44 },
  },
];

// ── Destination pin ───────────────────────────────────────────────────────────
function DestPin({
  dest, unlocked, active, onPress, theme,
}: {
  dest: typeof DESTINATIONS[0];
  unlocked: boolean;
  active: boolean;
  onPress: () => void;
  theme: 'c' | 'k';
}) {
  const t = theme === 'c' ? C : K;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [unlocked]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: 'absolute',
        left: dest.coords.x * (SW - 48) - 10,
        top: dest.coords.y * 220 - 10,
      }}
      activeOpacity={0.7}
    >
      {unlocked && (
        <Animated.View style={{
          position: 'absolute',
          width: 20, height: 20,
          borderRadius: 10,
          backgroundColor: t.accentSoft,
          top: 0, left: 0,
          transform: [{ scale: pulse }],
        }} />
      )}
      <View style={{
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: unlocked
          ? t.accent
          : active ? t.accentSoft : 'rgba(255,255,255,0.08)',
        borderWidth: 1.5,
        borderColor: unlocked
          ? t.accentHi
          : active ? t.accent : t.cardBorder,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: unlocked ? t.accent : 'transparent',
        shadowOpacity: unlocked ? 0.8 : 0,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      }}>
        {unlocked ? (
          <Text style={{ color: theme === 'c' ? C.bg0 : K.bg0, fontSize: 8, fontWeight: '700' }}>✦</Text>
        ) : (
          <View style={{
            width: 5, height: 5, borderRadius: 2.5,
            backgroundColor: active ? t.accent : t.textMuted,
          }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Destination detail card ───────────────────────────────────────────────────
function DestCard({
  dest, streak, theme, onClose,
}: {
  dest: typeof DESTINATIONS[0];
  streak: number;
  theme: 'c' | 'k';
  onClose: () => void;
}) {
  const t = theme === 'c' ? C : K;
  const isCaylah = theme === 'c';
  const unlocked = streak >= dest.unlockStreak;
  const progress = Math.min(1, streak / dest.unlockStreak);
  const daysLeft = Math.max(0, dest.unlockStreak - streak);

  return (
    <Animated.View style={[{
      borderRadius: 16,
      borderWidth: 1,
      padding: 18,
      marginBottom: 12,
      backgroundColor: unlocked
        ? (isCaylah ? 'rgba(0,212,220,0.06)' : 'rgba(192,208,224,0.05)')
        : t.cardBg,
      borderColor: unlocked
        ? (isCaylah ? 'rgba(0,212,220,0.45)' : 'rgba(192,208,224,0.3)')
        : t.cardBorder,
      shadowColor: unlocked ? t.accent : 'transparent',
      shadowOpacity: unlocked ? 0.25 : 0,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 0 },
    }]}>
      {unlocked && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          backgroundColor: t.accent, borderTopLeftRadius: 16, borderTopRightRadius: 16,
        }} />
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <Text style={{
              fontSize: isCaylah ? 16 : 14,
              color: unlocked ? t.accentHi : t.textMuted,
              fontFamily: !isCaylah ? 'CinzelDecorative_400Regular' : undefined,
              textShadowColor: unlocked ? t.accentGlow : 'transparent',
              textShadowRadius: unlocked ? 8 : 0,
              textShadowOffset: { width: 0, height: 0 },
            }}>
              {isCaylah ? dest.cIcon : dest.kRune}
            </Text>
            <Text style={{
              fontSize: 9, letterSpacing: 1.5,
              color: t.textMuted, fontFamily: t.fontUI,
            }}>
              PHASE {dest.phase} · {dest.region}
            </Text>
          </View>
          <Text style={{
            color: unlocked ? t.accent : t.textPrimary,
            fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
            fontSize: isCaylah ? 20 : 15,
            lineHeight: isCaylah ? 26 : 22,
          }}>
            {isCaylah ? dest.name : dest.kName}
          </Text>
          <Text style={{
            color: t.textMuted, fontFamily: t.fontUIReg, fontSize: 11, marginTop: 2,
          }}>
            {dest.country}
          </Text>
        </View>

        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Text style={{ color: t.textMuted, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={{
        color: t.textSecondary,
        fontFamily: isCaylah ? 'Marcellus_400Regular' : t.fontUIReg,
        fontStyle: isCaylah ? 'italic' : 'normal',
        fontSize: 13, lineHeight: 20, marginTop: 10,
      }}>
        {isCaylah ? dest.cDesc : dest.kDesc}
      </Text>

      {/* Unlock progress */}
      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: t.textMuted, fontFamily: t.fontUI, fontSize: 9, letterSpacing: 1.5 }}>
            {unlocked
              ? (isCaylah ? '✦ UNLOCKED' : '✦ TARGET ACQUIRED')
              : (isCaylah ? 'UNLOCK STREAK' : 'STREAK REQUIRED')}
          </Text>
          <Text style={{ color: unlocked ? t.accent : t.xpGold, fontFamily: 'DMSans_500Medium', fontSize: 11 }}>
            {unlocked
              ? `${dest.unlockStreak} days ✓`
              : `${streak}/${dest.unlockStreak} days`}
          </Text>
        </View>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: t.accentSoft, overflow: 'hidden' }}>
          <View style={{
            height: 3, borderRadius: 2,
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: unlocked ? t.accent : t.xpGold,
            shadowColor: unlocked ? t.accent : t.xpGold,
            shadowOpacity: 0.7, shadowRadius: 4,
            shadowOffset: { width: 0, height: 0 },
          }} />
        </View>
        {!unlocked && (
          <Text style={{ color: t.textMuted, fontFamily: t.fontUIReg, fontSize: 10, marginTop: 5 }}>
            {isCaylah
              ? `${daysLeft} more days of showing up.`
              : `${daysLeft} DAYS REMAIN.`}
          </Text>
        )}
      </View>

      {/* Details row */}
      <View style={{
        flexDirection: 'row', gap: 16, marginTop: 14,
        paddingTop: 12, borderTopWidth: 1, borderTopColor: t.cardBorder,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.textMuted, fontFamily: t.fontUI, fontSize: 8, letterSpacing: 1.5, marginBottom: 2 }}>
            COST EST.
          </Text>
          <Text style={{ color: t.textSecondary, fontFamily: 'DMSans_400Regular', fontSize: 11 }}>
            {dest.costEstimate}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.textMuted, fontFamily: t.fontUI, fontSize: 8, letterSpacing: 1.5, marginBottom: 2 }}>
            BEST TIME
          </Text>
          <Text style={{ color: t.textSecondary, fontFamily: 'DMSans_400Regular', fontSize: 11 }}>
            {dest.bestTime}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Couple win item ───────────────────────────────────────────────────────────
function WinItem({
  win, isOwnWin, theme,
}: {
  win: { id: string; content: string; posted_by: string; created_at: string; poster_name?: string };
  isOwnWin: boolean;
  theme: 'c' | 'k';
}) {
  const t = theme === 'c' ? C : K;
  const isCaylah = theme === 'c';
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1, tension: 200, friction: 18, useNativeDriver: true,
    }).start();
  }, []);

  const date = new Date(win.created_at);
  const dateStr = date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });

  return (
    <Animated.View style={[{
      borderRadius: 12, borderWidth: 1,
      padding: 14, marginBottom: 8,
      transform: [{ scale }],
      backgroundColor: isOwnWin
        ? (isCaylah ? 'rgba(0,212,220,0.06)' : 'rgba(192,208,224,0.05)')
        : t.cardBg,
      borderColor: isOwnWin
        ? (isCaylah ? 'rgba(0,212,220,0.35)' : 'rgba(192,208,224,0.22)')
        : t.cardBorder,
    }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: isOwnWin ? t.accentSoft : 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: isOwnWin ? t.accent : t.cardBorder,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 10,
              color: isOwnWin ? t.accent : t.textMuted,
              fontFamily: !isCaylah ? 'CinzelDecorative_400Regular' : undefined,
            }}>
              {isCaylah ? (isOwnWin ? '✦' : '☽') : (isOwnWin ? 'ᚠ' : 'ᚦ')}
            </Text>
          </View>
          <Text style={{
            color: isOwnWin ? t.textSecondary : t.textMuted,
            fontFamily: t.fontUI,
            fontSize: 10,
            letterSpacing: 1,
          }}>
            {win.poster_name ?? (isOwnWin ? 'You' : 'Partner')}
          </Text>
        </View>
        <Text style={{ color: t.textMuted, fontFamily: 'DMSans_400Regular', fontSize: 10 }}>
          {dateStr}
        </Text>
      </View>
      <Text style={{
        color: t.textPrimary,
        fontFamily: isCaylah && isOwnWin ? 'Marcellus_400Regular' : t.fontUIReg,
        fontSize: 14,
        lineHeight: 20,
        fontStyle: isCaylah && isOwnWin ? 'italic' : 'normal',
      }}>
        {win.content}
      </Text>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LifeScreen() {
  const theme = useTheme();
  const { profile, partnerProfile, loadProfile, loadPartner } = useStore();
  const t = theme === 'c' ? C : K;
  const isCaylah = theme === 'c';

  const currentStreak = profile?.streak ?? 0;

  // Destination state
  const [activeDestId, setActiveDestId] = useState<string | null>('zanzibar');
  const [expandedDestId, setExpandedDestId] = useState<string | null>(null);

  // Wins state
  const [wins, setWins] = useState<Array<{
    id: string; content: string; posted_by: string; created_at: string; poster_name?: string;
  }>>([]);
  const [winsLoading, setWinsLoading] = useState(false);
  const [winModal, setWinModal] = useState(false);
  const [winText, setWinText] = useState('');
  const [posting, setPosting] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'wins'>('map');

  // Map scroll animation
  const mapScrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWins();
  }, []);

  async function loadWins() {
    if (!profile) return;
    setWinsLoading(true);
    try {
      const { data } = await supabase
        .from('couple_wins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        // Attach names
        const withNames = data.map((w) => ({
          ...w,
          poster_name: w.posted_by === profile.id
            ? profile.name
            : (partnerProfile?.name ?? 'Partner'),
        }));
        setWins(withNames);
      }
    } catch (e) {
      // silently fail
    }
    setWinsLoading(false);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadPartner(), loadWins()]);
    setRefreshing(false);
  }, [profile]);

  async function postWin() {
    if (!winText.trim() || !profile) return;
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('couple_wins')
        .insert({ posted_by: profile.id, content: winText.trim() })
        .select()
        .single();
      if (data) {
        setWins((prev) => [{
          ...data,
          poster_name: profile.name,
        }, ...prev]);
      }
      setWinModal(false);
      setWinText('');
    } catch (e) {
      // silently fail
    }
    setPosting(false);
  }

  async function deleteWin(id: string) {
    await supabase.from('couple_wins').delete().eq('id', id);
    setWins((prev) => prev.filter((w) => w.id !== id));
  }

  const unlockedCount = DESTINATIONS.filter((d) => currentStreak >= d.unlockStreak).length;
  const activeDest = expandedDestId ? DESTINATIONS.find((d) => d.id === expandedDestId) : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isCaylah ? [C.bg0, C.bg1, C.bg2] : [K.bg0, K.bg1, K.bg2]}
        style={StyleSheet.absoluteFill}
      />
      {STARS.map((s, i) => (
        <View key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: s.size / 2,
          backgroundColor: s.isTeal && isCaylah ? C.accent : '#FFFFFF',
          opacity: s.opacity,
        }} />
      ))}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />
        }
      >
        {/* ── HEADER ── */}
        <Text style={[styles.eyebrow, { color: t.textMuted, fontFamily: t.fontUI }]}>
          {isCaylah ? 'LIFE HUB' : 'THE RAID MAP'}
        </Text>
        <Text style={[styles.screenTitle, {
          color: t.textPrimary,
          fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
          fontSize: isCaylah ? 26 : 18,
        }]}>
          {isCaylah ? 'The life you\'re building.' : 'CONQUER THE WORLD'}
        </Text>
        <Text style={[styles.screenSub, { color: t.textSecondary, fontFamily: t.fontUIReg, marginBottom: 20 }]}>
          {isCaylah
            ? `${unlockedCount} of ${DESTINATIONS.length} destinations unlocked.`
            : `${unlockedCount}/${DESTINATIONS.length} RAID TARGETS ACQUIRED.`}
        </Text>

        {/* ── TAB SWITCHER ── */}
        <View style={[styles.tabRow, { borderColor: t.cardBorder, backgroundColor: t.cardBg }]}>
          {(['map', 'wins'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, {
                backgroundColor: activeTab === tab ? t.accentSoft : 'transparent',
                borderColor: activeTab === tab ? t.accent : 'transparent',
              }]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={{
                color: activeTab === tab ? t.accent : t.textMuted,
                fontFamily: t.fontUI,
                fontSize: 10,
                letterSpacing: 2,
              }}>
                {tab === 'map'
                  ? (isCaylah ? 'DESTINATIONS' : 'RAID TARGETS')
                  : (isCaylah ? 'COUPLE WINS' : 'VICTORIES')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'map' && (
          <>
            {/* ── WORLD MAP (schematic) ── */}
            <View style={[styles.card, {
              backgroundColor: t.cardBg,
              borderColor: t.cardBorder,
              padding: 0,
              overflow: 'hidden',
            }]}>
              {/* Map background */}
              <View style={styles.mapContainer}>
                {/* Continent silhouettes (abstract) */}
                <MapBackground theme={theme} />

                {/* Destination pins */}
                {DESTINATIONS.map((dest) => (
                  <DestPin
                    key={dest.id}
                    dest={dest}
                    unlocked={currentStreak >= dest.unlockStreak}
                    active={activeDestId === dest.id}
                    onPress={() => {
                      setActiveDestId(dest.id);
                      setExpandedDestId(dest.id);
                    }}
                    theme={theme}
                  />
                ))}

                {/* Map label */}
                <View style={styles.mapLabel}>
                  <Text style={{ color: t.textMuted, fontFamily: t.fontUI, fontSize: 7, letterSpacing: 2 }}>
                    {isCaylah ? 'TAP A DESTINATION' : 'TAP TARGET'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── EXPANDED DESTINATION CARD ── */}
            {activeDest && (
              <DestCard
                dest={activeDest}
                streak={currentStreak}
                theme={theme}
                onClose={() => setExpandedDestId(null)}
              />
            )}

            {/* ── DESTINATION LIST ── */}
            <Text style={[styles.sectionLabel, { color: t.textMuted, fontFamily: t.fontUI, marginBottom: 8 }]}>
              {isCaylah ? 'ALL DESTINATIONS' : 'ALL TARGETS'}
            </Text>

            {/* Phase 1 */}
            <Text style={[styles.phaseLabel, { color: t.xpGold, fontFamily: t.fontUI, marginBottom: 6 }]}>
              {isCaylah ? 'PHASE 1 · AFRICA & INDIAN OCEAN' : 'PHASE 1 · SOUTHERN CAMPAIGN'}
            </Text>
            {DESTINATIONS.filter((d) => d.phase === 1).map((dest) => (
              <DestListRow
                key={dest.id}
                dest={dest}
                streak={currentStreak}
                theme={theme}
                active={activeDestId === dest.id}
                onPress={() => {
                  setActiveDestId(dest.id);
                  setExpandedDestId(dest.id);
                }}
              />
            ))}

            {/* Phase 2 */}
            <Text style={[styles.phaseLabel, { color: t.textMuted, fontFamily: t.fontUI, marginBottom: 6, marginTop: 14 }]}>
              {isCaylah ? 'PHASE 2 · THE WIDER WORLD' : 'PHASE 2 · GLOBAL CONQUEST'}
            </Text>
            {DESTINATIONS.filter((d) => d.phase === 2).map((dest) => (
              <DestListRow
                key={dest.id}
                dest={dest}
                streak={currentStreak}
                theme={theme}
                active={activeDestId === dest.id}
                onPress={() => {
                  setActiveDestId(dest.id);
                  setExpandedDestId(dest.id);
                }}
              />
            ))}
          </>
        )}

        {activeTab === 'wins' && (
          <>
            {/* ── POST WIN BUTTON ── */}
            <TouchableOpacity
              style={[styles.postWinBtn, {
                backgroundColor: t.accentSoft,
                borderColor: t.accent,
                shadowColor: t.accent,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
              }]}
              onPress={() => setWinModal(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: t.accent, fontSize: 16, marginRight: 10 }}>
                {isCaylah ? '✦' : 'ᚠ'}
              </Text>
              <Text style={{
                color: t.accent, fontFamily: t.fontUI,
                fontSize: 11, letterSpacing: 2, flex: 1,
              }}>
                {isCaylah ? 'POST A WIN' : 'LOG A VICTORY'}
              </Text>
              <Text style={{ color: t.accent, fontSize: 18 }}>+</Text>
            </TouchableOpacity>

            {/* ── WINS WALL ── */}
            {winsLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: t.textMuted, fontFamily: t.fontUIReg, fontSize: 12 }}>
                  {isCaylah ? 'Loading...' : 'LOADING...'}
                </Text>
              </View>
            ) : wins.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: t.cardBorder }]}>
                <Text style={{ color: t.accent, fontSize: 24, marginBottom: 12 }}>
                  {isCaylah ? '✦' : 'ᚠ'}
                </Text>
                <Text style={{
                  color: t.textSecondary,
                  fontFamily: isCaylah ? 'Marcellus_400Regular' : t.fontUI,
                  fontSize: 15,
                  textAlign: 'center',
                  lineHeight: 22,
                }}>
                  {isCaylah
                    ? 'Every win deserves a witness.\nPost your first one.'
                    : 'NO VICTORIES LOGGED.\nBEGIN THE RECORD.'}
                </Text>
              </View>
            ) : (
              wins.map((win) => (
                <WinItem
                  key={win.id}
                  win={win}
                  isOwnWin={win.posted_by === profile?.id}
                  theme={theme}
                />
              ))
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── POST WIN MODAL ── */}
      <Modal
        visible={winModal}
        transparent
        animationType="slide"
        onRequestClose={() => setWinModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setWinModal(false)}
            activeOpacity={1}
          />
          <View style={[styles.modalCard, {
            backgroundColor: isCaylah ? C.bg1 : K.bg1,
            borderColor: t.cardBorder,
          }]}>
            <Text style={[styles.modalLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
              {isCaylah ? 'LOG A WIN' : 'VICTORY LOG'}
            </Text>
            <Text style={[styles.modalTitle, {
              color: t.textPrimary,
              fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
              fontSize: isCaylah ? 20 : 16,
            }]}>
              {isCaylah
                ? 'What happened today worth remembering?'
                : 'WHAT WAS CONQUERED?'}
            </Text>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: t.cardBg,
                borderColor: t.cardBorder,
                color: t.textPrimary,
                fontFamily: 'Raleway_400Regular',
              }]}
              placeholder={isCaylah
                ? 'Got the job offer · Finished the feature · First ocean swim in months...'
                : 'SECURED CONTRACT · HIT NEW PR · FINISHED THE PLAN...'}
              placeholderTextColor={t.textMuted}
              value={winText}
              onChangeText={setWinText}
              multiline
              numberOfLines={3}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalSaveBtn, {
                backgroundColor: winText.trim() ? t.accent : t.accentSoft,
                borderWidth: 1,
                borderColor: t.accent,
                shadowColor: winText.trim() ? t.accent : 'transparent',
                shadowOpacity: 0.5,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
                opacity: posting ? 0.7 : 1,
              }]}
              onPress={postWin}
              disabled={posting || !winText.trim()}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalSaveText, {
                color: winText.trim() ? (isCaylah ? C.bg0 : K.bg0) : t.textMuted,
                fontFamily: t.fontUI,
                letterSpacing: 2,
              }]}>
                {posting
                  ? (isCaylah ? 'POSTING...' : 'LOGGING...')
                  : (isCaylah ? 'POST THIS WIN' : 'LOG VICTORY')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Map background (abstract continents) ─────────────────────────────────────
function MapBackground({ theme }: { theme: 'c' | 'k' }) {
  const t = theme === 'c' ? C : K;
  // Abstract continent shapes as simple rounded rectangles — evocative not literal
  const landmasses: Array<{
    left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%`; borderRadius: number;
  }> = [
    // Africa
    { left: '48%', top: '35%', width: '14%', height: '38%', borderRadius: 8 },
    // Europe
    { left: '42%', top: '12%', width: '12%', height: '20%', borderRadius: 6 },
    // Asia
    { left: '58%', top: '10%', width: '28%', height: '32%', borderRadius: 10 },
    // SE Asia islands
    { left: '74%', top: '36%', width: '8%', height: '12%', borderRadius: 8 },
    // Americas
    { left: '10%', top: '12%', width: '12%', height: '60%', borderRadius: 10 },
    // Australia
    { left: '74%', top: '56%', width: '12%', height: '14%', borderRadius: 8 },
  ];

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Ocean base */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme === 'c' ? 'rgba(0,60,80,0.15)' : 'rgba(10,14,22,0.4)',
      }} />
      {/* Continents */}
      {landmasses.map((m, i) => (
        <View key={i} style={{
          position: 'absolute',
          left: m.left, top: m.top,
          width: m.width, height: m.height,
          borderRadius: m.borderRadius,
          backgroundColor: theme === 'c'
            ? 'rgba(0,100,120,0.18)'
            : 'rgba(100,120,140,0.12)',
          borderWidth: 1,
          borderColor: theme === 'c'
            ? 'rgba(0,212,220,0.08)'
            : 'rgba(192,208,224,0.06)',
        }} />
      ))}
      {/* Grid lines */}
      {([25, 50, 75] as const).map((v, i) => (
        <React.Fragment key={i}>
          <View style={{
            position: 'absolute',
            top: `${v}%` as `${number}%`, left: 0, right: 0, height: 1,
            backgroundColor: theme === 'c' ? 'rgba(0,212,220,0.04)' : 'rgba(192,208,224,0.03)',
          }} />
          <View style={{
            position: 'absolute',
            left: `${v}%` as `${number}%`, top: 0, bottom: 0, width: 1,
            backgroundColor: theme === 'c' ? 'rgba(0,212,220,0.04)' : 'rgba(192,208,224,0.03)',
          }} />
        </React.Fragment>
      ))}
    </View>
  );
}

// ── Destination list row ──────────────────────────────────────────────────────
function DestListRow({
  dest, streak, theme, active, onPress,
}: {
  dest: typeof DESTINATIONS[0];
  streak: number;
  theme: 'c' | 'k';
  active: boolean;
  onPress: () => void;
}) {
  const t = theme === 'c' ? C : K;
  const isCaylah = theme === 'c';
  const unlocked = streak >= dest.unlockStreak;
  const progress = Math.min(1, streak / dest.unlockStreak);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 11, paddingHorizontal: 14,
        borderRadius: 10, borderWidth: 1, marginBottom: 6,
        backgroundColor: unlocked
          ? (isCaylah ? 'rgba(0,212,220,0.06)' : 'rgba(192,208,224,0.04)')
          : active ? t.accentSoft : 'transparent',
        borderColor: unlocked
          ? (isCaylah ? 'rgba(0,212,220,0.4)' : 'rgba(192,208,224,0.25)')
          : active ? t.accent : t.cardBorder,
      }}>
        <Text style={{
          fontSize: isCaylah ? 15 : 13,
          color: unlocked ? t.accentHi : t.textMuted,
          fontFamily: !isCaylah ? 'CinzelDecorative_400Regular' : undefined,
          width: 22, textAlign: 'center',
          textShadowColor: unlocked ? t.accentGlow : 'transparent',
          textShadowRadius: unlocked ? 6 : 0,
          textShadowOffset: { width: 0, height: 0 },
        }}>
          {isCaylah ? dest.cIcon : dest.kRune}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: unlocked ? t.accent : t.textPrimary,
            fontFamily: isCaylah ? 'Marcellus_400Regular' : 'Raleway_600SemiBold',
            fontSize: 13,
            letterSpacing: isCaylah ? 0.3 : 1,
          }}>
            {isCaylah ? dest.name : dest.kName}
          </Text>
          <Text style={{
            color: t.textMuted, fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 1,
          }}>
            {dest.country} · {dest.unlockStreak} day streak
          </Text>
          {!unlocked && (
            <View style={{ height: 2, borderRadius: 1, backgroundColor: t.accentSoft, marginTop: 5, overflow: 'hidden' }}>
              <View style={{
                height: 2, borderRadius: 1,
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: t.xpGold,
              }} />
            </View>
          )}
        </View>
        {unlocked ? (
          <Text style={{ color: t.accent, fontSize: 12 }}>✦</Text>
        ) : (
          <Text style={{ color: t.textMuted, fontFamily: 'DMSans_400Regular', fontSize: 10 }}>
            {Math.max(0, dest.unlockStreak - streak)}d
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 58, paddingHorizontal: 20, paddingBottom: 20 },

  eyebrow: { fontSize: 9, letterSpacing: 2.5, marginBottom: 6 },
  screenTitle: { lineHeight: 32, marginBottom: 4 },
  screenSub: { fontSize: 11 },

  tabRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 240,
    position: 'relative',
  },
  mapLabel: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },

  sectionLabel: { fontSize: 9, letterSpacing: 2 },
  phaseLabel: { fontSize: 9, letterSpacing: 1.5 },

  postWinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  emptyState: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalLabel: { fontSize: 9, letterSpacing: 2 },
  modalTitle: { lineHeight: 26 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
  },
  modalSaveBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSaveText: { fontSize: 13 },
});