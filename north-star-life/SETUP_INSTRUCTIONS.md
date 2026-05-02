# North Star Life — Session Setup Guide
## What to do RIGHT NOW in your Codespace

---

## STEP 1 — Apply the schema to Supabase

1. Go to: https://supabase.com/dashboard/project/saajwjytvzqtkxvytpcn/sql/new
2. Paste the contents of `north-star-schema.sql`
3. Hit RUN
4. Confirm you see: profiles, daily_logs, destinations, user_destinations, couple_wins tables

---

## STEP 2 — Check your .env file

In your Codespace root, ensure `.env` exists:

```
EXPO_PUBLIC_SUPABASE_URL=https://saajwjytvzqtkxvytpcn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Find your anon key: Supabase Dashboard → Settings → API → anon public key

---

## STEP 3 — Install missing font packages

Run in your Codespace terminal:

```bash
npx expo install \
  @expo-google-fonts/marcellus \
  @expo-google-fonts/raleway \
  @expo-google-fonts/dm-sans \
  @expo-google-fonts/cinzel-decorative \
  expo-linear-gradient \
  @supabase/supabase-js \
  zustand
```

---

## STEP 4 — Place the files

```
lib/supabase.ts          ← supabase.ts
lib/theme.ts             ← theme.ts
lib/store.ts             ← store.ts

app/_layout.tsx          ← _layout.tsx
app/onboarding.tsx       ← onboarding.tsx
app/(auth)/login.tsx     ← login.tsx
app/(tabs)/_layout.tsx   ← tabs_layout.tsx  (rename)
app/(tabs)/index.tsx     ← index.tsx

components/PillarCard.tsx        ← PillarCard.tsx
components/SeptemberCountdown.tsx ← SeptemberCountdown.tsx
```

Create stub files for tab screens (so routing doesn't crash):
```bash
# Create placeholder tabs
cat > app/\(tabs\)/body.tsx << 'EOF'
import { View, Text } from 'react-native';
export default function BodyScreen() {
  return <View style={{flex:1, backgroundColor:'#04111A', alignItems:'center', justifyContent:'center'}}>
    <Text style={{color:'#00D4DC'}}>Body — coming soon</Text>
  </View>;
}
EOF

cat > app/\(tabs\)/freedom.tsx << 'EOF'
import { View, Text } from 'react-native';
export default function FreedomScreen() {
  return <View style={{flex:1, backgroundColor:'#04111A', alignItems:'center', justifyContent:'center'}}>
    <Text style={{color:'#00D4DC'}}>Freedom — coming soon</Text>
  </View>;
}
EOF

cat > app/\(tabs\)/life.tsx << 'EOF'
import { View, Text } from 'react-native';
export default function LifeScreen() {
  return <View style={{flex:1, backgroundColor:'#04111A', alignItems:'center', justifyContent:'center'}}>
    <Text style={{color:'#00D4DC'}}>Life — coming soon</Text>
  </View>;
}
EOF

cat > app/debrief.tsx << 'EOF'
import { View, Text } from 'react-native';
export default function DebriefScreen() {
  return <View style={{flex:1, backgroundColor:'#04111A', alignItems:'center', justifyContent:'center'}}>
    <Text style={{color:'#00D4DC'}}>Debrief — coming soon</Text>
  </View>;
}
EOF

cat > app/\(auth\)/_layout.tsx << 'EOF'
import { Stack } from 'expo-router';
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
EOF
```

---

## STEP 5 — Start Expo

```bash
npx expo start --tunnel
```

Scan QR with Expo Go on your phone.

---

## WHAT YOU SHOULD SEE

1. App launches → dark ocean background
2. Login screen with `✦ North Star Life` header
3. Sign up with your email
4. Onboarding: name → theme (pick Ocean/Caylah) → identity → partner (skip)
5. Home screen with:
   - Your name + date header
   - September countdown card
   - 4 pillar cards (MOVE · NOURISH · MIND · BUILD)
   - XP/rank strip at bottom
   - "Close the chapter →" debrief button

---

## WHAT TO TEST FIRST

- [ ] Tap a pillar card — it should glow teal and show pearl ring filled
- [ ] Tap all 4 — "All tides aligned" card appears
- [ ] Pull to refresh — data reloads from Supabase

---

## KNOWN LIMITATIONS THIS SESSION (fix next)

- Partner linking not yet implemented (requires admin API or invite code system)
- Rune ring ticks have CSS transform quirks — visual tweak pass needed
- Tab icons use `span` which won't work in RN — replace with Text component
- Evening debrief screen is a stub

---

## NEXT SESSION BUILDS

1. Fix tab icons (Text not span)
2. Partner invite/link flow
3. Evening debrief screen (win log + miss log + story line)
4. Streak calculation (cron or on-load logic)
5. Freedom score screen
