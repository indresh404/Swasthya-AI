// app/(onboarding)/_layout.tsx
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="medical-profile" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}