import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';

WebBrowser.maybeCompleteAuthSession();

export const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(-10);

const OAUTH_CALLBACK_PATH = 'auth/callback';

export interface PatientRecord {
  id: string;
  name: string;
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
}

interface DemoFamilyRecord extends FamilyRecord {
  members: string[];
}

export const getRedirectUrl = () => Linking.createURL(OAUTH_CALLBACK_PATH);

const isRlsError = (error: unknown) =>
  Boolean(error && typeof error === 'object' && (error as { code?: string }).code === '42501');

const DEMO_FAMILY_KEY = 'demo_families_v1';

const readDemoFamilies = async (): Promise<DemoFamilyRecord[]> => {
  const raw = await AsyncStorage.getItem(DEMO_FAMILY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DemoFamilyRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDemoFamilies = async (families: DemoFamilyRecord[]) => {
  await AsyncStorage.setItem(DEMO_FAMILY_KEY, JSON.stringify(families));
};

const ensureAuthenticatedSession = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
  if (anonError) return null;
  return anonData.session ?? null;
};

export const signInWithGoogle = async () => {
  const redirectTo = getRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('Unable to start Google sign in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign in was cancelled.');
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
  if (sessionError) throw sessionError;

  return sessionData.session;
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const ensureUserRowForSession = async (input: {
  userId: string;
  phone: string;
  name?: string;
}) => {
  const normalizedPhone = normalizePhone(input.phone);
  if (!normalizedPhone) return null;

  const { data: byId, error: byIdError } = await supabase
    .from('users')
    .select('*')
    .eq('id', input.userId)
    .maybeSingle();
  if (byIdError && !isRlsError(byIdError)) throw byIdError;
  if (byId) return byId as PatientRecord;

  const { data: byPhone, error: byPhoneError } = await supabase
    .from('users')
    .select('*')
    .eq('phone', normalizedPhone)
    .maybeSingle();
  if (byPhoneError && !isRlsError(byPhoneError)) throw byPhoneError;
  if (byPhone) return byPhone as PatientRecord;

  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({
      id: input.userId,
      name: input.name?.trim() || 'User',
      phone: normalizedPhone,
    })
    .select('*')
    .maybeSingle();

  if (insertError && !isRlsError(insertError)) throw insertError;
  return (inserted as PatientRecord | null) ?? null;
};

export const getPatientByPhone = async (phone: string) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', normalizedPhone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PatientRecord | null;
};

export const getPatientById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as PatientRecord | null;
};

export const getCurrentPatient = async () => {
  const session = await getCurrentSession();
  const patientId = session?.user.user_metadata?.patient_id as string | undefined;
  const phone = session?.user.user_metadata?.phone as string | undefined;

  if (patientId) {
    const patient = await getPatientById(patientId);
    if (patient) return patient;
  }

  if (phone) {
    return getPatientByPhone(phone);
  }

  return null;
};

export const savePatientProfile = async (input: {
  patientId?: string | null;
  name: string;
  age: number;
  gender: string;
  phone: string;
  familyId?: string | null;
}) => {
  await ensureAuthenticatedSession();

  const payload = {
    name: input.name.trim(),
    age: input.age,
    gender: input.gender,
    phone: normalizePhone(input.phone),
    family_id: input.familyId ?? null,
  };

  let patient: PatientRecord | null = null;

  if (input.patientId) {
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', input.patientId)
      .select('*')
      .single();

    if (error) throw error;
    patient = data as PatientRecord;
  } else {
    const existingByPhone = await getPatientByPhone(payload.phone);
    if (existingByPhone) {
      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', existingByPhone.id)
        .select('*')
        .single();

      if (error) throw error;
      patient = data as PatientRecord;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      patient = data as PatientRecord;
    }
  }

  const session = await getCurrentSession();
  if (session) {
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        patient_id: patient.id,
        phone: patient.phone,
        name: patient.name,
      },
    });

    if (updateError) throw updateError;
  }

  return patient;
};

const generateJoinCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const getUniqueJoinCode = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateJoinCode();
    const { data, error } = await supabase
      .from('families')
      .select('id')
      .eq('join_code', code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return code;
  }

  throw new Error('Unable to generate a unique family code. Please try again.');
};

export const createFamilyForPatient = async (familyName: string, patient: PatientRecord) => {
  const joinCode = await getUniqueJoinCode();
  const session = await ensureAuthenticatedSession();
  const createLocalFamily = async () => {
    const localFamily: DemoFamilyRecord = {
      id: `family-${Date.now()}`,
      family_name: familyName.trim(),
      qr_code: null,
      created_by: patient.id,
      created_at: new Date().toISOString(),
      join_code: joinCode,
      members: [patient.id],
    };
    const families = await readDemoFamilies();
    families.push(localFamily);
    await writeDemoFamilies(families);
    return { family: localFamily as FamilyRecord, joinCode };
  };

  if (!session) {
    return createLocalFamily();
  }

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      family_name: familyName.trim(),
      created_by: session?.user.id ?? patient.id,
      join_code: joinCode,
    })
    .select('*')
    .single();

  if (familyError) {
    return createLocalFamily();
  }

  const { error: patientUpdateError } = await supabase
    .from('users')
    .update({ family_id: family.id })
    .eq('id', patient.id);

  if (patientUpdateError && !isRlsError(patientUpdateError)) throw patientUpdateError;

  const { error: memberError } = await supabase
    .from('family_groups')
    .insert({
      family_id: family.id,
      patient_id: patient.id,
      role: 'admin',
    });

  if (memberError && memberError.code !== '23505' && !isRlsError(memberError)) {
    throw memberError;
  }

  return {
    family: family as FamilyRecord,
    joinCode,
  };
};

export const joinFamilyForPatient = async (joinCode: string, patient: PatientRecord) => {
  const session = await ensureAuthenticatedSession();

  const joinLocalFamily = async () => {
    const demoFamilies = await readDemoFamilies();
    const local = demoFamilies.find((entry) => entry.join_code === joinCode);
    if (!local) throw new Error('Invalid family code. Please check and try again.');
    if (!local.members.includes(patient.id)) {
      local.members.push(patient.id);
      await writeDemoFamilies(demoFamilies);
    }
    return local as FamilyRecord;
  };

  if (!session) {
    return joinLocalFamily();
  }

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('join_code', joinCode)
    .maybeSingle();

  if (familyError) {
    return joinLocalFamily();
  }

  let matchedFamily = family as FamilyRecord | null;
  if (!matchedFamily) {
    return joinLocalFamily();
  }

  const { data: existingMember, error: existingError } = await supabase
    .from('family_groups')
    .select('id')
    .eq('family_id', matchedFamily.id)
    .eq('patient_id', patient.id)
    .maybeSingle();

  if (existingError && !isRlsError(existingError)) throw existingError;
  if (!existingMember) {
    const { error: memberError } = await supabase
      .from('family_groups')
      .insert({
        family_id: matchedFamily.id,
        patient_id: patient.id,
        role: 'member',
      });

    if (memberError && !isRlsError(memberError)) throw memberError;
  }

  const { error: patientUpdateError } = await supabase
    .from('users')
    .update({ family_id: matchedFamily.id })
    .eq('id', patient.id);

  if (patientUpdateError && !isRlsError(patientUpdateError)) throw patientUpdateError;

  return matchedFamily;
};
