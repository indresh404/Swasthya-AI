import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { isLoggedIn, hasProfile, hasFamilyGroup } = useAuthStore();

  if (!isLoggedIn) return <Redirect href="/(tabs)/home" />;
  if (!hasProfile) return <Redirect href="/(onboarding)/user-details" />;
  if (!hasFamilyGroup) return <Redirect href="/(onboarding)/family-setup" />;
  return <Redirect href="/(tabs)/home" />;
}
