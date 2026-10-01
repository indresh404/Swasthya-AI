"""
Swasthya Health Continuity Agent Orchestrator

Implements the unified agentic loop:
Perceive -> Understand -> Retrieve Context -> Route Specialized Agent ->
Execute Tools -> Deterministic Safety Check -> Take Action -> Update Health Memory -> Respond
"""

import time
import json
import os
import re
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

Standardize breathing problems to "breathing difficulty".
Detect temporal context: "recurrent" (if recurrence/again is indicated), "acute", or "routine".

Output valid JSON matching this schema:
{
  "intent": "symptom_report" | "medication_inquiry" | "doctor_question" | "general_checkin" | "onboarding",
  "symptoms": [{"name": "breathing difficulty", "severity": 7, "recurrence": true}],
  "medications": ["Amlodipine"],
  "temporal_context": "recurrent" | "acute" | "routine",
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
        normalized_message = message
        # If Hindi or non-English input, translate via Sarvam if key exists
        if language == "hi" or any(char in message for char in ["क", "ख", "ग", "म", "स", "ह"]):
            try:
                normalized_message = await SarvamService.translate(message, source="hi-IN", target="en-US")
            except Exception:
                pass

        # ----------------------------------------------------
        # STEP 2: UNDERSTAND (Extract Intent & Structured Info)
        # ----------------------------------------------------
        perception = await cls._understand_input(normalized_message, language)
        symptom_names = [s.get("name", "") for s in perception.get("symptoms", []) if isinstance(s, dict)]
        symptoms_str = ", ".join(f"'{name}'" for name in symptom_names) if symptom_names else "none"

        trace_steps.append(AgentTraceStep(
            step="Perceive & Understand",
            agent=cls.name,
            explanation=f"Interpreted intent as '{perception['intent']}' with symptom(s) [{symptoms_str}] and temporal context '{perception.get('temporal_context')}'."
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
        
        # Retrieve appointments if available
        apt_tool = GetAppointmentsTool()
        apt_res = await apt_tool.execute(patient_id=user_id)
        appointments = apt_res.get("result", [])

        # Build accurate, explicit context_used reporting
        # 1. Previous symptoms & episodes
        for s in patient_chart.get("symptoms", []):
            if isinstance(s, dict) and s.get("name"):
                date_str = s.get("date") or s.get("last_reported") or "previous episode"
                sev_str = f", severity {s['severity']}/10" if s.get("severity") else ""
                context_used.append(f"previous_symptom: {s['name']} ({date_str}{sev_str})")

        # 2. Chronic conditions
        for c in patient_chart.get("conditions", []):
            if isinstance(c, dict) and c.get("name"):
                status_str = f" ({c.get('status', 'active')})" if c.get("status") else ""
                context_used.append(f"chronic_condition: {c['name']}{status_str}")
            elif isinstance(c, str) and c:
                context_used.append(f"chronic_condition: {c}")

        # 3. Active medications
        for m in active_medications:
            if isinstance(m, dict):
                m_name = m.get("medicine_name") or m.get("name") or "Medication"
                dosage = f" {m['dosage']}" if m.get("dosage") else ""
                freq = f" ({m['frequency']})" if m.get("frequency") else ""
                context_used.append(f"active_medication: {m_name}{dosage}{freq}")

        # 4. Allergies
        for a in patient_chart.get("allergies", []):
            if isinstance(a, dict) and a.get("name"):
                sev = f" ({a['severity']} severity)" if a.get("severity") else ""
                context_used.append(f"allergy: {a['name']}{sev}")

        # 5. Family history
        for fam in patient_chart.get("family_history", []):
            if fam:
                context_used.append(f"family_history: {fam}")

        # 6. Appointments
        for apt in appointments:
            if isinstance(apt, dict) and apt.get("doctor"):
                context_used.append(f"appointment: {apt.get('doctor')} ({apt.get('specialty', '')}, {apt.get('date', '')})")

        patient_name = patient_chart.get("name", user_id)
        patient_age = patient_chart.get("age", "N/A")
        trace_steps.append(AgentTraceStep(
            step="Retrieve Memory",
            agent=cls.name,
            tool=context_tool.name,
            explanation=f"Retrieved longitudinal health chart for {patient_name} (age {patient_age}) from Neo4j & Supabase with {len(patient_chart.get('symptoms', []))} previous symptom record(s), {len(patient_chart.get('conditions', []))} condition(s), and {len(active_medications)} active medication(s)."
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

        triggered_rule_str = ", ".join(safety_eval.triggered_rules) if safety_eval.triggered_rules else "STANDARD_MONITORING"
        trace_steps.append(AgentTraceStep(
            step="Deterministic Safety Check",
            agent="safety-rules-engine",
            explanation=f"Evaluated safety rules: Level '{safety_eval.escalation_level}' ({triggered_rule_str}). Clinician review required = {safety_eval.requires_clinician_review}."
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
        msg_lower = message.lower().strip()
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        groq_api_key = os.getenv("GROQ_API_KEY", "")

        # 1. Detect Recurrence / Temporal Context
        recurrence_patterns = [
            r"\bagain\b", r"\brecurr(ing|ent)?\b", r"\bstill\b", r"\breturned\b",
            r"\bcame back\b", r"\bpast few days\b", r"\bfor days\b", r"\bworsening\b",
            r"\bgetting worse\b", r"\bfrequent(ly)?\b", r"\brepeated(ly)?\b"
        ]
        is_recurring = any(re.search(pattern, msg_lower) for pattern in recurrence_patterns)
        temporal_context = "recurrent" if is_recurring else "acute"

        # 2. Extract and Normalize Symptoms Robustly
        symptoms = []

        # Breathing difficulty patterns
        breathing_patterns = [
            r"\bbreathing difficulty\b",
            r"\bdifficulty breathing\b",
            r"\bshortness of breath\b",
            r"\bshort of breath\b",
            r"\bbreathlessness\b",
            r"\bbreathless\b",
            r"\btrouble breathing\b",
            r"\bhard to breathe\b",
            r"\bcan'?t breathe\b",
            r"\bcannot breathe\b",
            r"\bgasping for air\b",
            r"\bdyspnea\b",
            r"\bdyspnoea\b",
            r"\brespiratory distress\b"
        ]
        if any(re.search(p, msg_lower) for p in breathing_patterns):
            symptoms.append({
                "name": "breathing difficulty",
                "severity": 7,
                "recurrence": is_recurring
            })

        # Chest discomfort / pain patterns
        chest_patterns = [
            (r"\bchest pain\b", "chest pain", 7),
            (r"\bchest tightness\b|\btightness in (my )?chest\b", "chest tightness", 6),
            (r"\bchest pressure\b|\bchest discomfort\b", "chest discomfort", 6)
        ]
        for pattern, sym_name, default_sev in chest_patterns:
            if re.search(pattern, msg_lower):
                symptoms.append({
                    "name": sym_name,
                    "severity": default_sev,
                    "recurrence": is_recurring
                })

        # Fever patterns
        if re.search(r"\bfever\b|\bhigh fever\b|\bfeverish\b|\btemperature\b", msg_lower):
            symptoms.append({"name": "fever", "severity": 6, "recurrence": is_recurring})

        # Headache patterns
        if re.search(r"\bheadache\b|\bmigraine\b|\bhead pain\b", msg_lower):
            symptoms.append({"name": "headache", "severity": 5, "recurrence": is_recurring})

        # Cough patterns
        if re.search(r"\bcough(ing)?\b|\bdry cough\b", msg_lower):
            symptoms.append({"name": "cough", "severity": 4, "recurrence": is_recurring})

        # Dizziness patterns
        if re.search(r"\bdizz(y|iness)\b|\blightheaded(ness)?\b", msg_lower):
            symptoms.append({"name": "dizziness", "severity": 5, "recurrence": is_recurring})

        # 3. Extract Medication Mentions
        medications = []
        med_keywords = ["amlodipine", "telmisartan", "paracetamol", "aspirin", "metformin", "glycomet", "dolo", "amoxicillin", "atorvastatin"]
        for m in med_keywords:
            if re.search(rf"\b{m}\b", msg_lower):
                medications.append(m.capitalize())

        # 4. Determine Intent
        intent = "symptom_report"
        if "?" in message and any(q in msg_lower for q in ["what", "how", "when", "why", "who", "history", "episode", "chart", "records"]):
            if any(w in msg_lower for w in ["patient", "episode", "recent", "chart", "records", "breathing"]):
                intent = "doctor_question"
            else:
                intent = "general_checkin"
        elif medications and not symptoms:
            intent = "medication_inquiry"
        elif any(w in msg_lower for w in ["onboard", "register", "my name is"]):
            intent = "onboarding"

        # If Groq is configured and active, enhance structured extraction
        if not demo_mode and groq_api_key and not groq_api_key.startswith("gsk_your"):
            try:
                res_str = await call_groq(UNDERSTANDING_PROMPT, f"Input: \"{message}\"")
                res_json = json.loads(res_str)
                llm_intent = res_json.get("intent")
                llm_symptoms = res_json.get("symptoms")
                llm_temp = res_json.get("temporal_context")
                return {
                    "intent": llm_intent or intent,
                    "symptoms": llm_symptoms or symptoms,
                    "medications": res_json.get("medications", medications),
                    "temporal_context": llm_temp or temporal_context,
                    "raw_message": message
                }
            except Exception:
                pass

        return {
            "intent": intent,
            "symptoms": symptoms,
            "medications": medications,
            "temporal_context": temporal_context,
            "raw_message": message
        }

async def run_health_continuity_agent(request: AgentRequest) -> AgentResponse:
    """Entrypoint function for the Swasthya Health Continuity Agent."""
    return await SwasthyaHealthContinuityAgent.process(request)
