// store/auth.store.ts
import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  userId: string | null;
  patientId: string | null;
  phoneNumber: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasFamilyGroup: boolean;
  onboardingComplete: boolean;
  user: User | null;
  session: Session | null;
  isHydrated: boolean;
  hasShownIntro: boolean;
  setSession: (session: Session | null) => void;
  setSessionState: (state: Partial<Pick<AuthState, 'userId' | 'patientId' | 'phoneNumber' | 'isLoggedIn' | 'hasProfile' | 'hasFamilyGroup' | 'onboardingComplete' | 'isHydrated' | 'hasShownIntro'>>) => void;
  setHasProfile: (value: boolean) => void;
  setHasFamilyGroup: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  patientId: null,
  phoneNumber: null,
  isLoggedIn: false,
  hasProfile: false,
  hasFamilyGroup: false,
  onboardingComplete: false,
  user: null,
  session: null,
  isHydrated: false,
  hasShownIntro: false,
  setSession: (session) => set({
    session,
    user: session?.user || null,
    userId: session?.user?.id || null,
    patientId: (session?.user?.user_metadata?.patient_id as string | undefined) || session?.user?.id || null,
    phoneNumber: (session?.user?.user_metadata?.phone as string | undefined) || null,
    isLoggedIn: Boolean(session),
  }),
  setSessionState: (state) => set((prev) => {
    const newState = {
      ...prev,
      ...state,
    };
    
    // Automatically manage onboardingComplete status in AsyncStorage
    if (state.hasFamilyGroup === true || (newState.isLoggedIn && newState.hasProfile && newState.hasFamilyGroup)) {
      AsyncStorage.setItem('onboardingComplete', 'true').catch(() => {});
      newState.onboardingComplete = true;

      // Update cached profile to have family_id set so that getCurrentPatient resolves properly
      const resolvedId = newState.userId || newState.patientId;
      if (resolvedId) {
        AsyncStorage.getItem(`user_profile_${resolvedId}`).then((str) => {
          if (str) {
            try {
              const parsed = JSON.parse(str);
              if (!parsed.family_id) {
                parsed.family_id = 'family_completed';
                AsyncStorage.setItem(`user_profile_${resolvedId}`, JSON.stringify(parsed)).catch(() => {});
                if (parsed.phone) {
                  AsyncStorage.setItem(`user_profile_${parsed.phone}`, JSON.stringify(parsed)).catch(() => {});
                }
              }
            } catch (e) {}
          }
        });
      }
    } else if (state.onboardingComplete === true) {
      AsyncStorage.setItem('onboardingComplete', 'true').catch(() => {});
    }

    return newState;
  }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setHasFamilyGroup: (hasFamilyGroup) => set({ hasFamilyGroup }),
  logout: () => {
    // Dynamically sign out of Supabase
    try {
      const { supabase } = require('@/config/supabase');
      supabase.auth.signOut().catch((e: any) => console.log('Supabase signout failed', e));
    } catch (_) {}

    // Clear local storage keys
    AsyncStorage.removeItem('current_user_phone').catch(() => {});
    AsyncStorage.removeItem('current_user_id').catch(() => {});
    AsyncStorage.removeItem('jwt_token').catch(() => {});
    AsyncStorage.removeItem('onboardingComplete').catch(() => {});
    
    set({
      userId: null,
      patientId: null,
      phoneNumber: null,
      isLoggedIn: false,
      hasProfile: false,
      hasFamilyGroup: false,
      onboardingComplete: false,
      user: null,
      session: null,
      isHydrated: true,
      hasShownIntro: false,
    });
  },
}));
