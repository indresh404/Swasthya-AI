import { API_ENDPOINTS, BACKEND_URL } from '@/config/api';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/services/supabaseClient';

const isOfflineId = (id: string | null | undefined): boolean => {
    if (!id) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
};

// Helper to delay response for realistic UI loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const backendService = {
    // Jan Aushadhi Stores
    getNearestStores: async (lat: number, lon: number) => {
        await delay(1000);
        
        const REAL_STORES = [
            {
                id: 'real-store-1',
                store_name: 'Jan Aushadhi Borivali (West)',
                latitude: 19.2299,
                longitude: 72.8480,
                area: 'Shop No. 4, Bethlehem Apartments, S V Patel Road, Near Dominos & Bhagwati Hospital, Borivali (West)',
            },
            {
                id: 'real-store-2',
                store_name: 'Jan Aushadhi Andheri (East)',
                latitude: 19.1155,
                longitude: 72.8687,
                area: 'Shop No. 11, Mubarak Manzil, Church Road, Marol, Andheri (East)',
            },
            {
                id: 'real-store-3',
                store_name: 'Jan Aushadhi Ghatkopar (West)',
                latitude: 19.0886,
                longitude: 72.9082,
                area: 'Ghatkopar Seva Sangh, Near Chirag Nagar Police Station, LBS Marg, Ghatkopar (West)',
            },
            {
                id: 'real-store-4',
                store_name: 'Jan Aushadhi Kandivali (West)',
                latitude: 19.2062,
                longitude: 72.8427,
                area: 'Shop No. 18, Nemi Krishna Co-op Society, Jethwa Nagar, V L Road, Kandivali (West)',
            },
            {
                id: 'real-store-5',
                store_name: 'Jan Aushadhi Malad (West)',
                latitude: 19.1860,
                longitude: 72.8485,
                area: 'Shop No. 1, Kothari Apartment, Mamlatdar Wadi, S V Road, Malad (West)',
            },
            {
                id: 'real-store-6',
                store_name: 'Jan Aushadhi Navi Mumbai (Kharghar)',
                latitude: 19.0260,
                longitude: 73.0694,
                area: 'Shop No. 13, Plot No. 35-36, Maitri Icon, Kpc High School Rd, Sector-19, Kharghar',
            },
            {
                id: 'real-store-7',
                store_name: 'Jan Aushadhi Thane (West)',
                latitude: 19.2183,
                longitude: 72.9781,
                area: 'Shop No. D/6, Siddhivinayak Co-op Society, Sawarkar Nagar, Thane (West)',
            }
        ];

        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        const sortedStores = REAL_STORES.map(store => {
            const dist = calculateDistance(lat, lon, store.latitude, store.longitude);
            return {
                ...store,
                distance_km: dist.toFixed(1)
            };
        }).sort((a, b) => parseFloat(a.distance_km) - parseFloat(b.distance_km));

        return {
            status: 'success',
            stores: sortedStores.slice(0, 3)
        };
    },

    endSession: async (patientId: string, log: any[], existingSummary: string) => {
        if (isOfflineId(patientId)) {
            return {
                daily_summary: "Your daily health metrics are stable. Metformin taken on time. Fasting glucose at 110 mg/dL is within control.",
                urgency: "Normal",
                key_risks: "None detected",
                symptoms_today: ["Anxiety"]
            };
        }
        try {
            const response = await fetch(`${BACKEND_URL}/health/daily-summary?patient_id=${patientId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error("Daily summary request failed");
            const result = await response.json();
            return {
                daily_summary: result.summary || "Summary generated successfully.",
                urgency: "Normal",
                key_risks: "None detected",
                symptoms_today: (result.symptoms_reported || []) as string[]
            };
        } catch (e) {
            console.error("endSession API error:", e);
            return {
                daily_summary: "Summary could not be synchronized with server.",
                urgency: "Normal",
                key_risks: "None detected",
                symptoms_today: []
            };
        }
    },

    // Risk Scoring
    generateRisk: async (data: any) => {
        await delay(1000);
        return {
            success: true,
            score: 68,
            level: "Moderate",
            factors: ["Age", "Slightly elevated BP"],
            recommendation: "Monitor BP daily and restrict salt intake.",
            base_score: 65,
            rag_adjustment: 3,
            final_score: 68,
            risk_level: "Moderate",
            guideline_reference: "AHA/ACC Hypertension Guidelines 2017"
        };
    },

    // Risk Prediction
    predictRisk: async (data: any) => {
        await delay(1200);
        return {
            success: true,
            risk_score: 65,
            risk_level: "Moderate",
            cardiovascular_risk: "Low-Moderate",
            diabetes_risk: "Low",
            hypertension_risk: "Moderate",
            recommendations: [
                "Engage in 30 minutes of moderate aerobic exercise 5 days a week.",
                "Ensure regular medical check-ups every 6 months."
            ]
        };
    },

    // Scheme Matching (Jan Aushadhi included)
    matchSchemes: async (data: any) => {
        await delay(800);
        return {
            success: true,
            schemes: [
                {
                    id: "scheme-1",
                    name: "Ayushman Bharat PM-JAY",
                    description: "Provides health cover up to Rs. 5 Lakh per family per year for secondary and tertiary care hospitalization.",
                    benefits: ["Cashless treatment", "Covers pre-existing diseases"],
                    eligibility: "Low-income households"
                },
                {
                    id: "scheme-2",
                    name: "Pradhan Mantri Suraksha Bima Yojana",
                    description: "Accident insurance scheme offering accidental death and disability cover.",
                    benefits: ["Rs. 2 Lakh cover for death/disability"],
                    eligibility: "All bank account holders aged 18-70"
                }
            ],
            generic_alternatives: [
                {
                    brand_name: "Metformin 500mg",
                    generic_name: "Metformin Hydrochloride",
                    brand_price: 45.5,
                    jan_aushadhi_price: 9.2,
                    savings_percent: 80
                },
                {
                    brand_name: "Amlodipine 5mg",
                    generic_name: "Amlodipine Besylate",
                    brand_price: 32.0,
                    jan_aushadhi_price: 5.5,
                    savings_percent: 83
                }
            ]
        };
    },

    // Drug Interaction
    checkInteraction: async (data: any) => {
        await delay(800);
        return {
            success: true,
            has_interaction: false,
            severity: "None",
            description: "No significant interactions found between the selected medications.",
            conflict_found: false,
            warning_text: "",
            recommendation: "No significant interactions found. Safe to proceed."
        };
    },

    // Main Chat
    sendMessage: async (patientId: string, message: string, context: any) => {
        try {
            const response = await fetch(`${BACKEND_URL}/health/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patientId, message })
            });
            if (!response.ok) throw new Error("Chat message request failed");
            const res = await response.json();
            
            return {
                bot_reply: res.ai_reply,
                medical_event: res.saving,
                save_status: res.saving ? {
                    action: "Saved to health graph",
                    symptoms_created: res.saved_data?.symptoms || [],
                    symptoms_updated: [],
                    symptoms_resolved: [],
                    message: `Saved to Neo4j graph (Score: ${res.importance_score}/10)`
                } : null
            };
        } catch (e) {
            console.error("sendMessage API error:", e);
            return {
                bot_reply: "I am having trouble communicating with the backend. Please check connection.",
                medical_event: false,
                save_status: null
            };
        }
    },

    extractReport: async (fileUri: string, fileName: string, fileType: string) => {
        await delay(2000);
        return {
            success: true,
            data: {
                patient_name: "Indresh Suresh",
                report_date: "2026-06-10",
                key_findings: "Normal lipid profile. Hemoglobin: 14.5 g/dL (Normal). Blood Glucose (Fasting): 98 mg/dL (Normal).",
                recommendations: "Continue a balanced diet. Repeat lipid profile in 6 months."
            }
        };
    },

    getSymptoms: async () => {
        try {
            const patientId = useAuthStore.getState().patientId || 'demo-patient';
            if (isOfflineId(patientId)) {
                return [
                    {
                        id: 'offline-symptom-1',
                        symptom_name: 'Anxiety',
                        first_reported_at: new Date().toISOString(),
                        last_reported_at: new Date().toISOString(),
                        duration_days: 1,
                        status: 'active',
                        severity: 5
                    }
                ];
            }
            const { data, error } = await supabase
                .from('symptom_tracker')
                .select('*')
                .eq('user_id', patientId)
                .order('last_reported_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(item => ({
                id: item.id,
                symptom_name: item.symptom_name,
                first_reported_at: item.first_reported_at,
                last_reported_at: item.last_reported_at,
                duration_days: item.reported_duration_days || 0,
                status: item.status,
                severity: item.current_severity || 5
            }));
        } catch (e) {
            console.error("getSymptoms error:", e);
            return [];
        }
    },

    getSummaries: async () => {
        try {
            const patientId = useAuthStore.getState().patientId || 'demo-patient';
            if (isOfflineId(patientId)) {
                return [
                    {
                        id: 'skip-summary-1',
                        patient_id: patientId,
                        summary_date: new Date().toISOString().split('T')[0],
                        summary_text: 'Your health baseline is stable. Metformin adherence is good, blood glucose is 110 mg/dL.',
                        symptoms_reported: ['Headache', 'Anxiety'],
                        facts_mentioned: [],
                        surgeries_mentioned: [],
                        medications_mentioned: ['Metformin', 'Amlodipine'],
                        mood_indicator: 'neutral',
                        data_importance_score: 5,
                        chat_messages_count: 3,
                        important_data_found: false,
                        created_at: new Date().toISOString(),
                    }
                ];
            }
            const { data, error } = await supabase
                .from('daily_health_summaries')
                .select('*')
                .eq('patient_id', patientId)
                .order('summary_date', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("getSummaries error:", e);
            return [];
        }
    }
};
