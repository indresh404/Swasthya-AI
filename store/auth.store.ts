// store/auth.store.ts
import { User } from 'firebase/auth';
import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasFamilyGroup: boolean;
  user: User | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  setUser: (userId: string | null, userData?: User | null) => void;
  setHasProfile: (value: boolean) => void;
  setHasFamilyGroup: (value: boolean) => void;
  logout: () => void;
  updateUserData: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isLoggedIn: false,
  hasProfile: false,
  hasFamilyGroup: false,
  user: null,
  email: null,
  displayName: null,
  photoURL: null,
  setUser: (userId, userData = null) => set({
    userId,
    isLoggedIn: Boolean(userId),
    user: userData,
    email: userData?.email || null,
    displayName: userData?.displayName || null,
    photoURL: userData?.photoURL || null,
  }),
  setHasProfile: (hasProfile) => set({ hasProfile }),
  setHasFamilyGroup: (hasFamilyGroup) => set({ hasFamilyGroup }),
  updateUserData: (user) => set({
    user,
    userId: user?.uid || null,
    isLoggedIn: Boolean(user),
    email: user?.email || null,
    displayName: user?.displayName || null,
    photoURL: user?.photoURL || null,
  }),
  logout: () =>
    set({
      userId: null,
      isLoggedIn: false,
      hasProfile: false,
      hasFamilyGroup: false,
      user: null,
      email: null,
      displayName: null,
      photoURL: null,
    }),
}));