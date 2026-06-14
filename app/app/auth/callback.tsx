import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Loader } from '@/components/ui/Loader';
import React from 'react';
import { Alert } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const errorCode = params.error || params.error_code;
    if (errorCode) {
      const errorMsg = params.error_description || 'An error occurred during authentication.';
      console.error('[AuthCallback] OAuth error details:', { errorCode, errorMsg });
      Alert.alert('Authentication Error', String(errorMsg));
      router.replace('/(auth)/login');
      return;
    }

    // The root layout's deep link listener automatically intercepts the URL,
    // parses the access_token, and sets the session.
    // This callback page is a friendly landing page that redirects back to the app root.
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, params]);

  return <Loader text="Completing sign in..." />;
}
