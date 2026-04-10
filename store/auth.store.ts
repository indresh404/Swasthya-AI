import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  patientId: string | null;
  phoneNumber: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasFamilyGroup: boolean;
  setSessionState: (payload: {
    userId?: string | null;
    patientId?: string | null;
    phoneNumber?: string | null;
    hasProfile?: boolean;
    hasFamilyGroup?: boolean;
  }) => void;
  setHasProfile: (value: boolean) => void;
  setHasFamilyGroup: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      patientId: null,
      phoneNumber: null,
      isLoggedIn: false,
      hasProfile: false,
      hasFamilyGroup: false,
      setSessionState: (payload) =>
        set((state) => {
          const nextUserId = payload.userId !== undefined ? payload.userId : state.userId;
          return {
            userId: nextUserId,
            patientId: payload.patientId !== undefined ? payload.patientId : state.patientId,
            phoneNumber: payload.phoneNumber !== undefined ? payload.phoneNumber : state.phoneNumber,
            hasProfile: payload.hasProfile !== undefined ? payload.hasProfile : state.hasProfile,
            hasFamilyGroup:
              payload.hasFamilyGroup !== undefined ? payload.hasFamilyGroup : state.hasFamilyGroup,
            isLoggedIn: Boolean(nextUserId),
          };
        }),
      setHasProfile: (hasProfile) => set({ hasProfile }),
      setHasFamilyGroup: (hasFamilyGroup) => set({ hasFamilyGroup }),
      logout: () =>
        set({
          userId: null,
          patientId: null,
          phoneNumber: null,
          isLoggedIn: false,
          hasProfile: false,
          hasFamilyGroup: false,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
