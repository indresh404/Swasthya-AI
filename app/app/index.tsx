import { Loader } from '@/components/ui/Loader';
import { useAuthStore } from '@/store/auth.store';
import { Redirect } from 'expo-router';

// CI Test Change: Trigger App CI
export default function Index() {
  const { isLoggedIn, hasProfile, hasFamilyGroup, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <Loader text="Hydrating session..." />;
  }

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;
  if (!hasProfile) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(tabs)/home" />;
}

