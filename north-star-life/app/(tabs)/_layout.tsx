import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../lib/store';
import { C, K } from '../../lib/theme';

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 18, color }}>{icon}</Text>;
}

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
          height: 100,
          paddingBottom: 36,
          paddingTop: 8,
        },
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.textMuted,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 1.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TODAY',
          tabBarIcon: ({ color }) => <TabIcon icon="✦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: 'BODY',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={theme === 'c' ? '☽' : 'ᚦ'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: 'MIND',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={theme === 'c' ? 'ॐ' : 'ᚹ'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="freedom"
        options={{
          title: 'FREEDOM',
          tabBarIcon: ({ color }) => <TabIcon icon="◎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="life"
        options={{
          title: 'LIFE',
          tabBarIcon: ({ color }) => <TabIcon icon="⊕" color={color} />,
        }}
      />
    </Tabs>
  );
}