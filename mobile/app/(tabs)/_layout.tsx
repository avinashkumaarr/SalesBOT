import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
          height: 0,
          width: 0,
          overflow: 'hidden',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#52525b',
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 32, height: 32,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: focused ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderRadius: 10,
            }}>
              <Feather name="home" size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'ShopBot AI',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 32, height: 32,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: focused ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderRadius: 10,
            }}>
              <Feather name="message-circle" size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 32, height: 32,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: focused ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderRadius: 10,
            }}>
              <Feather name="zap" size={18} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
