import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#0f172a'
    }}>
      <Text style={{ 
        color: 'white', 
        fontSize: 24,
        fontWeight: '600'
      }}>
        North Star Life 🌟
      </Text>
    </View>
  );
}