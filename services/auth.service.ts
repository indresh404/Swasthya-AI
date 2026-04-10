import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
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
  created_at: string;
}

export interface FamilyRecord {
  id: string;
  family_name: string | null;
  qr_code: string | null;
  created_by: string | null;
  created_at: string;
  join_code: string | null;
}

export const getRedirectUrl = () => Linking.createURL(OAUTH_CALLBACK_PATH);

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

export const getPatientByPhone = async (phone: string) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const { data, error } = await supabase
    .from('patients')
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
    .from('patients')
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
      .from('patients')
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
        .from('patients')
        .update(payload)
        .eq('id', existingByPhone.id)
        .select('*')
        .single();

      if (error) throw error;
      patient = data as PatientRecord;
    } else {
      const { data, error } = await supabase
        .from('patients')
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

const buildMemberId = () => Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

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
  const session = await getCurrentSession();

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      family_name: familyName.trim(),
      created_by: session?.user.id ?? patient.id,
      join_code: joinCode,
    })
    .select('*')
    .single();

  if (familyError) throw familyError;

  const { error: patientUpdateError } = await supabase
    .from('patients')
    .update({ family_id: family.id })
    .eq('id', patient.id);

  if (patientUpdateError) throw patientUpdateError;

  const { error: memberError } = await supabase
    .from('family_members')
    .insert({
      id: buildMemberId(),
      family_id: family.id,
      patient_id: patient.id,
      role: 'admin',
    });

  if (memberError && memberError.code !== '23505') {
    throw memberError;
  }

  return {
    family: family as FamilyRecord,
    joinCode,
  };
};

export const joinFamilyForPatient = async (joinCode: string, patient: PatientRecord) => {
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('join_code', joinCode)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family) throw new Error('Invalid family code. Please check and try again.');

  const { data: existingMember, error: existingError } = await supabase
    .from('family_members')
    .select('id')
    .eq('family_id', family.id)
    .eq('patient_id', patient.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existingMember) {
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        id: buildMemberId(),
        family_id: family.id,
        patient_id: patient.id,
        role: 'member',
      });

    if (memberError) throw memberError;
  }

  const { error: patientUpdateError } = await supabase
    .from('patients')
    .update({ family_id: family.id })
    .eq('id', patient.id);

  if (patientUpdateError) throw patientUpdateError;

  return family as FamilyRecord;
};
