import { create } from 'zustand';
import { supabase, Profile, DailyLog, PillarKey, MissReason } from './supabase';
import { Theme } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserState {
  profile: Profile | null;
  partnerProfile: Profile | null;
  partnerLog: DailyLog | null;
  todayLog: DailyLog | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

interface UserActions {
  setProfile: (profile: Profile) => void;
  setPartnerProfile: (profile: Profile | null) => void;
  setPartnerLog: (log: DailyLog | null) => void;
  setTodayLog: (log: DailyLog | null) => void;
  setLoading: (loading: boolean) => void;
  setLoggedIn: (loggedIn: boolean) => void;

  // Async actions
  loadProfile: () => Promise<void>;
  loadTodayLog: () => Promise<void>;
  loadPartner: () => Promise<void>;
  togglePillar: (pillar: PillarKey) => Promise<void>;
  logMissReason: (pillar: PillarKey, reason: MissReason) => Promise<void>;
  updateIncome: (current: number) => Promise<void>;
  submitWinLog: (win: string) => Promise<void>;
  signOut: () => Promise<void>;
}

type Store = UserState & UserActions;

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<Store>((set, get) => ({
  // Initial state
  profile: null,
  partnerProfile: null,
  partnerLog: null,
  todayLog: null,
  isLoading: false,
  isLoggedIn: false,

  // Setters
  setProfile: (profile) => set({ profile }),
  setPartnerProfile: (partnerProfile) => set({ partnerProfile }),
  setPartnerLog: (partnerLog) => set({ partnerLog }),
  setTodayLog: (todayLog) => set({ todayLog }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

  // ── Load profile ────────────────────────────────────────────────────────────
  loadProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return;
    set({ profile: data, isLoggedIn: true });
  },

  // ── Load today's log (upsert if missing) ─────────────────────────────────────
  loadTodayLog: async () => {
    const { profile } = get();
    if (!profile) return;

    const date = todayDate();

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('date', date)
      .single();

    if (error && error.code === 'PGRST116') {
      // No row — create it
      const { data: newLog } = await supabase
        .from('daily_logs')
        .insert({ user_id: profile.id, date })
        .select()
        .single();
      if (newLog) set({ todayLog: newLog });
    } else if (data) {
      set({ todayLog: data });
    }
  },

  // ── Load partner profile + today's log ──────────────────────────────────────
  loadPartner: async () => {
    const { profile } = get();
    if (!profile?.partner_id) return;

    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.partner_id)
      .single();

    if (partnerProfile) set({ partnerProfile });

    const { data: partnerLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profile.partner_id)
      .eq('date', todayDate())
      .single();

    if (partnerLog) set({ partnerLog });
  },

  // ── Toggle a pillar ──────────────────────────────────────────────────────────
  togglePillar: async (pillar: PillarKey) => {
    const { todayLog, profile } = get();
    if (!todayLog || !profile) return;

    const newValue = !todayLog[pillar];
    const updatedLog = { ...todayLog, [pillar]: newValue };

    // Optimistic update
    set({ todayLog: updatedLog });

    // Check if all complete for XP
    const allComplete = updatedLog.move && updatedLog.nourish && updatedLog.mind && updatedLog.build;
    const wasComplete = todayLog.all_complete;
    const xpDelta = allComplete && !wasComplete ? 100 : 0;

    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        [pillar]: newValue,
        xp_earned: allComplete ? updatedLog.xp_earned + xpDelta : updatedLog.xp_earned,
      })
      .eq('id', todayLog.id)
      .select()
      .single();

    if (error) {
      // Rollback
      set({ todayLog });
      return;
    }

    if (data) set({ todayLog: data });

    // Award XP on profile
    if (xpDelta > 0) {
      await supabase
        .from('profiles')
        .update({ xp: profile.xp + xpDelta })
        .eq('id', profile.id);

      set({ profile: { ...profile, xp: profile.xp + xpDelta } });
    }
  },

  // ── Log a miss reason ────────────────────────────────────────────────────────
  logMissReason: async (pillar: PillarKey, reason: MissReason) => {
    const { todayLog, profile } = get();
    if (!todayLog || !profile) return;

    const existingReasons = todayLog.miss_reasons as { pillar: string; reason: string }[];
    const newReasons = [...existingReasons, { pillar, reason }];
    const xpBonus = 20; // honest miss log

    await supabase
      .from('daily_logs')
      .update({
        miss_reasons: newReasons,
        xp_earned: todayLog.xp_earned + xpBonus,
      })
      .eq('id', todayLog.id);

    await supabase
      .from('profiles')
      .update({ xp: profile.xp + xpBonus })
      .eq('id', profile.id);

    set({
      todayLog: { ...todayLog, miss_reasons: newReasons as MissReason[], xp_earned: todayLog.xp_earned + xpBonus },
      profile: { ...profile, xp: profile.xp + xpBonus },
    });
  },

  // ── Update income ────────────────────────────────────────────────────────────
  updateIncome: async (current: number) => {
    const { profile } = get();
    if (!profile) return;

    await supabase
      .from('profiles')
      .update({ income_current: current })
      .eq('id', profile.id);

    set({ profile: { ...profile, income_current: current } });
  },

  // ── Submit win log ────────────────────────────────────────────────────────────
  submitWinLog: async (win: string) => {
    const { todayLog } = get();
    if (!todayLog) return;

    const { data } = await supabase
      .from('daily_logs')
      .update({ win_log: win })
      .eq('id', todayLog.id)
      .select()
      .single();

    if (data) set({ todayLog: data });
  },

  // ── Sign out ─────────────────────────────────────────────────────────────────
  signOut: async () => {
    await supabase.auth.signOut();
    set({
      profile: null,
      partnerProfile: null,
      partnerLog: null,
      todayLog: null,
      isLoggedIn: false,
    });
  },
}));

// ── Theme selector (derived) ──────────────────────────────────────────────────
export const useTheme = (): Theme => useStore((s) => s.profile?.theme ?? 'c');
export const useProfile = () => useStore((s) => s.profile);
export const useTodayLog = () => useStore((s) => s.todayLog);
export const usePartner = () => useStore((s) => ({
  profile: s.partnerProfile,
  log: s.partnerLog,
}));
