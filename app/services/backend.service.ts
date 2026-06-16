// app/services/backend.service.ts
import { API_ENDPOINTS } from '@/config/api';

// Helper to delay response for realistic UI loading states
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const backendService = {
    // Jan Aushadhi Stores
    getNearestStores: async (lat: number, lon: number) => {
        await delay(1000);
        return {
            status: 'success',
            stores: [
                {
                    id: 'store-1',
                    store_name: 'Jan Aushadhi Kendra - Sector 15',
                    latitude: lat + 0.005,
                    longitude: lon + 0.005,
                    area: 'Sector 15, Vashi',
                    distance_km: '0.6'
                },
                {
                    id: 'store-2',
                    store_name: 'Pradhan Mantri Bhartiya Janaushadhi Kendra',
                    latitude: lat - 0.007,
                    longitude: lon - 0.003,
                    area: 'Koparkhairane',
                    distance_km: '1.2'
                },
                {
                    id: 'store-3',
                    store_name: 'Janaushadhi Kendra - CBD Belapur',
                    latitude: lat + 0.012,
                    longitude: lon - 0.008,
                    area: 'Belapur Station Complex',
                    distance_km: '2.5'
                }
            ]
        };
    },

    // Chat End Session
    endSession: async (patientId: string, log: any[], existingSummary: string) => {
        await delay(1500);
        return {
            daily_summary: "Overall stable condition. Active monitor shows mild heart rate elevation after climbing stairs, which normalized quickly. Recommended to maintain hydration and consistent medication intake.",
            urgency: "Normal",
            key_risks: "None detected",
            symptoms_today: [] as string[]
        };
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
        await delay(1000);
        let bot_reply = "I'm your AI health assistant. Everything is running in offline demo mode. Let me know how I can assist you with your medications, health tracking, or symptoms!";
        
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('heart') || lowerMsg.includes('bp') || lowerMsg.includes('pulse')) {
            bot_reply = "Your heart rate and blood pressure trends appear stable based on latest entries. If you notice any sudden chest pain, shortness of breath, or dizziness, please consult a physician immediately.";
        } else if (lowerMsg.includes('med') || lowerMsg.includes('pill') || lowerMsg.includes('drug') || lowerMsg.includes('alternative')) {
            bot_reply = "Remember to take your medications on schedule. You can check for generic alternatives at local Jan Aushadhi Kendras to save up to 80% on brand prescriptions.";
        } else if (lowerMsg.includes('risk') || lowerMsg.includes('score')) {
            bot_reply = "Your health risk profile is classified as Moderate risk. To improve your score, focus on regular cardiovascular workouts, diet tracking, and consistent sleep cycles.";
        }
        
        return {
            bot_reply,
            extracted_symptom: null,
            clarification_needed: false,
            save_ready: false,
            confirmation_required: false,
            session_updated: false
        };
    },

    // Medical Report Extraction
    extractReport: async (fileUri: string, fileName: string, fileType: string) => {
        await delay(2000);
        return {
            success: true,
            data: {
                patient_name: "Rahul Kumar",
                report_date: "2026-06-10",
                key_findings: "Normal lipid profile. Hemoglobin: 14.5 g/dL (Normal). Blood Glucose (Fasting): 98 mg/dL (Normal).",
                recommendations: "Continue a balanced diet. Repeat lipid profile in 6 months."
            }
        };
    }
};
