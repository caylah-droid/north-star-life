import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Database types ──────────────────────────────────────────
export type Theme = 'c' | 'k';

export interface Profile {
  id: string;
  name: string;
  theme: Theme;
  partner_id: string | null;
  streak: number;
  longest_streak: number;
  xp: number;
  september_date: string;
  income_current: number;
  income_target: number;
  savings_current: number;
  identity_statement: string;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  move: boolean;
  nourish: boolean;
  mind: boolean;
  build: boolean;
  all_complete: boolean;
  xp_earned: number;
  miss_reasons: MissReasonEntry[];
  story_line: string;
  win_log: string;
  created_at: string;
}

export type MissReason = 'Energy' | 'Time' | 'Avoidance' | 'Life';
export type PillarKey = 'move' | 'nourish' | 'mind' | 'build';

// A single miss log entry stored in jsonb
export interface MissReasonEntry {
  pillar: PillarKey;
  reason: MissReason;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  unlock_streak_required: number;
  cost_estimate_2weeks: number;
  best_time_to_visit: string;
  coordinates: { x: number; y: number } | null;
  order_index: number;
}

export interface CoupleWin {
  id: string;
  posted_by: string;
  content: string;
  created_at: string;
}