  import { Loader } from '@/components/ui/Loader';
  import { useAuthStore } from '@/store/auth.store';
  import { Redirect } from 'expo-router';

  // CI Test Change: Trigger App CI
  export default function Index() {
    const { isLoggedIn, hasProfile, hasFamilyGroup, isHydrated } = useAuthStore();

    if (!isHydrated) {
      return <Loader text="Hydrating session..." />;
    }

    return <Redirect href="/(tabs)/home" />;
  }

