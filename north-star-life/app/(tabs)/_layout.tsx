import { Tabs } from 'expo-router';
import { Text } from 'react-native'; // ✅ IMPORTANT
import { useTheme } from '../../lib/store';
import { C, K } from '../../lib/theme';

export default function TabsLayout() {
  const theme = useTheme();
  const t = theme === 'c' ? C : K;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'c' ? C.bg1 : K.bg1,
          borderTopColor: t.cardBorder,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Raleway_600SemiBold',
          fontSize: 9,
          letterSpacing: 1.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TODAY',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={theme === 'c' ? '✦' : 'ᚱ'} color={color} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: theme === 'c' ? 'BODY' : 'FORGE',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={theme === 'c' ? '☽' : 'ᚦ'} color={color} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="freedom"
        options={{
          title: 'FREEDOM',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={theme === 'c' ? '◎' : 'ᚠ'} color={color} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="life"
        options={{
          title: 'LIFE',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={theme === 'c' ? '⊕' : '⊕'} color={color} theme={theme} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color, theme }: { icon: string; color: string; theme: string }) {
  return (
    <Text
      style={{
        fontSize: 18,
        color,
        fontFamily: theme === 'k' ? 'CinzelDecorative_400Regular' : undefined,
      }}
    >
      {icon}
    </Text>
  );
}