from typing import Dict, Any, List
import json
import os
from services.groq_client import call_groq
from prompts.agents import ONBOARDING_PROMPT

class OnboardingAgent:
    name = "onboarding-agent"

    @classmethod
    async def process(cls, turn_number: int, message: str, session_state: Dict[str, Any], patient_id: str = "DEMO-P001") -> Dict[str, Any]:
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        groq_api_key = os.getenv("GROQ_API_KEY", "")

        if not demo_mode and groq_api_key:
            try:
                user_prompt = f"Session State: {json.dumps(session_state)}\nTurn: {turn_number}\nMessage: {message}"
                res_str = await call_groq(ONBOARDING_PROMPT, user_prompt)
                res_json = json.loads(res_str)
                return {
                    "agent": cls.name,
                    "patient_id": patient_id,
                    "turn_number": turn_number,
                    "entities_created": res_json.get("entities_created", []),
                    "missing_information": res_json.get("missing_information", []),
                    "next_question": res_json.get("next_question", "Do you have any known chronic conditions or daily medications?"),
                    "session_state": res_json.get("session_state", session_state)
                }
            except Exception as e:
                print(f"[OnboardingAgent] Groq error: {e}")

        # Deterministic onboarding flow
        return {
            "agent": cls.name,
            "patient_id": patient_id,
            "turn_number": turn_number,
            "entities_created": ["Demographics", "InitialProfile"],
            "missing_information": ["Daily Medications", "Emergency Contacts"] if turn_number == 1 else [],
            "next_question": "Thank you. Could you also share if you are currently taking any regular medications or have known drug allergies?",
            "session_state": {"step": turn_number + 1, "last_input": message}
        }
