import { Theme } from './supabase';

// ── Shared constants ──────────────────────────────────────────────────────────
export const CARD_RADIUS = 12;
export const BACKDROP_BLUR = 22;
export const SPRING = { tension: 300, friction: 20 } as const;

// ── Pillar config ─────────────────────────────────────────────────────────────
export const PILLARS = {
  move:    { key: 'move',    label: 'MOVE',    runeChar: 'ᚦ', runeName: 'Thurisaz' },
  nourish: { key: 'nourish', label: 'NOURISH', runeChar: 'ᚢ', runeName: 'Uruz'     },
  mind:    { key: 'mind',    label: 'MIND',    runeChar: 'ᚹ', runeName: 'Wunjo'    },
  build:   { key: 'build',   label: 'BUILD',   runeChar: 'ᚠ', runeName: 'Fehu'     },
} as const;

// ── Rank systems ──────────────────────────────────────────────────────────────
export const CAYLAH_RANKS = [
  'Pearl', 'Abalone', 'Reef', 'Current', 'Kendwa', 'Open Ocean', '✦ North Star',
] as const;

export const KYLE_RANKS = [
  'Recruit', 'Warrior', 'Raider', 'Jarl', 'Chieftain', "Odin's Own", '✦ North Star',
] as const;

export const XP_PER_RANK = 500;

export function getRank(theme: Theme, xp: number): string {
  const ranks = theme === 'c' ? CAYLAH_RANKS : KYLE_RANKS;
  const index = Math.min(Math.floor(xp / XP_PER_RANK), ranks.length - 1);
  return ranks[index];
}

export function getXpToNextRank(xp: number): number {
  const nextThreshold = (Math.floor(xp / XP_PER_RANK) + 1) * XP_PER_RANK;
  return nextThreshold - xp;
}

export function getRankProgress(xp: number): number {
  return (xp % XP_PER_RANK) / XP_PER_RANK;
}

// ── XP values ─────────────────────────────────────────────────────────────────
export const XP = {
  ALL_COMPLETE:         100,
  HONEST_MISS:          20,
  SEVEN_DAY_STREAK:     150,
  COUPLE_CHALLENGE:     200,
  DESTINATION_UNLOCKED: 500,
  INCOME_MILESTONE:     1000,
} as const;

// ── Morning greetings ─────────────────────────────────────────────────────────
export const CAYLAH_GREETINGS = [
  'The tide is moving, Caylah.',
  'What would the woman on that beach do today?',
  'The ocean sees you.',
  'She wakes before the wave.',
  'Kendwa is waiting. So is today.',
  'The sea doesn\'t pause. Neither do you.',
  'Every drop counts. Even this one.',
  'Luminous things don\'t dim themselves.',
  'The current is already moving.',
  'She became her by doing the work.',
] as const;

export const KYLE_GREETINGS = [
  'Dawn. The raid begins.',
  'Odin logs another day.',
  'The raid doesn\'t pause. Neither do you.',
  'Iron sharpens iron.',
  'Warriors don\'t negotiate with comfort.',
  'The shield wall holds one day at a time.',
  'Valhalla is earned. Begin.',
  'Another day to conquer.',
  'The forge is hot. Start striking.',
  'No mercy for mediocrity.',
] as const;

export function getDailyGreeting(theme: Theme, name: string): string {
  const greetings = theme === 'c' ? CAYLAH_GREETINGS : KYLE_GREETINGS;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const base = greetings[dayOfYear % greetings.length];
  return base;
}

// ── Colours ───────────────────────────────────────────────────────────────────
export const C = {
  // Backgrounds
  bg0:          '#04111A',
  bg1:          '#061828',
  bg2:          '#082535',

  // Accent
  accent:       '#00D4DC',
  accentHi:     '#40EEF5',
  accentSoft:   'rgba(0,212,220,0.10)',
  accentGlow:   'rgba(0,212,220,0.55)',

  // Card
  cardBg:       'rgba(6,28,48,0.75)',
  cardBorder:   'rgba(0,210,220,0.18)',
  cardGlow:     'rgba(0,212,220,0.12)',

  // Text
  textPrimary:  '#D8F5F8',
  textSecondary:'#6EC8D4',
  textMuted:    '#2A7A8A',

  // Special
  xpGold:       '#7AE8F0',

  // Fonts
  fontDisplay:  'Marcellus_400Regular',
  fontUI:       'Raleway_600SemiBold',
  fontUIReg:    'Raleway_400Regular',
  fontMono:     'DMSans_400Regular',

  // Ring
  pearlCount:   20,
  ringTrack:    'rgba(0,210,220,0.12)',
  ringArc:      '#00D4DC',
  pearlOff:     'rgba(0,210,220,0.18)',
  pearlOn:      '#40EEF5',
} as const;

export const K = {
  // Backgrounds
  bg0:          '#07080B',
  bg1:          '#09090E',
  bg2:          '#0C0D14',

  // Accent
  accent:       '#C0D0E0',
  accentHi:     '#E8EEF5',
  accentSoft:   'rgba(192,208,224,0.07)',
  accentGlow:   'rgba(210,225,240,0.4)',

  // Card
  cardBg:       'rgba(16,18,26,0.85)',
  cardBorder:   'rgba(160,180,200,0.12)',
  cardGlow:     'rgba(192,208,224,0.06)',

  // Text
  textPrimary:  '#D8E4EE',
  textSecondary:'#8AAFC4',
  textMuted:    '#3A5060',

  // Special
  xpGold:       '#C9A84C',

  // Fonts
  fontDisplay:  'DMSans_500Medium',
  fontUI:       'Raleway_600SemiBold',
  fontUIReg:    'Raleway_400Regular',
  fontMono:     'DMSans_400Regular',
  fontHero:     'CinzelDecorative_400Regular',

  // Ring
  tickCount:    24,
  ringTrack:    'rgba(192,208,224,0.10)',
  ringArc:      '#C0D0E0',
  tickOff:      'rgba(192,208,224,0.15)',
  tickOn:       '#E8EEF5',
} as const;

export type CTheme = typeof C;
export type KTheme = typeof K;

export function getTheme(theme: Theme): CTheme | KTheme {
  return theme === 'c' ? C : K;
}
