// app/services/auth.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Real Supabase Integration for Swasthya AI Auth
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Initialize WebBrowser for OAuth redirects
WebBrowser.maybeCompleteAuthSession();

// ── Key constants ─────────────────────────────────────────────────────────────
const KEY_ONBOARDING_DONE = 'onboardingComplete';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PatientRecord {
  id: string;
  name: string;
  email?: string | null;
  age: number | null;
  gender: string | null;
  phone: string | null;
  family_id: string | null;
  created_at?: string;
}

export interface FamilyRecord {
  id: string;
  family_name: string | null;
  qr_code: string | null;
  created_by: string | null;
  created_at: string;
  join_code: string | null;
  health_summary?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(-10);

// ── Sign Up ───────────────────────────────────────────────────────────────────
export const signUp = async (name: string, email: string, password: string): Promise<PatientRecord> => {
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password: password,
    options: {
      data: {
        full_name: name.trim(),
      }
    }
  });

  if (error) throw error;
  if (!data.user) throw new Error('Registration failed: no user returned');

  // Insert basic patient record into the 'patients' table in public schema
  try {
    const { error: dbError } = await supabase
      .from('patients')
      .insert({
        id: data.user.id,
        full_name: name.trim(),
        email: data.user.email,
        created_at: new Date().toISOString(),
      });
    if (dbError) {
      console.warn('Patient table insert failed during signup:', dbError.message);
    }
  } catch (dbErr) {
    console.error('Failed to create user DB row:', dbErr);
  }

  return {
    id: data.user.id,
    name: name.trim(),
    email: data.user.email,
    age: null,
    gender: null,
    phone: null,
    family_id: null,
    created_at: new Date().toISOString(),
  };
};

// ── Sign In ───────────────────────────────────────────────────────────────────
export interface SignInResult {
  success: boolean;
  user?: PatientRecord;
  error?: string;
}

export const signIn = async (email: string, password: string): Promise<SignInResult> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'User not found.' };
  }

  // Load profile from DB if exists
  let patient: PatientRecord | null = null;
  try {
    patient = await getPatientById(data.user.id);
  } catch (e) {
    console.warn('Error loading patient details after signin:', e);
  }

  const userRecord: PatientRecord = patient || {
    id: data.user.id,
    name: data.user.user_metadata?.full_name || email.split('@')[0],
    email: data.user.email,
    age: null,
    gender: null,
    phone: null,
    family_id: null,
    created_at: new Date().toISOString(),
  };

  return { success: true, user: userRecord };
};

// ── Session ───────────────────────────────────────────────────────────────────
export interface SessionData {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    is_anonymous: boolean;
    user_metadata: {
      patient_id: string;
      phone: string | null;
    };
  };
}

export const getCurrentSession = async (): Promise<SessionData | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      phone: session.user.phone ?? null,
      is_anonymous: session.user.is_anonymous ?? false,
      user_metadata: {
        patient_id: session.user.id,
        phone: session.user.phone ?? null,
      },
    },
  };
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
  await AsyncStorage.multiRemove([
    KEY_ONBOARDING_DONE,
    'current_user_id',
    'current_user_phone',
  ]);
};

// ── Patient helpers ───────────────────────────────────────────────────────────
export const getPatientById = async (id: string): Promise<PatientRecord | null> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  // Query family info from family_members mapping table
  const family = await getFamilyByPatientId(id);

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    age: data.age,
    gender: data.gender,
    phone: data.phone_number,
    family_id: family?.id ?? null,
    created_at: data.created_at,
  };
};

export const getPatientByPhone = async (phone: string): Promise<PatientRecord | null> => {
  const normalized = normalizePhone(phone);
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('phone_number', normalized)
    .maybeSingle();

  if (error || !data) return null;

  const family = await getFamilyByPatientId(data.id);

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    age: data.age,
    gender: data.gender,
    phone: data.phone_number,
    family_id: family?.id ?? null,
    created_at: data.created_at,
  };
};

export const getCurrentPatient = async (): Promise<PatientRecord | null> => {
  const session = await getCurrentSession();
  if (!session) return null;
  return getPatientById(session.user.id);
};

export const savePatientProfile = async (input: {
  patientId?: string | null;
  name: string;
  age: number;
  gender: string;
  phone?: string | null;
  familyId?: string | null;
}): Promise<PatientRecord> => {
  const { data: { session } } = await supabase.auth.getSession();
  const resolvedId = input.patientId ?? session?.user.id;
  if (!resolvedId) throw new Error('No active user session');

  const normalizedPhone = input.phone ? normalizePhone(input.phone) : null;

  const dbPayload = {
    id: resolvedId,
    full_name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    phone_number: normalizedPhone,
    email: session?.user.email,
  };

  const { data, error } = await supabase
    .from('patients')
    .upsert(dbPayload)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    age: data.age,
    gender: data.gender,
    phone: data.phone_number,
    family_id: input.familyId ?? null,
    created_at: data.created_at,
  };
};

export const saveUserSession = async (phone: string, userId: string): Promise<void> => {
  const normalized = phone ? normalizePhone(phone) : '';
  const pairs: [string, string][] = [['current_user_id', userId]];
  if (normalized) pairs.push(['current_user_phone', normalized]);
  await AsyncStorage.multiSet(pairs);
};

export const ensureUserRowForSession = async (input: {
  userId: string;
  phone: string;
  name?: string;
}): Promise<PatientRecord | null> => {
  const existing = await getPatientById(input.userId);
  if (existing) return existing;

  const normalizedPhone = input.phone ? normalizePhone(input.phone) : null;
  const dbPayload = {
    id: input.userId,
    full_name: input.name?.trim() ?? 'User',
    phone_number: normalizedPhone,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('patients')
    .upsert(dbPayload)
    .select()
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    age: data.age,
    gender: data.gender,
    phone: data.phone_number,
    family_id: null,
    created_at: data.created_at,
  };
};

export const createPhoneAuthUser = async (phone: string, name?: string): Promise<PatientRecord | null> => {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const id = `user_${normalized}`;
  
  const dbPayload = {
    id,
    full_name: name?.trim() ?? 'User',
    phone_number: normalized,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('patients')
    .upsert(dbPayload)
    .select()
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    age: data.age,
    gender: data.gender,
    phone: data.phone_number,
    family_id: null,
    created_at: data.created_at,
  };
};

// ── Onboarding flag ───────────────────────────────────────────────────────────
export const markOnboardingComplete = async (): Promise<void> => {
  await AsyncStorage.setItem(KEY_ONBOARDING_DONE, 'true');
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(KEY_ONBOARDING_DONE);
  return val === 'true';
};

// ── Family helpers (Aligned with Patients, FamilyGroups, FamilyMembers schema) ──
export const createFamilyForPatient = async (familyName: string, patient: PatientRecord) => {
  const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 1. Insert into family_groups
  const { data: familyGroup, error: familyError } = await supabase
    .from('family_groups')
    .insert({
      family_name: familyName.trim(),
      family_code: joinCode,
      created_by: patient.id,
    })
    .select()
    .single();

  if (familyError) throw familyError;

  // 2. Add creator to family_members as admin
  const { error: memberError } = await supabase
    .from('family_members')
    .insert({
      family_id: familyGroup.id,
      patient_id: patient.id,
      role: 'admin',
    });

  if (memberError) throw memberError;

  const family: FamilyRecord = {
    id: familyGroup.id,
    family_name: familyGroup.family_name,
    qr_code: `SWASTHYA_FAMILY:${joinCode}`,
    created_by: familyGroup.created_by,
    created_at: familyGroup.created_at,
    join_code: joinCode,
    health_summary: familyGroup.health_summary,
  };

  return { family, joinCode };
};

export const joinFamilyForPatient = async (joinCode: string, patient: PatientRecord) => {
  const normalizedCode = joinCode.trim();

  // 1. Find family group by 6-digit code
  const { data: familyGroup, error: familyError } = await supabase
    .from('family_groups')
    .select('*')
    .eq('family_code', normalizedCode)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!familyGroup) throw new Error('Family group not found for the given code');

  // 2. Add patient to family_members mapping table
  const { error: memberError } = await supabase
    .from('family_members')
    .upsert({
      family_id: familyGroup.id,
      patient_id: patient.id,
      role: 'member',
    }, { onConflict: 'family_id,patient_id' });

  if (memberError) throw memberError;

  const family: FamilyRecord = {
    id: familyGroup.id,
    family_name: familyGroup.family_name,
    qr_code: `SWASTHYA_FAMILY:${normalizedCode}`,
    created_by: familyGroup.created_by,
    created_at: familyGroup.created_at,
    join_code: normalizedCode,
    health_summary: familyGroup.health_summary,
  };

  return family;
};

export const getFamilyByPatientId = async (patientId: string): Promise<FamilyRecord | null> => {
  // Query family_members to find family ID for patient
  const { data: memberData, error: memberError } = await supabase
    .from('family_members')
    .select('family_id, family_groups (*)')
    .eq('patient_id', patientId)
    .maybeSingle();

  if (memberError || !memberData || !memberData.family_groups) return null;

  const fg = memberData.family_groups as any;

  return {
    id: fg.id,
    family_name: fg.family_name,
    qr_code: `SWASTHYA_FAMILY:${fg.family_code}`,
    created_by: fg.created_by,
    created_at: fg.created_at,
    join_code: fg.family_code,
    health_summary: fg.health_summary,
  };
};

export const getFamilyMembers = async (familyId: string) => {
  const { data, error } = await supabase
    .from('family_members')
    .select('id, family_id, patient_id, role, patients (*)')
    .eq('family_id', familyId);

  if (error || !data) return [];

  return data.map((m: any) => ({
    id: m.id,
    family_id: m.family_id,
    patient_id: m.patient_id,
    role: m.role,
    patient: m.patients ? {
      id: m.patients.id,
      name: m.patients.full_name,
      email: m.patients.email,
      age: m.patients.age,
      gender: m.patients.gender,
      phone: m.patients.phone_number,
      family_id: familyId,
      created_at: m.patients.created_at,
    } : null,
  }));
};

// Legacy OTP stubs
export const generateRandomOTP = (): string => '123456';
export const storeOTPLocally = async (_phone: string, _otp: string): Promise<void> => {};
export const getStoredOTP = async (_phone: string): Promise<string | null> => '123456';
export const clearStoredOTP = async (): Promise<void> => {};
export const getRedirectUrl = (): string => '';

// Helper to generate a unique 10-digit phone number deterministically from any ID
export const generateDummyPhoneFromId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash).toString();
  return (positiveHash + '1234567890').slice(0, 10);
};

// Supabase Google Auth Flow
export const signInWithGoogle = async (email?: string, name?: string) => {
  try {
    const redirectUrl = Linking.createURL('/(auth)/login');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success' && result.url) {
      const parsedUrl = Linking.parse(result.url);
      const { access_token, refresh_token } = parsedUrl.queryParams || {};

      if (access_token && refresh_token) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (sessionError) throw sessionError;

        if (sessionData.user) {
          // Check if patient details already exist in patients table
          const existing = await getPatientById(sessionData.user.id);
          if (!existing) {
            const fullName = sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || name || 'User';
            await supabase.from('patients').insert({
              id: sessionData.user.id,
              full_name: fullName,
              email: sessionData.user.email,
              phone_number: generateDummyPhoneFromId(sessionData.user.id),
              created_at: new Date().toISOString(),
            });
          }

          return {
            user: {
              id: sessionData.user.id,
              email: sessionData.user.email,
              name: sessionData.user.user_metadata?.full_name || 'User',
            }
          };
        }
      }
    }
    return null;
  } catch (err) {
    console.error('Google Sign In error:', err);
    throw err;
  }
};
