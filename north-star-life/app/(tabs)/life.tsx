import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/store';
import { C, K } from '../../lib/theme';

export default function LifeScreen() {
  const theme = useTheme();
  const t = theme === 'c' ? C : K;
  return (
    <LinearGradient colors={[t.bg0, t.bg1, t.bg2]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.accent, fontFamily: 'Marcellus_400Regular', fontSize: 18, letterSpacing: 1 }}>
        {theme === 'c' ? 'Life · coming next' : 'LIFE · NEXT'}
      </Text>
    </LinearGradient>
  );
}
