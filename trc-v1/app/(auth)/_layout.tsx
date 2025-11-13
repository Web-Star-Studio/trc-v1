// Auth Layout
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding-profile" />
      <Stack.Screen name="onboarding-sensory" />
      <Stack.Screen name="onboarding-interests" />
    </Stack>
  );
}
