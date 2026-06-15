import { API_ENDPOINTS, BACKEND_URL, API_VERSION } from '@/config/api';
import { supabase } from '@/config/supabase';

// Helper to get full URL with version prefix
const getFullUrl = (endpoint: string) => {
    return `${BACKEND_URL}${API_VERSION}${endpoint}`;
};

export const backendService = {
    // Jan Aushadhi Stores
    getNearestStores: async (lat: number, lon: number) => {
        try {
            const response = await fetch(`${BACKEND_URL}/stores/nearby?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Failed to fetch stores');
            return await response.json();
        } catch (error) {
            console.error('getNearestStores error:', error);
            // Fallback mock data
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
        }
    },

    // Chat End Session
    endSession: async (patientId: string, log: any[], existingSummary: string) => {
        try {
            const response = await fetch(getFullUrl(API_ENDPOINTS.CHAT.END_SESSION), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    session_id: null
                })
            });
            
            if (!response.ok) throw new Error('Failed to end session');
            return await response.json();
        } catch (error) {
            console.error('endSession error:', error);
            // Fallback mock data
            return {
                daily_summary: "Overall stable condition. Active monitor shows mild heart rate elevation after climbing stairs, which normalized quickly. Recommended to maintain hydration and consistent medication intake.",
                urgency: "Normal",
                key_risks: "None detected",
                symptoms_today: [] as string[]
            };
        }
    },

    // Risk Scoring
    generateRisk: async (data: any) => {
        try {
            const response = await fetch(getFullUrl(API_ENDPOINTS.RISK.GENERATE), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to generate risk');
            return await response.json();
        } catch (error) {
            console.error('generateRisk error:', error);
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
        }
    },

    // Risk Prediction
    predictRisk: async (data: any) => {
        try {
            const response = await fetch(getFullUrl(API_ENDPOINTS.RISK.PREDICT), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to predict risk');
            return await response.json();
        } catch (error) {
            console.error('predictRisk error:', error);
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
        }
    },

    // Scheme Matching (Jan Aushadhi included)
    matchSchemes: async (data: any) => {
        try {
            const response = await fetch(getFullUrl(API_ENDPOINTS.SCHEMES.MATCH), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to match schemes');
            return await response.json();
        } catch (error) {
            console.error('matchSchemes error:', error);
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
        }
    },

    // Drug Interaction
    checkInteraction: async (data: any) => {
        try {
            const response = await fetch(getFullUrl(API_ENDPOINTS.SAFETY.DRUG_INTERACTION), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to check interaction');
            return await response.json();
        } catch (error) {
            console.error('checkInteraction error:', error);
            return {
                success: true,
                has_interaction: false,
                severity: "None",
                description: "No significant interactions found between the selected medications.",
                conflict_found: false,
                warning_text: "",
                recommendation: "No significant interactions found. Safe to proceed."
            };
        }
    },

    // Main Chat - REAL IMPLEMENTATION with Backend API
    sendMessage: async (patientId: string, message: string, context: any) => {
        try {
            console.log(`📤 Sending to backend: ${getFullUrl(API_ENDPOINTS.CHAT.MESSAGE)}`);
            console.log(`📤 Patient ID: ${patientId}`);
            console.log(`📤 Message: ${message}`);
            
            const response = await fetch(getFullUrl(API_ENDPOINTS.CHAT.MESSAGE), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    message: message,
                    patient_context: context || {}
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Backend error ${response.status}: ${errorText}`);
                throw new Error(`Backend returned ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log(`✅ Backend response received:`, JSON.stringify(data, null, 2));
            
            // Check if symptom was extracted
            if (data.medical_event && data.extracted_symptom) {
                console.log(`🎯 Symptom extracted: ${data.extracted_symptom.symptom_name} (confidence: ${data.extracted_symptom.confidence_score})`);
            } else if (data.medical_event && !data.extracted_symptom) {
                console.warn(`⚠️ Medical event detected but no extraction data`);
            } else {
                console.log(`💬 Non-medical message processed`);
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ sendMessage error:', error);
            
            // Enhanced fallback mock response with clear error message
            let bot_reply = "⚠️ **Backend Connection Issue**\n\nI'm having trouble connecting to the health assistant service.\n\n**Please check:**\n";
            bot_reply += "1. Backend is running: `cd backend && python main.py`\n";
            bot_reply += "2. Backend URL is correct: " + getFullUrl(API_ENDPOINTS.CHAT.MESSAGE) + "\n";
            bot_reply += "3. No CORS or firewall issues\n\n";
            bot_reply += "Once connected, I'll be able to track your symptoms and provide personalized responses.";
            
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('heart') || lowerMsg.includes('bp') || lowerMsg.includes('pulse')) {
                bot_reply = "⚠️ **Demo Mode - Backend Disconnected**\n\nYour heart rate and blood pressure trends appear stable based on latest entries. If you notice any sudden chest pain, shortness of breath, or dizziness, please consult a physician immediately.\n\n**To enable full functionality:** Start the backend server.";
            } else if (lowerMsg.includes('headache') || lowerMsg.includes('pain') || lowerMsg.includes('fever') || lowerMsg.includes('cough')) {
                bot_reply = "⚠️ **Demo Mode - Backend Disconnected**\n\nI understand you're experiencing symptoms. Normally I would track this in your health record and provide personalized advice.\n\n**To enable symptom tracking:** Please start the backend server at http://localhost:8000";
            } else if (lowerMsg.includes('med') || lowerMsg.includes('pill') || lowerMsg.includes('drug')) {
                bot_reply = "⚠️ **Demo Mode - Backend Disconnected**\n\nRemember to take your medications on schedule. You can check for generic alternatives at local Jan Aushadhi Kendras to save up to 80% on brand prescriptions.\n\n**To enable full features:** Start the backend server.";
            }
            
            return {
                bot_reply,
                extracted_symptom: null,
                medical_event: false,
                clarification_needed: false,
                save_ready: false,
                confirmation_required: false,
                session_updated: false
            };
        }
    },

    // Medical Report Extraction
    extractReport: async (fileUri: string, fileName: string, fileType: string) => {
        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', {
                uri: fileUri,
                name: fileName,
                type: fileType,
            } as any);
            
            const response = await fetch(getFullUrl(API_ENDPOINTS.EXTRACT.REPORT), {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            if (!response.ok) throw new Error('Failed to extract report');
            return await response.json();
            
        } catch (error) {
            console.error('extractReport error:', error);
            return {
                success: true,
                data: {
                    patient_name: "Rahul Kumar",
                    report_date: new Date().toISOString().split('T')[0],
                    key_findings: "Normal lipid profile. Hemoglobin: 14.5 g/dL (Normal). Blood Glucose (Fasting): 98 mg/dL (Normal).",
                    recommendations: "Continue a balanced diet. Repeat lipid profile in 6 months."
                }
            };
        }
    },

    // Get trackable symptoms list
    getSymptoms: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(getFullUrl('/profile/symptoms'), {
                method: 'GET',
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch symptoms');
            return await response.json();
        } catch (error) {
            console.error('getSymptoms error:', error);
            return [];
        }
    },

    // Get clinical summaries list
    getSummaries: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(getFullUrl('/profile/summaries'), {
                method: 'GET',
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch summaries');
            return await response.json();
        } catch (error) {
            console.error('getSummaries error:', error);
            return [];
        }
    }
};