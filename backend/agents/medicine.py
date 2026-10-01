from typing import Dict, Any, List
import json
import os
from services.groq_client import call_groq
from tools.openfda_tools import SearchMedicationInformationTool
from safety.rules import SafetyRuleEngine

MEDICINE_AGENT_PROMPT = """
You are the Swasthya Medicine Specialist Agent.
You assist patients with medication information, adherence tracking, and potential interaction warnings.

RULES:
1. Ground all replies strictly in the patient's active medication list and official FDA warning data provided.
2. NEVER invent non-existent drug contraindications or dosages.
3. If an interaction or allergy risk exists, clearly explain it in simple, calm, clinical language.
4. Output valid JSON in the exact format:
{
  "conversational_reply": "Clear, grounded explanation for the patient",
  "conflict_detected": false,
  "warnings": ["Warning 1"],
  "adherence_noted": true
}
"""

class MedicineAgent:
    name = "medicine-agent"

    @classmethod
    async def process(cls, perception: Dict[str, Any], context: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        message = perception.get("raw_message", "")
        medications_mentioned = perception.get("medications", [])
        active_meds = context.get("medications", [])
        allergies = context.get("allergies", [])
        
        # Tools lookup
        fda_tool = SearchMedicationInformationTool()
        fda_results = []
        for med in medications_mentioned:
            med_name = med.get("name") if isinstance(med, dict) else str(med)
            res = await fda_tool.execute(drug_name=med_name)
            if res.get("status") == "success":
                fda_results.append(res.get("result"))

        # Deterministic Safety Verification
        safety_check = {"conflict_found": False, "conflicts": []}
        for med in medications_mentioned:
            med_name = med.get("name") if isinstance(med, dict) else str(med)
            chk = SafetyRuleEngine.evaluate_medication_interaction(med_name, active_meds, allergies)
            if chk.get("conflict_found"):
                safety_check["conflict_found"] = True
                safety_check["conflicts"].extend(chk.get("conflicts", []))

        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        groq_api_key = os.getenv("GROQ_API_KEY", "")

        if not demo_mode and groq_api_key:
            try:
                user_prompt = (
                    f"Patient Query: \"{message}\"\n"
                    f"Active Medications in Chart: {json.dumps(active_meds)}\n"
                    f"Mentioned Medicines: {json.dumps(medications_mentioned)}\n"
                    f"FDA Tool Output: {json.dumps(fda_results)}\n"
                    f"Safety Rule Evaluation: {json.dumps(safety_check)}"
                )
                res_str = await call_groq(MEDICINE_AGENT_PROMPT, user_prompt)
                res_json = json.loads(res_str)
                return {
                    "agent": cls.name,
                    "conversational_reply": res_json.get("conversational_reply", ""),
                    "conflict_detected": safety_check["conflict_found"] or res_json.get("conflict_detected", False),
                    "warnings": safety_check["conflicts"] or res_json.get("warnings", []),
                    "fda_data": fda_results
                }
            except Exception as e:
                print(f"[MedicineAgent] Groq error fallback: {e}")

        # Deterministic fallback
        active_names = [m.get("name") or m.get("medicine_name") for m in active_meds if isinstance(m, dict)]
        reply = f"Your current active medications on file are: {', '.join(active_names) if active_names else 'Amlodipine 5mg, Telmisartan 40mg'}. Please take them exactly as prescribed by your doctor."
        if safety_check["conflict_found"]:
            reply = f"Warning: Potential medication conflict detected: {'; '.join(safety_check['conflicts'])}. Please consult your physician before taking this medication."

        return {
            "agent": cls.name,
            "conversational_reply": reply,
            "conflict_detected": safety_check["conflict_found"],
            "warnings": safety_check["conflicts"],
            "fda_data": fda_results
        }
