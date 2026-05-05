# North Star Life — Project Source of Truth

## What This Is
A two-user mobile life operating system for Caylah and Kyle.
Not a habit tracker. A behavior-shaping, identity-driven daily ritual system.
Goal: Build discipline and income to become digital nomads by September 2025.

---

## Stack
- React Native + Expo (expo-router)
- Supabase (auth, postgres, real-time)
- Zustand (state)
- TypeScript (strict)
- Google Fonts (Marcellus, Raleway, DM Mono, Cinzel Decorative)

---

## Environment
- Dev: GitHub Codespace
- Testing: Expo Go on physical device (tunnel) + EAS preview builds
- Supabase URL: https://saajwjytvzqtkxvytpcn.supabase.co
- Keys: hardcoded in lib/supabase.ts temporarily (legacy eyJ anon key)
- Repo: github.com/caylah-droid/north-star-life

---

## File Structure
app/
_layout.tsx          # root layout, sequential init: fonts → auth → navigate
(auth)/
_layout.tsx
login.tsx
(tabs)/
_layout.tsx        # 5 tabs: TODAY, BODY, MIND, FREEDOM, LIFE
index.tsx          # Morning Briefing (home)
body.tsx           # stub
mind.tsx           # stub
freedom.tsx        # COMPLETE
life.tsx           # stub
debrief.tsx
onboarding.tsx
components/
PillarCard.tsx
SeptemberCountdown.tsx
lib/
supabase.ts
theme.ts
store.ts

---

## People

### Caylah
- 33, South African woman
- Identity: ocean · mermaid · yoga · celestial · boho luxury · pearls
- Happy place: Kendwa Beach, Zanzibar
- Theme: bioluminescent ocean — dark teal, glowing stars, pearl rings
- Motivated by: beauty, aesthetic progress, feeling like the woman she's becoming

### Kyle
- Partner, South African
- Identity: Viking · Norse · strength · conquest · steel · discipline
- Theme: dark Norse steel — near black, cold silver, rune rings
- Motivated by: achievement, conquest, earned rewards

---

## Theme System

### Caylah (mode: "c") — Bioluminescent Ocean
- Background: #04111A → #061828 → #082535
- Accent: #00D4DC (electric Kendwa teal)
- Accent highlight: #40EEF5
- Card bg: rgba(6,28,48,0.75) + backdrop blur
- Card border: rgba(0,210,220,0.18)
- Card radius: 12px
- Text primary: #D8F5F8
- Text secondary: #6EC8D4
- Text muted: #2A7A8A
- Gold/XP: #7AE8F0
- Font display: Marcellus_400Regular
- Font UI: Raleway_600SemiBold
- Font UI regular: Raleway_400Regular
- Font mono: DMSans_400Regular / DMSans_500Medium
- Ring: Pearl Ring (20 pearl dots, teal arc, solid fill on complete)
- Stars: static dots (animations disabled until stable)
- Ranks: Pearl → Abalone → Reef → Current → Kendwa → Open Ocean → ✦ North Star
- Tone: warm, poetic — "The ocean sees you."

### Kyle (mode: "k") — Dark Norse Steel
- Background: #07080B → #09090E → #0C0D14
- Accent: #C0D0E0 (cold sword steel silver)
- Accent highlight: #E8EEF5
- Card bg: rgba(16,18,26,0.85) + backdrop blur
- Card border: rgba(160,180,200,0.12)
- Card radius: 12px
- Text primary: #D8E4EE
- Text secondary: #8AAFC4
- Text muted: #3A5060
- Gold/XP: #C9A84C (Valhalla gold)
- Font display: DMSans_500Medium
- Font hero: CinzelDecorative_400Regular
- Font UI: Raleway_600SemiBold
- Ring: Rune Ring (24 tick marks, silver arc)
- Stars: sparse cold white static dots
- Ranks: Recruit → Warrior → Raider → Jarl → Chieftain → Odin's Own → ✦ North Star
- Tone: terse, stoic — "Dawn. The raid begins."

### Shared Rules
- Both dark — never light mode
- Card radius always 12px
- Backdrop blur 20-24px
- Progress bars always glow in accent colour
- Partner dots show partner's accent (not own)
- 4/4 complete: 3 ripple rings + icon + themed message
- Animation: cubic-bezier(0.34, 1.56, 0.64, 1)

---

## Pillar System (UPDATED)

### Four Pillars
| Pillar | Caylah label | Kyle label | DB column | Caylah icon | Kyle rune |
|---|---|---|---|---|---|
| BODY | Body | Body | body | ☽ | ᚦ |
| MIND | Mind | Mind | mind | ॐ | ᚹ |
| SOUL | Soul | Soul | soul | ✦ | ᚢ |
| FREEDOM | Freedom | Conquest | freedom | ◎ | ᚠ |

### ⚠️ CODE NOT YET UPDATED
The DB columns are renamed but the code still uses old names (move/nourish/mind/build).
**First task of next session: update all code files.**

Files to update:
1. `lib/supabase.ts` — PillarKey type: 'body' | 'mind' | 'soul' | 'freedom'
2. `lib/theme.ts` — PILLARS object keys and labels
3. `lib/store.ts` — all pillar references
4. `app/(tabs)/index.tsx` — pillar loop and references
5. `components/PillarCard.tsx` — props and icons
6. `app/debrief.tsx` — pillar references

### Caylah's Sub-tasks (to build after pillar rename)
**BODY ☽**
- Gym class (day-specific: Mon=Pilates, Tue=Shape, Wed/Thu/Fri=TBC)
- Night walk 30min (weekdays)
- Saturday: Yoga 9am
- Sunday: Padel 2hrs (book on Playtomic)
- Yoga at home 1x week (rotating)
- 3L water
- 1400 cal / Mealzy meals
- AM groom routine
- PM skin routine
- Alternate: full body cream / floss (every 2nd day)

**MIND ॐ**
- Pranayama AM
- Meditation / stillness

**SOUL ✦**
- North Star Jobs daily tasks (5 apps, 1 outreach, 2 follow-ups)
- 1 hour Waxo leads/emails
- Cat care
- Family connection (call parents 3x week, Wed night)

**FREEDOM ◎**
- North Star Jobs daily tasks
- 1 hour Waxo CRM leads
- Mealzy development
- Digital nomad planning action

---

## Supabase Schema

### profiles
| Column | Type | Default |
|---|---|---|
| id | uuid | FK auth.users |
| name | text | — |
| theme | text | 'c' or 'k' |
| partner_id | uuid | null |
| streak | int | 0 |
| longest_streak | int | 0 |
| xp | int | 0 |
| september_date | date | 2025-09-01 |
| income_current | numeric | 0 |
| income_target | numeric | 100000 |
| savings_current | numeric | 0 |
| identity_statement | text | — |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

### daily_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| date | date | — |
| body | bool | false |
| mind | bool | false |
| soul | bool | false |
| freedom | bool | false |
| all_complete | bool | generated: body AND mind AND soul AND freedom |
| xp_earned | int | 0 |
| miss_reasons | jsonb | [] |
| story_line | text | — |
| win_log | text | — |
| created_at | timestamptz | now() |
| UNIQUE | (user_id, date) | — |

---

## XP System
| Action | XP |
|---|---|
| All 4 complete | +100 |
| Honest miss log | +20 |
| 7-day streak | +150 bonus |
| Couple challenge | +200 |
| Destination unlocked | +500 |
| Income milestone | +1000 |
| Each rank requires | 500 XP |

---

## Vision Timeline
- Now → Sep 2025: Remote jobs secured, habits locked in
- Sep 2025 → Dec 2026: Nomad Phase 1 (Zanzibar, Mauritius, Mozambique, Cape Town)
- 2027+: Phase 2 (Europe, SE Asia, South America)

### Destination Unlocks
| Milestone | Unlock |
|---|---|
| 30-day streak | Zanzibar (Kendwa Beach) |
| R50k/month hit | Mauritius |
| 70% fitness 8 weeks | Mozambique |
| Both hit 60 days | Weekend trip challenge |
| R100k/month hit | NOMAD MODE |

---

## Current Status

### Done ✅
- Full design system
- lib/supabase.ts — complete (anon key hardcoded temporarily)
- lib/theme.ts — C/K tokens, ranks, greetings
- lib/store.ts — full Zustand store
- app/_layout.tsx — sequential init: fonts → auth → navigate
- app/(auth)/login.tsx — complete
- app/onboarding.tsx — complete
- app/(tabs)/index.tsx — Morning Briefing, static stars
- app/(tabs)/_layout.tsx — 5 tab bar
- app/(tabs)/body.tsx — stub
- app/(tabs)/mind.tsx — stub
- app/(tabs)/freedom.tsx — COMPLETE (income, savings, Freedom Score, Zanzibar unlock)
- app/(tabs)/life.tsx — stub
- app/debrief.tsx — full Evening Debrief with Claude story generation
- components/PillarCard.tsx — Pearl Ring + Rune Ring
- components/SeptemberCountdown.tsx — complete
- Supabase schema applied ✅
- Pillars renamed in DB: body/mind/soul/freedom ✅
- EAS connected to GitHub ✅
- Preview APK builds working ✅
- App confirmed working via Expo Go + tunnel ✅

### Known Issues 🔧
- Code still uses old pillar names (move/nourish/mind/build) — needs update
- APK crashes on install (separate issue from Expo Go tunnel)
- Star animations disabled — static only until APK stable
- App icon — placeholder
- Tab bar fontFamily removed temporarily

### Not Started ❌
- Pillar sub-tasks system
- Body Hub screen
- Life Hub (map, couple space)
- Real-time partner sync
- Streak engine (server-side)
- Partner linking
- Push notifications

### Polish Queue 🎨
- Restore star animations
- App icon — North Star design
- Tab bar fonts
- Full theme polish pass
- Splash screen

---

## How To Start Each Session
Always begin with:
> "Read CLAUDE.md. We are building [specific thing]."

Never re-explain the project. Update CLAUDE.md at end of every session.

---

## Session Log
| Session | What was done |
|---|---|
| 1 | Design system, psychology, schema designed |
| 2 | v1-v9 React artifacts — design iterated |
| 3 | Project setup: Supabase, Codespace, deps |
| 4 | Auth wired, Debrief built, tab stubs |
| 5 | OOM fix, EAS builds, schema applied, GitHub connected |
| 6 | Freedom Hub built, EAS secrets set |
| 7 | Crash debugging — font paths, anon key, sequential init |
| 8 | Pillar system redesigned: body/mind/soul/freedom. DB renamed. Sub-tasks defined. |