import os
import json
import httpx
from dotenv import load_dotenv
from services.sarvam_service import SarvamService

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
# Default model
GROQ_MODEL = "llama-3.1-8b-instant"


class LLMService:
    @staticmethod
    def get_headers():
        return {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

    @classmethod
    async def extract_medical_info(cls, user_message: str) -> dict:
        """
        Sends the user message to Groq using the Master System Prompt in JSON Mode.
        Integrates Sarvam AI translation: translates Hindi queries to English before Groq extraction,
        and translates the final reply back to Hindi.
        """
        # Simple check for Hindi Unicode characters
        is_hindi = any(char in user_message for char in ["क", "ख", "ग", "म", "स", "ह"])

        # Translate Hindi message to English first to ensure precise Groq symptom extraction
        english_message = user_message
        if is_hindi:
            try:
                english_message = await SarvamService.translate(user_message, source="hi-IN", target="en-US")
                print(f"[LLMService] Translated input: '{user_message}' -> '{english_message}'")
            except Exception as e:
                print(f"[LLMService] Sarvam input translation failed: {e}")

        if not GROQ_API_KEY or GROQ_API_KEY.strip() == "":
            print("[LLMService] GROQ_API_KEY not set. Using mock extraction fallback.")
            return cls._mock_message_extraction(user_message)

        # Combined conversational response & clinical extraction prompt
        system_prompt = (
            "You are Swasthya AI's Clinical Assistant.\n\n"
            "Responsibilities:\n"
            "1. Answer user queries conversationally in English. Provide supportive, clear, and empathetic clinical chatbot responses.\n"
            "2. Never diagnose specific diseases or prescribe treatments. Advise consultation with a doctor when appropriate.\n"
            "3. Identify if the message contains clinical details (symptoms, medications, allergies, chronic diseases, family history, etc.).\n"
            "4. Extract structured medical info if present.\n\n"
            "You MUST output a single valid JSON object matching the following schema:\n"
            "{\n"
            "  \"conversational_response\": \"Your conversational reply to the patient, in English.\",\n"
            "  \"is_medical\": true/false,\n"
            "  \"symptoms\": [\"Standardized symptom name(s) in English (e.g. headache, fever, nausea, chest pain) or empty array\"],\n"
            "  \"medications\": [\"list\", \"of\", \"meds\"],\n"
            "  \"allergies\": [\"list\", \"of\", \"allergies\"],\n"
            "  \"severity\": \"mild, moderate, severe, or null\",\n"
            "  \"resolved\": true/false,\n"
            "  \"duration_days\": integer representing duration in days or null\n"
            "}\n\n"
            "CRITICAL RULES:\n"
            "1. Set is_medical = true if the user mentions symptoms, medications, allergies, chronic diseases, or medical history.\n"
            "2. If is_medical is false, set symptoms, medications, and allergies to empty arrays, severity and duration_days to null, and resolved to false.\n"
            "3. Parse durations (e.g. '3 days' -> duration_days = 3; 'since yesterday' -> duration_days = 1; 'two weeks' -> duration_days = 14).\n"
            "4. If symptoms are mentioned as resolved, or 'gone', 'fine', 'cured', set resolved to true.\n"
            "5. Do not diagnose; just describe symptoms reported.\n"
            "6. ALWAYS include all keys - never omit them.\n"
        )

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": english_message}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(GROQ_URL, headers=cls.get_headers(), json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    content_json = json.loads(content)
                    
                    # Fix properties fallback if omitted
                    for key in ["symptoms", "medications", "allergies"]:
                        if key not in content_json:
                            content_json[key] = []
                    if "is_medical" not in content_json:
                        content_json["is_medical"] = False
                    if "resolved" not in content_json:
                        content_json["resolved"] = False
                    if "severity" not in content_json:
                        content_json["severity"] = None
                    if "duration_days" not in content_json:
                        content_json["duration_days"] = None

                    # If the user spoke Hindi originally, translate the English reply back to Hindi
                    if is_hindi:
                        eng_reply = content_json.get("conversational_response", "")
                        if eng_reply:
                            try:
                                hindi_reply = await SarvamService.translate(eng_reply, source="en-US", target="hi-IN")
                                content_json["conversational_response"] = hindi_reply
                                print(f"[LLMService] Translated output: '{eng_reply}' -> '{hindi_reply}'")
                            except Exception as e:
                                print(f"[LLMService] Sarvam output translation failed: {e}")
                    
                    # Debug print
                    print(f"[LLMService] Final JSON response: {json.dumps(content_json, indent=2)}")
                    return content_json
                else:
                    print(f"[LLMService] Groq API returned status {res.status_code}: {res.text}")
                    return cls._mock_message_extraction(user_message)
        except Exception as e:
            print(f"[LLMService] Error invoking Groq completions: {e}")
            return cls._mock_message_extraction(user_message)

    @classmethod
    async def generate_clinical_summary(cls, chat_events: list, active_symptoms: list) -> str:
        """
        Generates a concise daily health summary using a list of chat event dictionaries.
        """
        if not GROQ_API_KEY or GROQ_API_KEY.strip() == "":
            print("[LLMService] GROQ_API_KEY not set. Using mock summary fallback.")
            return cls._mock_summary(chat_events, active_symptoms)

        history_str = "\n".join([
            f"{'Patient' if e.get('is_user') else 'Assistant'}: {e.get('message')}"
            for e in chat_events
        ])
        symptoms_str = ", ".join([
            f"{s['symptom_name']} (Severity: {s.get('current_severity') or s.get('severity') or 'N/A'}, Duration: {s.get('reported_duration_days') or s.get('duration_days') or 'N/A'} days)"
            for s in active_symptoms
        ])

        system_prompt = (
            "You are a clinical summarization assistant.\n"
            "Generate a concise clinical summary from the recent chat history and active symptoms log.\n"
            "Include:\n"
            "- Active symptoms & durations\n"
            "- New symptoms reported in this block\n"
            "- Resolved symptoms mentioned\n"
            "- Severity changes\n\n"
            "Constraints: Max 150 words. Write in a formal, clinical, objective third-person tone (e.g. 'Patient reports...')."
        )

        user_content = (
            f"Active Symptoms Log:\n{symptoms_str or 'None active'}\n\n"
            f"Chat History:\n{history_str or 'No chats today'}"
        )

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.3
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(GROQ_URL, headers=cls.get_headers(), json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    return cls._mock_summary(chat_events, active_symptoms)
        except Exception as e:
            print(f"[LLMService] Summary extraction failed: {e}")
            return cls._mock_summary(chat_events, active_symptoms)

    @staticmethod
    def _mock_message_extraction(msg: str) -> dict:
        """
        Robust mock extractor to keep backend functional without API keys.
        Supports both Hindi and English mock responses.
        """
        lower = msg.lower()
        is_hindi = any(char in msg for char in ["क", "ख", "ग", "म", "स", "ह"])
        
        conversational = (
            "नमस्ते! मैंने आपके लक्षण नोट कर लिए हैं। कृपया अपनी सेहत का ध्यान रखें और कोई समस्या होने पर डॉक्टर से परामर्श करें।"
            if is_hindi else
            "Hello! I have noted your symptoms. Please take care, monitor your vitals, and consult a doctor if severe."
        )
        
        res_json = {
            "conversational_response": conversational,
            "is_medical": False,
            "symptoms": [],
            "medications": [],
            "allergies": [],
            "severity": None,
            "resolved": False,
            "duration_days": None
        }

        # Check for headache / सिरदर्द
        if "headache" in lower or "head" in lower or "सिरदर्द" in lower or "सिर दर्द" in lower:
            res_json["conversational_response"] = (
                "सिरदर्द के बारे में बताने के लिए धन्यवाद। क्या यह सिरदर्द तनाव, नींद की कमी या रक्तचाप के उतार-चढ़ाव से संबंधित हो सकता है?"
                if is_hindi else
                "Thank you for reporting the headache. Headaches can sometimes be linked to screen usage, dehydration, or blood pressure changes."
            )
            res_json["is_medical"] = True
            res_json["symptoms"] = ["headache"]
            res_json["severity"] = "moderate"
            
            # Simple duration parser
            duration = 1
            if "3" in msg or "तीन" in msg:
                duration = 3
            elif "2" in msg or "दो" in msg:
                duration = 2
            elif "14" in msg or "10" in msg:
                duration = 14
            res_json["duration_days"] = duration
        
        # Check for chest pain / छाती में दर्द
        elif "chest" in lower or "छाती" in lower or "घबराहट" in lower:
            res_json["conversational_response"] = (
                "🚨 छाती में दर्द या असहजता एक गंभीर लक्षण हो सकता है। कृपया तुरंत आराम करें और यदि दर्द बढ़े तो डॉक्टर से संपर्क करें।"
                if is_hindi else
                "🚨 Chest pain or discomfort is a critical symptom. Please rest immediately and seek emergency medical assistance if it worsens."
            )
            res_json["is_medical"] = True
            res_json["symptoms"] = ["chest pain"]
            res_json["severity"] = "severe"
            res_json["duration_days"] = 1

        # Check for symptom resolution
        elif "gone" in lower or "fine" in lower or "ठीक" in lower or "चला गया" in lower or "दूर" in lower:
            res_json["conversational_response"] = (
                "यह जानकर बहुत खुशी हुई कि आपका लक्षण ठीक हो गया है! मैं इसे आपके रिकॉर्ड में दर्ज कर रहा हूँ।"
                if is_hindi else
                "It is great to hear that your symptoms have resolved! I am logging this in your health history tracker."
            )
            res_json["is_medical"] = True
            res_json["symptoms"] = ["headache"]
            res_json["resolved"] = True

        return res_json

    @staticmethod
    def _mock_summary(chat_events: list, active_symptoms: list) -> str:
        symptoms_logged = [s["symptom_name"] for s in active_symptoms] if active_symptoms else ["none"]
        return (
            f"Patient checked in and discussed symptoms today. Active symptoms recorded: {', '.join(symptoms_logged)}. "
            "Condition appears stable overall. Adherence to daily prescription was recommended."
        )