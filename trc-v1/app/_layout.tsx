// Root Layout - The Ribbon Club
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { AppProviders, useAuth } from '@/lib/context';
import { queryClient, asyncStoragePersister } from '@/lib/queryClient';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // No user - redirect to login
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // User exists but no profile - needs onboarding
    else if (user && !profile && !inAuthGroup) {
      router.replace('/(auth)/onboarding-profile');
    }
    // User has incomplete profile - continue/restart onboarding
    else if (user && profile && !profile.onboarding_completed && !inAuthGroup) {
      router.replace('/(auth)/onboarding-profile');
    }
    // User has complete profile but is on auth screens - go to app
    else if (user && profile?.onboarding_completed && inAuthGroup) {
      router.replace('/(tabs)');
    }

    // Hide splash screen once auth state is determined
    SplashScreen.hideAsync();
  }, [user, profile, loading, segments]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/index" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <AppProviders>
          <RootLayoutNav />
        </AppProviders>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
