import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Animated, Dimensions, Modal,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, useTheme, useProfile, usePartner } from '../../lib/store';
import { C, K } from '../../lib/theme';

const { width: SW } = Dimensions.get('window');

// ── Static stars ──────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 14 }, (_, i) => ({
  top: Math.random() * 280,
  left: Math.random() * SW,
  size: 1 + (i % 2),
  isTeal: i % 4 === 0,
  opacity: 0.1 + (i % 4) * 0.06,
}));

// ── Constants ─────────────────────────────────────────────────────────────────
const INCOME_TARGET = 100000;
const ZANZIBAR_STREAK = 30;
const SAVINGS_MILESTONE = 500000;

const INCOME_MILESTONES = [
  { value: 25000,  label: 'Foundation' },
  { value: 50000,  label: 'Half Free'  },
  { value: 75000,  label: 'Almost'     },
  { value: 100000, label: 'Nomad Mode' },
];

function formatRand(n: number): string {
  if (n >= 1000) return `R${Math.round(n / 1000)}k`;
  return `R${n}`;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
interface EditModalProps {
  visible: boolean;
  current: number;
  label: string;
  theme: 'c' | 'k';
  onSave: (val: number) => void;
  onClose: () => void;
}

function EditModal({ visible, current, label, theme, onSave, onClose }: EditModalProps) {
  const t = theme === 'c' ? C : K;
  const [val, setVal] = useState(String(current));

  useEffect(() => {
    if (visible) setVal(String(current));
  }, [visible, current]);

  function handleSave() {
    const parsed = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 0) onSave(parsed);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity activeOpacity={1}>
            <View style={[styles.modalCard, {
              backgroundColor: theme === 'c' ? '#061828' : '#09090E',
              borderColor: t.cardBorder,
            }]}>
              <Text style={[styles.modalLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
                {label.toUpperCase()}
              </Text>
              <Text style={[styles.modalTitle, {
                color: t.textPrimary,
                fontFamily: theme === 'c' ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
              }]}>
                {theme === 'c' ? 'Update your number' : 'Log it'}
              </Text>
              <View style={[styles.modalInputRow, {
                borderColor: t.cardBorder,
                backgroundColor: t.cardBg,
              }]}>
                <Text style={[styles.modalPrefix, { color: t.textMuted, fontFamily: 'DMSans_500Medium' }]}>
                  R
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: t.textPrimary, fontFamily: 'DMSans_500Medium' }]}
                  value={val}
                  onChangeText={setVal}
                  keyboardType="numeric"
                  autoFocus
                  selectTextOnFocus
                  selectionColor={t.accent}
                />
              </View>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: t.accent }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalSaveText, { color: t.bg0, fontFamily: t.fontUI }]}>
                  {theme === 'c' ? 'Save' : 'LOG IT'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Freedom Score Visual ──────────────────────────────────────────────────────
function FreedomScoreArc({ score, theme }: { score: number; theme: 'c' | 'k' }) {
  const t = theme === 'c' ? C : K;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: score,
      tension: 60,
      friction: 20,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const statusLabel =
    score >= 100 ? (theme === 'c' ? '✦ Nomad Mode' : '✦ NOMAD MODE') :
    score >= 75  ? (theme === 'c' ? 'Almost there' : 'CLOSE') :
    score >= 50  ? (theme === 'c' ? 'Halfway free' : 'HALFWAY') :
    score >= 25  ? (theme === 'c' ? 'Building momentum' : 'BUILDING') :
                   (theme === 'c' ? 'The journey starts' : 'BEGIN');

  const SIZE = 130;

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={[styles.scoreCircle, {
        width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        borderColor: t.cardBorder, backgroundColor: t.cardBg,
      }]}>
        <Animated.View style={{
          position: 'absolute',
          width: SIZE - 20, height: SIZE - 20,
          borderRadius: (SIZE - 20) / 2,
          borderWidth: 2,
          borderColor: t.accent,
          opacity: anim.interpolate({ inputRange: [0, 100], outputRange: [0.08, 0.6] }),
        }} />
        <Text style={[styles.scoreNumber, { color: t.accent, fontFamily: 'DMSans_500Medium' }]}>
          {Math.round(score)}
        </Text>
        <Text style={[styles.scorePercent, { color: t.textMuted, fontFamily: t.fontUI }]}>%</Text>
      </View>
      <Text style={[styles.scoreLabel, {
        color: t.textSecondary,
        fontFamily: theme === 'c' ? 'Marcellus_400Regular' : t.fontUI,
        fontStyle: theme === 'c' ? 'italic' : 'normal',
        letterSpacing: theme === 'k' ? 1.5 : 0.3,
      }]}>
        {statusLabel}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function FreedomScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const { profile: partner } = usePartner();
  const { updateIncome, loadProfile, loadPartner } = useStore();

  const t = theme === 'c' ? C : K;
  const isCaylah = theme === 'c';

  const [editModal, setEditModal] = useState<'my' | 'savings' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const incomeBarAnim = useRef(new Animated.Value(0)).current;

  const myIncome      = profile?.income_current ?? 0;
  const partnerIncome = partner?.income_current ?? 0;
  const combinedIncome = myIncome + partnerIncome;
  const mySavings     = profile?.savings_current ?? 0;
  const currentStreak = profile?.streak ?? 0;

  const freedomScore    = Math.min(100, Math.round((combinedIncome / INCOME_TARGET) * 100));
  const incomeGap       = Math.max(0, INCOME_TARGET - combinedIncome);
  const zanzibarUnlocked = currentStreak >= ZANZIBAR_STREAK;
  const streakToZanzibar = Math.max(0, ZANZIBAR_STREAK - currentStreak);
  const zanzibarProgress = Math.min(1, currentStreak / ZANZIBAR_STREAK);

  useEffect(() => {
    Animated.spring(incomeBarAnim, {
      toValue: Math.min(1, combinedIncome / INCOME_TARGET),
      tension: 60, friction: 20, useNativeDriver: false,
    }).start();
  }, [combinedIncome]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadPartner()]);
    setRefreshing(false);
  }, []);

  async function handleSaveIncome(val: number) {
    await updateIncome(val);
  }

  async function handleSaveSavings(val: number) {
    if (!profile) return;
    const { supabase } = await import('../../lib/supabase');
    await supabase.from('profiles').update({ savings_current: val }).eq('id', profile.id);
    await loadProfile();
  }

  if (!profile) return null;

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
      >
        {/* ── HEADER ── */}
        <Text style={[styles.eyebrow, { color: t.textMuted, fontFamily: t.fontUI }]}>
          {isCaylah ? 'FREEDOM HUB' : 'CONQUEST BOARD'}
        </Text>
        <Text style={[styles.screenTitle, {
          color: t.textPrimary,
          fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
          fontSize: isCaylah ? 24 : 17,
        }]}>
          {isCaylah ? 'The score that sets you free.' : 'THE RAID METRICS'}
        </Text>

        {/* ── FREEDOM SCORE CARD ── */}
        <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <Text style={[styles.cardLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
            {isCaylah ? 'FREEDOM SCORE' : 'CONQUEST SCORE'}
          </Text>

          <View style={styles.scoreRow}>
            <FreedomScoreArc score={freedomScore} theme={theme} />

            <View style={styles.scoreRight}>
              <View>
                <Text style={[styles.combinedNum, { color: t.accent, fontFamily: 'DMSans_500Medium' }]}>
                  {formatRand(combinedIncome)}
                </Text>
                <Text style={[styles.combinedLabel, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                  combined / month
                </Text>
              </View>

              <View style={[styles.gapBadge, {
                borderColor: incomeGap === 0 ? t.accent : t.cardBorder,
                backgroundColor: incomeGap === 0 ? t.accentSoft : 'transparent',
              }]}>
                <Text style={[styles.gapText, {
                  color: incomeGap === 0 ? t.accent : t.xpGold,
                  fontFamily: 'DMSans_500Medium',
                }]}>
                  {incomeGap === 0 ? '✦ TARGET HIT' : `${formatRand(incomeGap)} to go`}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.track, { backgroundColor: t.accentSoft }]}>
            <Animated.View style={[styles.fill, {
              width: incomeBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: t.accent,
              shadowColor: t.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8, shadowRadius: 6,
            }]} />
          </View>

          {/* Milestones */}
          <View style={styles.milestones}>
            {INCOME_MILESTONES.map((m) => {
              const reached = combinedIncome >= m.value;
              return (
                <View key={m.value} style={styles.milestone}>
                  <View style={[styles.milestoneDot, {
                    backgroundColor: reached ? t.accent : t.accentSoft,
                    borderColor: reached ? t.accent : t.cardBorder,
                    shadowColor: reached ? t.accent : 'transparent',
                    shadowOpacity: reached ? 0.8 : 0,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 0 },
                  }]} />
                  <Text style={[styles.milestoneLabel, {
                    color: reached ? t.textSecondary : t.textMuted,
                    fontFamily: t.fontUIReg,
                  }]}>
                    {m.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── INCOME BREAKDOWN ── */}
        <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <Text style={[styles.cardLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
            INCOME BREAKDOWN
          </Text>

          <TouchableOpacity
            style={[styles.incomeRow, { borderColor: t.cardBorder }]}
            onPress={() => setEditModal('my')}
            activeOpacity={0.8}
          >
            <View style={styles.incomeRowLeft}>
              <View style={[styles.incomeDot, { backgroundColor: isCaylah ? C.accent : K.accent }]} />
              <Text style={[styles.incomeRowName, { color: t.textSecondary, fontFamily: t.fontUIReg }]}>
                {profile.name}
              </Text>
            </View>
            <View style={styles.incomeRowRight}>
              <Text style={[styles.incomeRowVal, { color: t.textPrimary, fontFamily: 'DMSans_500Medium' }]}>
                {formatRand(myIncome)}
              </Text>
              <Text style={[styles.editHint, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                tap to edit
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.incomeRow, { borderColor: t.cardBorder }]}>
            <View style={styles.incomeRowLeft}>
              <View style={[styles.incomeDot, {
                backgroundColor: isCaylah ? K.accent : C.accent,
                opacity: partner ? 1 : 0.3,
              }]} />
              <Text style={[styles.incomeRowName, {
                color: partner ? t.textSecondary : t.textMuted,
                fontFamily: t.fontUIReg,
              }]}>
                {partner?.name ?? 'Partner'}
              </Text>
            </View>
            <View style={styles.incomeRowRight}>
              <Text style={[styles.incomeRowVal, {
                color: partner ? t.textPrimary : t.textMuted,
                fontFamily: 'DMSans_500Medium',
              }]}>
                {partner ? formatRand(partnerIncome) : '—'}
              </Text>
              {!partner && (
                <Text style={[styles.editHint, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                  not linked yet
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.totalRow, { borderColor: t.accent + '30' }]}>
            <Text style={[styles.totalLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
              COMBINED
            </Text>
            <Text style={[styles.totalVal, { color: t.accent, fontFamily: 'DMSans_500Medium' }]}>
              {formatRand(combinedIncome)} / R100k
            </Text>
          </View>
        </View>

        {/* ── SAVINGS ── */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}
          onPress={() => setEditModal('savings')}
          activeOpacity={0.85}
        >
          <Text style={[styles.cardLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
            SAVINGS
          </Text>
          <View style={styles.savingsRow}>
            <View>
              <Text style={[styles.savingsNum, { color: t.xpGold, fontFamily: 'DMSans_500Medium' }]}>
                {formatRand(mySavings)}
              </Text>
              <Text style={[styles.savingsSub, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                tap to update
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={[styles.savingsSub, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                {isCaylah ? 'runway goal' : 'WAR CHEST TARGET'}
              </Text>
              <Text style={[styles.incomeRowVal, { color: t.textSecondary, fontFamily: 'DMSans_500Medium' }]}>
                {formatRand(SAVINGS_MILESTONE)}
              </Text>
            </View>
          </View>

          <View style={[styles.track, { backgroundColor: t.accentSoft }]}>
            <View style={[styles.fill, {
              width: `${Math.min(100, Math.round((mySavings / SAVINGS_MILESTONE) * 100))}%`,
              backgroundColor: t.xpGold,
              shadowColor: t.xpGold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6, shadowRadius: 4,
            }]} />
          </View>

          <Text style={[styles.savingsSub, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
            {Math.min(100, Math.round((mySavings / SAVINGS_MILESTONE) * 100))}% of runway goal
          </Text>
        </TouchableOpacity>

        {/* ── ZANZIBAR UNLOCK ── */}
        <View style={[styles.card, {
          backgroundColor: zanzibarUnlocked ? t.accentSoft : t.cardBg,
          borderColor: zanzibarUnlocked ? t.accent : t.cardBorder,
          shadowColor: zanzibarUnlocked ? t.accent : 'transparent',
          shadowOpacity: zanzibarUnlocked ? 0.35 : 0,
          shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
          elevation: zanzibarUnlocked ? 6 : 0,
        }]}>
          <View style={styles.zanzibarHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
                {isCaylah ? 'FIRST DESTINATION' : 'FIRST RAID TARGET'}
              </Text>
              <Text style={[styles.zanzibarName, {
                color: zanzibarUnlocked ? t.accent : t.textPrimary,
                fontFamily: isCaylah ? 'Marcellus_400Regular' : 'CinzelDecorative_400Regular',
                fontSize: isCaylah ? 22 : 16,
              }]}>
                {isCaylah ? 'Kendwa Beach' : 'ZANZIBAR'}
              </Text>
              <Text style={[styles.savingsSub, { color: t.textMuted, fontFamily: t.fontUIReg, marginTop: 2 }]}>
                {isCaylah ? 'Zanzibar · Tanzania' : 'Tanzania · East Africa'}
              </Text>
            </View>

            {zanzibarUnlocked ? (
              <View style={[styles.unlockBadge, { backgroundColor: t.accent }]}>
                <Text style={{ color: t.bg0, fontFamily: 'Raleway_600SemiBold', fontSize: 10, letterSpacing: 1 }}>
                  ✦ UNLOCKED
                </Text>
              </View>
            ) : (
              <View style={[styles.lockBadge, { borderColor: t.cardBorder }]}>
                <Text style={{ color: t.textMuted, fontSize: 18 }}>◎</Text>
              </View>
            )}
          </View>

          {!zanzibarUnlocked && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={[styles.zanzibarStreakNum, { color: t.accent, fontFamily: 'DMSans_500Medium' }]}>
                  {currentStreak}
                </Text>
                <Text style={[styles.savingsSub, { color: t.textMuted, fontFamily: t.fontUIReg, flex: 1 }]}>
                  / 30 day streak
                </Text>
                <Text style={[styles.savingsSub, { color: t.xpGold, fontFamily: 'DMSans_500Medium' }]}>
                  {streakToZanzibar} to unlock
                </Text>
              </View>

              <View style={[styles.track, { backgroundColor: t.accentSoft }]}>
                <View style={[styles.fill, {
                  width: `${Math.round(zanzibarProgress * 100)}%`,
                  backgroundColor: t.accent,
                  shadowColor: t.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8, shadowRadius: 6,
                }]} />
              </View>
            </>
          )}

          {zanzibarUnlocked && (
            <Text style={[styles.zanzibarUnlockMsg, {
              color: t.textSecondary,
              fontFamily: isCaylah ? 'Marcellus_400Regular' : t.fontUIReg,
              fontStyle: isCaylah ? 'italic' : 'normal',
            }]}>
              {isCaylah
                ? 'The crystal water is waiting. Book it.'
                : 'Target acquired. Execute.'}
            </Text>
          )}
        </View>

        {/* ── TIMELINE ── */}
        <View style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <Text style={[styles.cardLabel, { color: t.textMuted, fontFamily: t.fontUI }]}>
            {isCaylah ? 'THE PLAN' : 'MISSION TIMELINE'}
          </Text>
          {[
            { phase: 'Now → Sep 2025', desc: 'Remote jobs secured. Habits locked in.', active: true },
            { phase: 'Sep → Dec 2026', desc: 'Nomad Phase 1. Zanzibar. Mauritius. Mozambique.', active: false },
            { phase: '2027+', desc: 'Phase 2. Europe. SE Asia. South America.', active: false },
          ].map((item, i, arr) => (
            <View key={i} style={[
              styles.phaseRow,
              { borderColor: t.cardBorder },
              i === arr.length - 1 && { borderBottomWidth: 0 },
            ]}>
              <View style={[styles.phaseDot, {
                backgroundColor: item.active ? t.accent : t.accentSoft,
                borderColor: item.active ? t.accent : t.cardBorder,
                shadowColor: item.active ? t.accent : 'transparent',
                shadowOpacity: item.active ? 0.7 : 0,
                shadowRadius: 4, shadowOffset: { width: 0, height: 0 },
              }]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.phaseLabel, {
                  color: item.active ? t.textPrimary : t.textSecondary,
                  fontFamily: t.fontUI,
                  letterSpacing: theme === 'k' ? 1 : 0.5,
                }]}>
                  {item.phase}
                </Text>
                <Text style={[styles.phaseDesc, { color: t.textMuted, fontFamily: t.fontUIReg }]}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Modals */}
      <EditModal
        visible={editModal === 'my'}
        current={myIncome}
        label={`${profile.name}'s monthly income`}
        theme={theme}
        onSave={handleSaveIncome}
        onClose={() => setEditModal(null)}
      />
      <EditModal
        visible={editModal === 'savings'}
        current={mySavings}
        label="Total savings"
        theme={theme}
        onSave={handleSaveSavings}
        onClose={() => setEditModal(null)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 58, paddingHorizontal: 20, paddingBottom: 20 },

  eyebrow: { fontSize: 9, letterSpacing: 2.5, marginBottom: 4 },
  screenTitle: { lineHeight: 32, marginBottom: 16 },

  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 10, marginBottom: 10 },
  cardLabel: { fontSize: 9, letterSpacing: 2 },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreCircle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  scoreNumber: { fontSize: 34, lineHeight: 38 },
  scorePercent: { fontSize: 11, letterSpacing: 1, marginTop: -4 },
  scoreLabel: { fontSize: 13 },
  scoreRight: { flex: 1, gap: 10 },
  combinedNum: { fontSize: 26, lineHeight: 30 },
  combinedLabel: { fontSize: 11, letterSpacing: 0.5 },
  gapBadge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  gapText: { fontSize: 12, letterSpacing: 0.5 },

  track: { height: 3, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },

  milestones: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  milestone: { alignItems: 'center', gap: 5 },
  milestoneDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  milestoneLabel: { fontSize: 8, letterSpacing: 0.3 },

  incomeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1,
  },
  incomeRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  incomeDot: { width: 8, height: 8, borderRadius: 4 },
  incomeRowName: { fontSize: 14 },
  incomeRowRight: { alignItems: 'flex-end', gap: 2 },
  incomeRowVal: { fontSize: 18 },
  editHint: { fontSize: 9, letterSpacing: 0.5 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 10, borderTopWidth: 1,
  },
  totalLabel: { fontSize: 9, letterSpacing: 2 },
  totalVal: { fontSize: 18 },

  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  savingsNum: { fontSize: 26, lineHeight: 30 },
  savingsSub: { fontSize: 10, letterSpacing: 0.5, marginTop: 2 },

  zanzibarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  zanzibarName: { lineHeight: 28, marginTop: 4 },
  zanzibarStreakNum: { fontSize: 22, lineHeight: 26 },
  zanzibarUnlockMsg: { fontSize: 14, lineHeight: 22, marginTop: 4 },
  unlockBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 4 },
  lockBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

  phaseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  phaseDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, marginTop: 4 },
  phaseLabel: { fontSize: 12 },
  phaseDesc: { fontSize: 11, lineHeight: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: SW - 48, borderRadius: 16, borderWidth: 1, padding: 24, gap: 16 },
  modalLabel: { fontSize: 9, letterSpacing: 2 },
  modalTitle: { fontSize: 20, lineHeight: 26 },
  modalInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  modalPrefix: { fontSize: 20 },
  modalInput: { flex: 1, fontSize: 24, padding: 0 },
  modalSaveBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  modalSaveText: { fontSize: 14, letterSpacing: 1.5 },
});