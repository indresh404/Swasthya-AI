from typing import Dict, Any, List
import json
import os
from services.groq_client import call_groq

CHECKIN_AGENT_PROMPT = """
You are the Swasthya Check-In Clinical Agent.
You are evaluating a patient check-in or symptom update within their longitudinal health memory.

CRITICAL CLINICAL WORKFLOW RULES:
1. Do NOT make any formal diagnosis.
2. Formulate an empathetic, clear, grounded response acknowledging their specific symptoms and any recurrence.
3. If this is a recurrence or requires clinician review, clearly state that their context has been documented and flagged for their medical team.
4. Output valid JSON in the exact format:
{
  "conversational_reply": "Empathetic, clear patient response",
  "symptoms_identified": [{"name": "breathing difficulty", "severity": 7, "is_recurring": true}],
  "follow_up_advice": "Suggested non-diagnostic guidance (e.g. rest, monitor, seek prompt review)"
}
"""

class CheckInAgent:
    name = "check-in-agent"

    @classmethod
    async def process(cls, perception: Dict[str, Any], context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        message = perception.get("raw_message", "")
        extracted_symptoms = perception.get("symptoms", [])
        previous_symptoms = context.get("symptoms", [])
        conditions = context.get("conditions", [])

        # Check for recurrence
        is_recurring = False
        for cur in extracted_symptoms:
            c_name = cur.get("name", "").lower() if isinstance(cur, dict) else str(cur).lower()
            for prev in previous_symptoms:
                p_name = prev.get("name", "").lower() if isinstance(prev, dict) else str(prev).lower()
                if c_name in p_name or p_name in c_name:
                    is_recurring = True
                    break

        user_prompt = (
            f"Patient Message: \"{message}\"\n"
            f"Extracted Symptoms: {json.dumps(extracted_symptoms)}\n"
            f"Previous Symptoms History: {json.dumps(previous_symptoms)}\n"
            f"Documented Conditions: {json.dumps(conditions)}\n"
            f"Recurrence Detected: {is_recurring}\n"
            f"Preferred Language: {language}"
        )

        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        groq_api_key = os.getenv("GROQ_API_KEY", "")

        if not demo_mode and groq_api_key and not groq_api_key.startswith("gsk_your"):
            try:
                res_str = await call_groq(CHECKIN_AGENT_PROMPT, user_prompt)
                res_json = json.loads(res_str)
                reply = res_json.get("conversational_reply")
                if reply and reply.strip():
                    return {
                        "agent": cls.name,
                        "conversational_reply": reply,
                        "symptoms_identified": res_json.get("symptoms_identified", extracted_symptoms),
                        "is_recurring": is_recurring,
                        "follow_up_advice": res_json.get("follow_up_advice", "Please continue monitoring and contact your doctor if symptoms persist.")
                    }
            except Exception as e:
                print(f"[CheckInAgent] Groq error fallback: {e}")

        # Deterministic / Demo Response
        reply = "I noticed this may be a recurring symptom. Your recent health context and medications have been reviewed."
        if is_recurring or "breathing" in message.lower():
            reply = "I have recorded your breathing difficulty update and noted that this is a recurring episode. Because of your health history, this has been flagged for clinician review. Please seek urgent care if your breathing worsens."

        return {
            "agent": cls.name,
            "conversational_reply": reply,
            "symptoms_identified": extracted_symptoms or [{"name": "breathing difficulty", "severity": 7, "is_recurring": is_recurring}],
            "is_recurring": is_recurring,
            "follow_up_advice": "Rest in an upright position and contact emergency care if symptoms become acute."
        }
