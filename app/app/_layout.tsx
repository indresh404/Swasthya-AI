// app/_layout.tsx
import 'react-native-url-polyfill/auto';
import { LogBox } from 'react-native';

// Suppress noisy React Native deprecation warnings in development
LogBox.ignoreLogs([
  'shadow* style props are deprecated',
  'textShadow* style props are deprecated',
  'Image: style.resizeMode is deprecated',
]);

import { Delius_400Regular } from '@expo-google-fonts/delius';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import * as Linking from 'expo-linking';

import { Loader } from '@/components/ui/Loader';
import { getCurrentPatient, getCurrentSession } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
  const setSessionState = useAuthStore((state) => state.setSessionState);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const url = Linking.useURL();
  const [isDeepLinkLoading, setIsDeepLinkLoading] = React.useState(false);

  useEffect(() => {
    const handleDeepLink = async () => {
      if (!url) return;
      
      const parsed = Linking.parse(url);
      let access_token = parsed.queryParams?.access_token;
      let refresh_token = parsed.queryParams?.refresh_token;

      // Fallback parsing for hash fragment parameters or query parameter string
      if (!access_token || !refresh_token) {
        const hash = url.split('#')[1] || url.split('?')[1];
        if (hash) {
          const parts = hash.split('&');
          parts.forEach(part => {
            const [key, val] = part.split('=');
            if (key === 'access_token') access_token = decodeURIComponent(val);
            if (key === 'refresh_token') refresh_token = decodeURIComponent(val);
          });
        }
      }

      if (access_token && refresh_token) {
        const finalAccessToken = Array.isArray(access_token) ? access_token[0] : access_token;
        const finalRefreshToken = Array.isArray(refresh_token) ? refresh_token[0] : refresh_token;

        if (finalAccessToken && finalRefreshToken) {
          setIsDeepLinkLoading(true);
          try {
            const { supabase } = require('@/config/supabase');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: finalAccessToken,
              refresh_token: finalRefreshToken,
            });

            if (sessionError) throw sessionError;

            if (sessionData.user) {
              const { getPatientById, generateDummyPhoneFromId } = require('@/services/auth.service');
              let dbPatient = await getPatientById(sessionData.user.id);

              if (!dbPatient) {
                const fullName = sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || 'User';
                const { error: insertError } = await supabase.from('patients').upsert({
                  id: sessionData.user.id,
                  full_name: fullName,
                  email: sessionData.user.email,
                  phone_number: generateDummyPhoneFromId(sessionData.user.id),
                  created_at: new Date().toISOString(),
                }, { onConflict: 'id' });
                if (!insertError) {
                  dbPatient = await getPatientById(sessionData.user.id);
                }
              }

              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const hasShownIntroVal = await AsyncStorage.getItem(`has_shown_intro_${sessionData.user.id}`);

              setSessionState({
                userId: sessionData.user.id,
                patientId: sessionData.user.id,
                phoneNumber: dbPatient?.phone ?? null,
                isLoggedIn: true,
                hasProfile: Boolean(dbPatient?.age && dbPatient?.gender),
                hasFamilyGroup: Boolean(dbPatient?.family_id),
                isHydrated: true,
                hasShownIntro: hasShownIntroVal === 'true',
              });

              router.replace('/');
            }
          } catch (e: any) {
            console.error('Deep link auth error:', e);
          } finally {
            setIsDeepLinkLoading(false);
          }
        }
      }
    };

    handleDeepLink();
  }, [url, setSessionState]);

  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_300Light,
    Delius_400Regular,
  });

  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (!mounted) return;

        if (!session) {
          logout();
          setSessionState({ isHydrated: true });
          return;
        }

        const patient = await getCurrentPatient();
        if (!mounted) return;

        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const hasShownIntroVal = await AsyncStorage.getItem(`has_shown_intro_${session.user.id}`);

        setSessionState({
          userId: session.user.id,
          patientId: patient?.id ?? session.user.id,
          phoneNumber: patient?.phone ?? null,
          isLoggedIn: true,
          hasProfile: Boolean(patient?.age && patient?.gender),
          hasFamilyGroup: Boolean(patient?.family_id),
          isHydrated: true,
          hasShownIntro: hasShownIntroVal === 'true',
        });
      } catch {
        if (mounted) {
          logout();
          setSessionState({ isHydrated: true });
        }
      }
    };

    hydrateAuth();

    return () => { mounted = false; };
  }, [logout, setSessionState]);

  if (!loaded || isDeepLinkLoading) return <Loader text={isDeepLinkLoading ? "Signing in with Google..." : "Loading Swasthya AI..."} />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/callback" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
