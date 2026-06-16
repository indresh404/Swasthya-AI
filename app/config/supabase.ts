// config/supabase.ts
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createMockSupabase = () => {
    const makePromise = (data: any, error: any = null) => {
        const p = Promise.resolve({ data, error });
        const chain = {
            select: () => chain,
            eq: () => chain,
            order: () => chain,
            limit: () => chain,
            single: () => Promise.resolve({ data, error }),
            maybeSingle: () => Promise.resolve({ data, error }),
            insert: (payload: any) => {
                const insertedData = Array.isArray(payload) ? payload[0] : payload;
                return makePromise(insertedData);
            },
            update: (payload: any) => {
                return makePromise(payload);
            },
            then: (onfulfilled: any) => p.then(onfulfilled),
            catch: (onrejected: any) => p.catch(onrejected),
        };
        return chain;
    };

    return {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            signInAnonymously: () => Promise.resolve({ data: { session: null }, error: null }),
            signInWithOAuth: (options: any) => Promise.resolve({ data: { url: 'https://placeholder.supabase.co/auth/v1/authorize' }, error: null }),
            setSession: (session: any) => Promise.resolve({ data: { session: { user: { id: 'mock-google-user', email: 'user@example.com' } } }, error: null }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: (callback: any) => {
                // Return a mock unsubscriber subscription
                return { data: { subscription: { unsubscribe: () => {} } } };
            },
        },
        from: (table: string) => {
            if (table === 'users') {
                return makePromise({
                    id: 'demo-patient-id',
                    name: 'Rahul Kumar',
                    age: 24,
                    gender: 'Male',
                    phone: '9324474812',
                    family_id: 'family_123456',
                    created_at: new Date().toISOString()
                });
            }
            if (table === 'families') {
                return makePromise({
                    id: 'family_123456',
                    family_name: 'Sharma Family',
                    qr_code: 'SWASTHYA_FAMILY:123456',
                    created_by: 'demo-patient-id',
                    created_at: new Date().toISOString(),
                    join_code: '123456'
                });
            }
            if (table === 'family_groups') {
                return makePromise([
                    {
                        id: 'member-1',
                        family_id: 'family_123456',
                        patient_id: 'patient-1',
                        role: 'admin',
                        patient: {
                            id: 'patient-1',
                            name: 'Rahul Kumar',
                            age: 24,
                            gender: 'Male',
                            phone: '9324474812',
                            family_id: 'family_123456'
                        }
                    }
                ]);
            }
            return makePromise([]);
        }
    };
};

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mmdhzvbjbnamepfiryra.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZGh6dmJqYm5hbWVwZmlyeXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMDc5NjYsImV4cCI6MjA5Njg4Mzk2Nn0.eGrsAyADnIp951edaSe6gHw2TdxfaFljw19vKoXmWW4';

// Custom SSR-safe storage adapter for Web / SSR environments
const expoStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: expoStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
