import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';

// Simple icon component using emoji for MVP
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 24 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
        }}
        listeners={{
          tabPress: () => triggerHaptic('light'),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <TabIcon emoji="💜" color={color} />,
        }}
        listeners={{
          tabPress: () => triggerHaptic('light'),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <TabIcon emoji="👥" color={color} />,
        }}
        listeners={{
          tabPress: () => triggerHaptic('light'),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} />,
        }}
        listeners={{
          tabPress: () => triggerHaptic('light'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
        listeners={{
          tabPress: () => triggerHaptic('light'),
        }}
      />
      {/* Hide these screens from tabs */}
      <Tabs.Screen
        name="discover"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
