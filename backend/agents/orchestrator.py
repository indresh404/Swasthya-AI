"""
Swasthya Health Continuity Agent Orchestrator

Implements the unified agentic loop:
Perceive -> Understand -> Retrieve Context -> Route Specialized Agent ->
Execute Tools -> Deterministic Safety Check -> Take Action -> Update Health Memory -> Respond
"""

import time
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

from models.requests import AgentRequest
from models.responses import AgentResponse
from models.events import AgentTraceStep

from tools.neo4j_tools import GetPatientContextTool, GetRecentHealthEventsTool, UpdateHealthMemoryTool
from tools.supabase_tools import GetActiveMedicationsTool, CreateHealthEventTool, CreateFollowUpQuestionTool
from tools.openfda_tools import SearchMedicationInformationTool
from tools.notification_tools import CreateClinicianNotificationTool
from tools.appointment_tools import GetAppointmentsTool

from safety.rules import SafetyRuleEngine
from agents.checkin import CheckInAgent
from agents.medicine import MedicineAgent
from agents.escalation import EscalationAgent
from agents.doctor_qa import DoctorQAAgent
from agents.onboarding import OnboardingAgent

from services.groq_client import call_groq
from services.sarvam_service import SarvamService

UNDERSTANDING_PROMPT = """
You are the Swasthya Perception and Intent Understanding Model.
Analyze the incoming patient input and extract structured clinical intent.

Output valid JSON matching this schema:
{
  "intent": "symptom_report" | "medication_inquiry" | "doctor_question" | "general_checkin" | "onboarding",
  "symptoms": [{"name": "breathing difficulty", "severity": 7, "recurrence": true}],
  "medications": ["Amlodipine"],
  "temporal_context": "recurring" | "acute" | "routine",
  "urgency_hint": "low" | "medium" | "high"
}
"""

class SwasthyaHealthContinuityAgent:
    name = "swasthya-health-continuity-agent"

    @classmethod
    async def process(cls, request: AgentRequest) -> AgentResponse:
        trace_steps: List[AgentTraceStep] = []
        tools_used: List[str] = []
        context_used: List[str] = []
        actions: List[str] = []
        
        user_id = request.user_id
        message = request.message
        language = request.language or "en"
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        
        # ----------------------------------------------------
        # STEP 1: PERCEIVE & TRANSLATE (Sarvam Multilingual)
        # ----------------------------------------------------
        start_t = time.perf_counter()
        normalized_message = message
        # If Hindi or non-English input, translate via Sarvam if key exists
        if language == "hi" or any(char in message for char in ["क", "ख", "ग", "म", "स", "ह"]):
            try:
                normalized_message = await SarvamService.translate(message, source="hi-IN", target="en-US")
            except Exception as e:
                pass

        # ----------------------------------------------------
        # STEP 2: UNDERSTAND (Extract Intent & Structured Info)
        # ----------------------------------------------------
        perception = await cls._understand_input(normalized_message, language)
        trace_steps.append(AgentTraceStep(
            step="Perceive & Understand",
            agent=cls.name,
            explanation=f"Interpreted intent as '{perception['intent']}' with {len(perception.get('symptoms', []))} symptom(s) and temporal context '{perception.get('temporal_context')}'."
        ))

        # ----------------------------------------------------
        # STEP 3: RETRIEVE PATIENT MEMORY (Neo4j & Supabase)
        # ----------------------------------------------------
        context_tool = GetPatientContextTool()
        ctx_res = await context_tool.execute(patient_id=user_id)
        tools_used.append(context_tool.name)
        patient_chart = ctx_res.get("result", {})
        
        # Retrieve active medications
        meds_tool = GetActiveMedicationsTool()
        meds_res = await meds_tool.execute(patient_id=user_id)
        tools_used.append(meds_tool.name)
        active_medications = meds_res.get("result", [])
        
        # Extract meaningful context summaries
        if patient_chart.get("symptoms"):
            context_used.append("previous_symptoms_history")
        if any("breath" in str(s).lower() for s in patient_chart.get("symptoms", [])):
            context_used.append("previous_breathlessness_episode")
        if active_medications:
            context_used.append("active_medications")
        if patient_chart.get("conditions"):
            context_used.append("chronic_conditions_chart")

        trace_steps.append(AgentTraceStep(
            step="Retrieve Memory",
            agent=cls.name,
            tool=context_tool.name,
            explanation=f"Retrieved patient chart ({patient_chart.get('name', user_id)}, age {patient_chart.get('age', 'N/A')}) and {len(active_medications)} active medications from Neo4j & Supabase."
        ))

        # ----------------------------------------------------
        # STEP 4: ROUTE TO SPECIALIZED AGENT & REASON
        # ----------------------------------------------------
        intent = perception.get("intent", "symptom_report")
        agent_result = {}
        specialized_agent_name = ""

        if intent == "medication_inquiry" or len(perception.get("medications", [])) > 0 and len(perception.get("symptoms", [])) == 0:
            specialized_agent_name = MedicineAgent.name
            agent_result = await MedicineAgent.process(perception, {"medications": active_medications, "allergies": patient_chart.get("allergies", [])}, language)
            tools_used.append("search_medication_information")
        elif intent == "doctor_question":
            specialized_agent_name = DoctorQAAgent.name
            agent_result = await DoctorQAAgent.process(user_id, normalized_message, patient_chart)
        elif intent == "onboarding":
            specialized_agent_name = OnboardingAgent.name
            agent_result = await OnboardingAgent.process(1, normalized_message, {}, user_id)
        else:
            specialized_agent_name = CheckInAgent.name
            agent_result = await CheckInAgent.process(perception, patient_chart, language)

        trace_steps.append(AgentTraceStep(
            step="Specialized Agent Routing",
            agent=specialized_agent_name,
            explanation=f"Routed workflow to {specialized_agent_name} based on clinical perception."
        ))

        # ----------------------------------------------------
        # STEP 5: DETERMINISTIC SAFETY LAYER
        # ----------------------------------------------------
        safety_eval = SafetyRuleEngine.evaluate_escalation(
            extracted_symptoms=perception.get("symptoms", []),
            patient_conditions=[c.get("name") if isinstance(c, dict) else str(c) for c in patient_chart.get("conditions", [])],
            patient_age=int(patient_chart.get("age", 50)),
            message_text=normalized_message,
            previous_episodes=patient_chart.get("symptoms", []),
            active_medications=active_medications
        )
        tools_used.append("check_escalation_rules")

        trace_steps.append(AgentTraceStep(
            step="Deterministic Safety Check",
            agent="safety-rules-engine",
            explanation=f"Evaluated safety rules: Level '{safety_eval.escalation_level}'. Clinician review required = {safety_eval.requires_clinician_review}."
        ))

        # ----------------------------------------------------
        # STEP 6: ESCALATION & ACTIONS
        # ----------------------------------------------------
        if safety_eval.requires_clinician_review:
            esc_res = await EscalationAgent.process(user_id, perception, patient_chart, safety_eval)
            tools_used.append("create_clinician_notification")
            actions.append("clinician_notification_created")
            actions.append("follow_up_required")
            trace_steps.append(AgentTraceStep(
                step="Escalation Workflow",
                agent=EscalationAgent.name,
                explanation=f"Created high-priority notification for clinical staff ({'; '.join(safety_eval.reasons)})."
            ))
        else:
            actions.append("routine_monitoring_logged")

        # ----------------------------------------------------
        # STEP 7: UPDATE LONGITUDINAL HEALTH MEMORY (Neo4j)
        # ----------------------------------------------------
        update_tool = UpdateHealthMemoryTool()
        memory_updated = False
        if perception.get("symptoms") or intent in ["symptom_report", "general_checkin"]:
            upd_res = await update_tool.execute(
                patient_id=user_id,
                event_type="symptom_report",
                data={
                    "symptoms": perception.get("symptoms", []),
                    "summary": normalized_message,
                    "escalation_level": safety_eval.escalation_level
                }
            )
            tools_used.append(update_tool.name)
            actions.append("health_event_recorded")
            memory_updated = True

            # Persist audit record in Supabase
            event_tool = CreateHealthEventTool()
            await event_tool.execute(
                patient_id=user_id,
                event_type="symptom_checkin",
                data={"symptoms": perception.get("symptoms", []), "requires_review": safety_eval.requires_clinician_review},
                agent=cls.name
            )
            tools_used.append(event_tool.name)

            trace_steps.append(AgentTraceStep(
                step="Memory Update",
                agent=cls.name,
                tool=update_tool.name,
                explanation=f"Persisted health event and updated Neo4j graph nodes for patient {user_id}."
            ))

        # ----------------------------------------------------
        # STEP 8: FINAL RESPONSE FORMULATION & TRANSLATION
        # ----------------------------------------------------
        final_reply = agent_result.get("conversational_reply") or agent_result.get("answer") or "Your health update has been recorded in your continuity profile."
        
        # If user originally asked in Hindi, translate reply back
        if language == "hi" and final_reply:
            try:
                final_reply = await SarvamService.translate(final_reply, source="en-US", target="hi-IN")
            except Exception:
                pass

        # Deduplicate tools and context
        unique_tools = list(dict.fromkeys(tools_used))
        unique_context = list(dict.fromkeys(context_used))
        unique_actions = list(dict.fromkeys(actions))

        return AgentResponse(
            agent=cls.name,
            status="completed",
            response=final_reply,
            context_used=unique_context,
            tools_used=unique_tools,
            actions=unique_actions,
            memory_updated=memory_updated,
            requires_clinician_review=safety_eval.requires_clinician_review,
            trace=trace_steps,
            demo_mode=demo_mode
        )

    @classmethod
    async def _understand_input(cls, message: str, language: str) -> Dict[str, Any]:
        msg_lower = message.lower()
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        groq_api_key = os.getenv("GROQ_API_KEY", "")

        # Deterministic extraction logic
        symptoms = []
        is_recurring = any(w in msg_lower for w in ["again", "recurring", "still", "past few days", "returned"])
        
        if any(b in msg_lower for b in ["breath", "dyspnea", "shortness of breath", "breathing"]):
            symptoms.append({"name": "breathing difficulty", "severity": 7, "recurrence": is_recurring})
        if "chest pain" in msg_lower or "chest tightness" in msg_lower:
            symptoms.append({"name": "chest tightness", "severity": 6, "recurrence": is_recurring})
        if "fever" in msg_lower:
            symptoms.append({"name": "fever", "severity": 6, "recurrence": is_recurring})
        if "headache" in msg_lower:
            symptoms.append({"name": "headache", "severity": 5, "recurrence": is_recurring})

        medications = []
        for m in ["amlodipine", "telmisartan", "paracetamol", "aspirin", "metformin", "glycomet"]:
            if m in msg_lower:
                medications.append(m.capitalize())

        intent = "symptom_report"
        if "?" in message and any(q in msg_lower for q in ["what", "how", "when", "why", "who", "history", "episode", "chart"]):
            intent = "doctor_question" if any(w in msg_lower for w in ["patient", "episode", "recent", "chart"]) else "general_checkin"
        elif medications and not symptoms:
            intent = "medication_inquiry"

        # If Groq is available, enhance extraction
        if not demo_mode and groq_api_key:
            try:
                res_str = await call_groq(UNDERSTANDING_PROMPT, f"Input: \"{message}\"")
                res_json = json.loads(res_str)
                return {
                    "intent": res_json.get("intent", intent),
                    "symptoms": res_json.get("symptoms", symptoms),
                    "medications": res_json.get("medications", medications),
                    "temporal_context": res_json.get("temporal_context", "recurring" if is_recurring else "routine"),
                    "raw_message": message
                }
            except Exception as e:
                pass

        return {
            "intent": intent,
            "symptoms": symptoms,
            "medications": medications,
            "temporal_context": "recurring" if is_recurring else "routine",
            "raw_message": message
        }

async def run_health_continuity_agent(request: AgentRequest) -> AgentResponse:
    """Entrypoint function for the Swasthya Health Continuity Agent."""
    return await SwasthyaHealthContinuityAgent.process(request)
