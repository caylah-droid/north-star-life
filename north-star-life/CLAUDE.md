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
- Testing: Expo Go on physical device
- Supabase URL: https://saajwjytvzqtkxvytpcn.supabase.co
- Keys: stored in .env (never commit)
- Repo: github.com/caylah-droid/north-star-life

---

## File Structure
```
app/
  _layout.tsx          # root layout, auth check, font loading
  (auth)/
    login.tsx
    signup.tsx
    onboarding.tsx
  (tabs)/
    index.tsx          # Morning Briefing (home)
    body.tsx
    mind.tsx
    freedom.tsx
    life.tsx
  debrief.tsx

components/
  PillarCard.tsx
  PearlRing.tsx
  RuneRing.tsx
  PartnerStatus.tsx
  SeptemberCountdown.tsx
  FreedomScore.tsx
  BioLumBackground.tsx
  SteelBackground.tsx

lib/
  supabase.ts
  theme.ts
  store.ts

hooks/
  useTheme.ts
  usePartner.ts
  useDailyLog.ts
  useStreak.ts
```

---

## Theme System

### Caylah (mode: "c") — Bioluminescent Ocean
- Background: #04111A → #061828 → #082535 (deep dark ocean)
- Accent: #00D4DC (electric Kendwa teal)
- Accent highlight: #40EEF5
- Card bg: rgba(6,28,48,0.75) + backdrop blur
- Card border: rgba(0,210,220,0.18)
- Card radius: 12px
- Text primary: #D8F5F8
- Text secondary: #6EC8D4
- Text muted: #2A7A8A
- Gold/XP: #7AE8F0
- Font display: Marcellus
- Font UI: Raleway
- Font data: DM Mono
- Ring: Pearl Ring (20 pearl dots, teal arc, solid fill on complete)
- Icons: SVG line art — Moon, Sun, Om, 6-point Star
- Stars: 80+ CSS divs, white + teal, all twinkle at different speeds
- Ranks: Pearl → Abalone → Reef → Current → Kendwa → Open Ocean → North Star
- Tone: warm, poetic — "The tide is moving, Caylah."

### Kyle (mode: "k") — Dark Norse Steel
- Background: #07080B → #09090E → #0C0D14 (near black)
- Accent: #C0D0E0 (cold sword steel silver)
- Accent highlight: #E8EEF5
- Card bg: rgba(16,18,26,0.85) + backdrop blur
- Card border: rgba(160,180,200,0.12)
- Card radius: 12px
- Text primary: #D8E4EE
- Text secondary: #8AAFC4
- Text muted: #3A5060
- Gold/XP: #C9A84C (Valhalla gold)
- Font display: DM Mono
- Font hero: Cinzel Decorative
- Font UI: Raleway
- Ring: Rune Ring (24 tick marks like compass/shield boss, silver arc)
- Icons: Elder Futhark runes — ᚦ ᚢ ᚹ ᚠ (Cinzel Decorative, glowing)
- Stars: sparse cold white, slow twinkle
- Ranks: Recruit → Warrior → Raider → Jarl → Chieftain → Odin's Own → North Star
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

## Supabase Schema

### profiles
| Column | Type | Default |
|---|---|---|
| id | uuid | FK auth.users |
| name | text | — |
| theme | text | — ('c' or 'k') |
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
| Column | Type | Default |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid | FK profiles.id |
| date | date | — |
| move | bool | false |
| nourish | bool | false |
| mind | bool | false |
| build | bool | false |
| all_complete | bool | generated (move AND nourish AND mind AND build) |
| xp_earned | int | 0 |
| miss_reasons | jsonb | [] |
| story_line | text | — |
| win_log | text | — |
| created_at | timestamptz | now() |
| UNIQUE | (user_id, date) | — |

### destinations
| Column | Type |
|---|---|
| id | uuid |
| name | text |
| country | text |
| description | text |
| unlock_streak_required | int |
| cost_estimate_2weeks | numeric |
| best_time_to_visit | text |
| coordinates | point |
| order_index | int |

### user_destinations
| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid FK profiles |
| destination_id | uuid FK destinations |
| unlocked | bool |
| unlocked_at | timestamptz |
| visited | bool |

### couple_wins
| Column | Type |
|---|---|
| id | uuid |
| posted_by | uuid FK profiles |
| content | text |
| created_at | timestamptz |

### RLS Rules
- profiles: read/write own + partner only
- daily_logs: read/write own only
- couple_wins: both partners read, own writes/deletes
- Enable RLS on ALL tables

### Real-time subscriptions
- Partner daily_logs → live pillar dot updates
- couple_wins → shared wall live feed

---

## Core Features

### 4 Non-Negotiables (daily, sacred)
| Pillar | Caylah task | Kyle task |
|---|---|---|
| Move | 30 min flow/walk/dance | Iron or run |
| Nourish | 3L water + real meals | 3L water + fuel right |
| Mind | 15 min pranayama | 15 min stillness |
| Build | 1 remote income action | 1 remote income action |

### XP System
| Action | XP |
|---|---|
| All 4 complete | +100 |
| Honest miss log | +20 |
| 7-day streak | +150 bonus |
| Couple challenge | +200 |
| Destination unlocked | +500 |
| Income milestone | +1000 |
| Each rank requires | 500 XP |

### Accountability
- Miss → "What got in the way?" (Energy / Time / Avoidance / Life)
- 3x same reason → system adapts
- No red, no guilt language ever
- Response: "Noted. Tomorrow we adjust. You're still in it."
- Streak shield: 1 free pass/week, costs 50 XP

### Financial Model
- Target: R100,000/month combined income
- Split: R50,000 living + R50,000 savings
- Already have strong savings base
- Freedom Score = income progress toward target

---

## Vision Timeline
- Now → Sep 2025: Remote jobs secured, habits built
- Sep 2025 → Dec 2026: Nomad Phase 1 (SA + nearby: Zanzibar, Mauritius, Mozambique)
- 2027+: Nomad Phase 2 (Europe, SE Asia, South America)
- Eventually: Settle based on data from nomad years

### Destination Unlocks
| Milestone | Unlock |
|---|---|
| 30-day streak | Zanzibar (Kendwa Beach) |
| R50k/month hit | Mauritius |
| 70% fitness 8 weeks | Mozambique |
| Both hit 60 days | Weekend trip challenge |
| R100k/month hit | NOMAD MODE |

---

## Notifications (WhatsApp MVP)
Group: "North Star 🌟"
- 07:00 — "The ocean is already moving. Are you?" / "Dawn. The raid begins."
- 10:00 — "Half your water. You know the drill."
- 12:30 — "Lunch that actually loves you back — logged?"
- 15:00 — "[Partner] just logged their workout. 👀"
- 18:00 — "One Build action before sundown. September is watching."
- 21:00 — "Close the chapter tonight. Even a small win counts."

---

## Future Integrations
- Mealzy: meal plan → Nourish pillar auto-fill
- North Star Job App: application tracker → Freedom Hub

---

## Current Status

### Done ✅
- Full design system (v9 React artifact)
- Morning briefing screen designed + iterated
- Supabase project created
- GitHub repo created
- Codespace created
- Dependencies installing

### In Progress ⏳
- Dependencies finishing install

### Not Started ❌
- Supabase schema applied
- Auth flow
- Onboarding flow
- Morning briefing in React Native
- Any screens in Expo
- Real-time sync
- Evening debrief

---

## How To Start Each Claude Session

Always begin with:
> "Read CLAUDE.md. We are building [specific thing]."

Never re-explain the project. Never paste design decisions.
Update the Current Status section after every session.

---

## Session Log
| Date | What was done |
|---|---|
| Session 1 | Full design system, psychology, vision, schema designed |
| Session 2 | v1-v9 React artifacts — design iterated to final state |
| Session 3 | Project setup: Supabase created, Codespace created, deps installing |

## Current Status

### Done ✅
- Full design system (v9 React artifact)
- Morning briefing screen — complete and running
- Supabase project created
- GitHub repo created + all code committed
- Dependencies installed
- lib/supabase.ts — all types
- lib/theme.ts — C/K tokens, ranks, greetings
- lib/store.ts — full Zustand store with async actions
- app/_layout.tsx — real auth wired, fonts loaded
- app/(auth)/login.tsx — complete
- app/onboarding.tsx — complete
- app/(tabs)/index.tsx — full Morning Briefing
- app/(tabs)/_layout.tsx — tab bar
- components/PillarCard.tsx — Pearl Ring + Rune Ring
- components/SeptemberCountdown.tsx — complete
- app/debrief.tsx — full Evening Debrief with Claude story generation
- app/(tabs)/body.tsx — themed stub
- app/(tabs)/freedom.tsx — themed stub
- app/(tabs)/life.tsx — themed stub
- schema.sql — generated (needs applying to Supabase)

### In Progress ⏳
- Apply schema.sql to Supabase
- Test full loop on physical device via Expo Go

### Not Started ❌
- Freedom Hub (income tracker, Freedom Score)
- Body Hub
- Life Hub (map, couple space)
- Real-time partner sync (live dot updates)
- Streak engine (server-side streak calculation)
- Zanzibar unlock system
- Push notifications

---

## Session Log
| Date | What was done |
|---|---|
| Session 1 | Full design system, psychology, vision, schema designed |
| Session 2 | v1-v9 React artifacts — design iterated to final state |
| Session 3 | Project setup: Supabase created, Codespace created, deps installing |
| Session 4 | Real auth wired, Evening Debrief built, tab stubs, schema.sql generated |