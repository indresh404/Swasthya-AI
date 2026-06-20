import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/services/supabaseClient';

const isOfflineId = (id: string | null | undefined): boolean => {
    if (!id) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
};

const safeFetchJson = async (url: string, init?: RequestInit) => {
    try {
        const response = await fetch(url, init);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
};

export const getPatientProfile = async (id: string) => {
    if (isOfflineId(id)) {
        return {
            id: id,
            name: 'Indresh Suresh',
            email: 'indresh@example.com',
            age: 20,
            gender: 'Male',
            phone: '+91 9324474812',
            created_at: new Date().toISOString(),
        };
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.PROFILE.GET(id)}`);
    if (data?.status === 'success') {
        return data.profile;
    }
    // Direct Supabase fallback
    try {
        const { data: dbData, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (!error && dbData) {
            return {
                id: dbData.id,
                name: dbData.full_name,
                email: dbData.email,
                age: dbData.age,
                gender: dbData.gender,
                phone: dbData.phone_number,
                created_at: dbData.created_at,
            };
        }
    } catch (e) {
        console.warn('Supabase fallback error:', e);
    }
    return null;
};

export const updatePatientProfile = async (id: string, updates: any) => {
    if (isOfflineId(id)) {
        return { status: 'success', updated: true, profile: { id, ...updates } };
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.PROFILE.PATCH(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (data) return data;
    
    // Direct Supabase fallback
    try {
        const dbPayload = {
            full_name: updates.name || updates.full_name,
            age: updates.age,
            gender: updates.gender,
            phone_number: updates.phone || updates.phone_number,
            location: updates.location,
        };
        // Remove undefined values
        Object.keys(dbPayload).forEach(key => (dbPayload as any)[key] === undefined && delete (dbPayload as any)[key]);

        const { data: dbData, error } = await supabase
            .from('patients')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .maybeSingle();
        if (!error && dbData) {
            return { status: 'success', updated: true, profile: dbData };
        }
    } catch (e) {
        console.warn('Supabase update fallback error:', e);
    }
    return { status: 'demo', updated: true };
};

export const getMedicines = async (id: string) => {
    if (isOfflineId(id)) {
        return [
            { id: '1', medicine_name: 'Metformin 500mg', dosage: '500mg', frequency: 'Once daily (morning)', is_critical: true, is_active: true },
            { id: '2', medicine_name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily (evening)', is_critical: false, is_active: true },
            { id: '3', medicine_name: 'Vitamin D3', dosage: '60k', frequency: 'Once weekly', is_critical: false, is_active: true }
        ];
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.MEDS.LIST(id)}`);
    if (data?.status === 'success') {
        return data.medications;
    }

    // Direct Supabase fallback
    try {
        const { data: dbData, error } = await supabase
            .from('medicines')
            .select('*')
            .eq('patient_id', id)
            .eq('is_active', true);
        if (!error && dbData && dbData.length > 0) {
            return dbData;
        }
    } catch (e) {
        console.warn('Supabase medicines fallback error:', e);
    }

    // Final mock fallback
    return [
        { id: '1', medicine_name: 'Glycomet', dosage: '500mg', frequency: 'Twice daily', is_critical: true },
        { id: '2', medicine_name: 'Amlong', dosage: '5mg', frequency: 'Once daily', is_critical: false }
    ];
};

export const logMedAdherence = async (patientId: string, medicine: string) => {
    if (isOfflineId(patientId)) {
        return { status: 'success', logged: true };
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.MEDS.LOG}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, medicine }),
    });
    if (data) return data;

    // Direct Supabase fallback
    try {
        const { data: dbData, error } = await supabase
            .from('adherence_log')
            .insert({
                patient_id: patientId,
                medicine: medicine,
                taken_at: new Date().toISOString()
            });
        if (!error) return { status: 'success', logged: true };
    } catch (e) {
        console.warn('Supabase log fallback error:', e);
    }
    return { status: 'demo', logged: true };
};

export const addMedicine = async (patientId: string, medicineData: any) => {
    if (isOfflineId(patientId)) {
        return { 
            status: 'success', 
            added: true, 
            medicine: { 
                id: `offline-med-${Date.now()}`, 
                patient_id: patientId, 
                medicine_name: medicineData.medicine_name || medicineData.name, 
                dosage: medicineData.dosage || 'Standard', 
                frequency: medicineData.frequency || 'Once daily', 
                is_critical: medicineData.is_critical || false, 
                is_active: true 
            } 
        };
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.MEDS.ADD(patientId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, ...medicineData }),
    });
    if (data) return data;

    // Direct Supabase fallback
    try {
        const { data: dbData, error } = await supabase
            .from('medicines')
            .insert({
                patient_id: patientId,
                medicine_name: medicineData.medicine_name || medicineData.name,
                dosage: medicineData.dosage || '',
                frequency: medicineData.frequency || '',
                is_critical: medicineData.is_critical || false,
                is_active: true
            })
            .select()
            .single();
        if (!error && dbData) return { status: 'success', added: true, medicine: dbData };
    } catch (e) {
        console.warn('Supabase add fallback error:', e);
    }
    return { status: 'demo', added: true };
};

export const getPendingCheckins = async (id: string) => {
    if (isOfflineId(id)) {
        return [];
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.PENDING(id)}`);
    if (data?.status === 'success') {
        return data.questions;
    }

    // Direct Supabase fallback
    try {
        const { data: dbData, error } = await supabase
            .from('pending_checkin_questions')
            .select('*')
            .eq('patient_id', id)
            .eq('status', 'pending');
        if (!error && dbData) return dbData;
    } catch (e) {
        console.warn('Supabase checkins fallback error:', e);
    }
    return [];
};

export const submitCheckin = async (patientId: string, answers: any[]) => {
    if (isOfflineId(patientId)) {
        return { status: 'success', submitted: true };
    }
    const data = await safeFetchJson(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.SUBMIT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, answers }),
    });
    if (data) return data;

    // Direct Supabase fallback
    try {
        const { data: dbData, error } = await supabase
            .from('checkin_questions')
            .insert({
                patient_id: patientId,
                date: new Date().toISOString().split('T')[0],
                questions: answers,
                created_at: new Date().toISOString()
            });
        if (!error) return { status: 'success', submitted: true };
    } catch (e) {
        console.warn('Supabase checkin submit fallback error:', e);
    }
    return { status: 'demo', submitted: true };
};
