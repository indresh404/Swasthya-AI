"""
Deterministic Clinical Safety & Escalation Rules Layer

This module provides transparent, deterministic, rule-based safety evaluation
for clinical risk flagging and triage. It explicitly avoids relying solely on
non-deterministic LLM generations for patient safety decisions.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SafetyEvaluationResult(BaseModel):
    requires_clinician_review: bool
    escalation_level: str  # "ROUTINE", "MONITORING", "SEEK_CARE", "URGENT_EVALUATION", "EMERGENCY"
    triggered_rules: List[str]
    reasons: List[str]
    suggested_actions: List[str]
    is_safe_for_automated_reply: bool

class SafetyRuleEngine:
    """
    Pure Python Deterministic Safety Rules Engine
    """
    
    CRITICAL_SYMPTOMS = {
        "chest pain", "chest tightness", "breathing difficulty", "shortness of breath", 
        "dyspnea", "breathlessness", "loss of consciousness", "severe dizziness", 
        "slurred speech", "sudden weakness", "severe allergic reaction"
    }

    CARDIAC_CONDITIONS = {"hypertension", "coronary artery disease", "heart failure", "arrhythmia", "cardiac"}

    @classmethod
    def evaluate_escalation(
        cls,
        extracted_symptoms: List[Dict[str, Any]],
        patient_conditions: List[str],
        patient_age: int,
        message_text: str,
        previous_episodes: Optional[List[Dict[str, Any]]] = None,
        active_medications: Optional[List[Dict[str, Any]]] = None
    ) -> SafetyEvaluationResult:
        
        triggered_rules = []
        reasons = []
        suggested_actions = []
        requires_review = False
        level = "ROUTINE"
        
        symptom_names = [str(s.get("name", "")).lower() for s in extracted_symptoms if isinstance(s, dict)]
        condition_names = [str(c).lower() for c in patient_conditions]
        msg_lower = message_text.lower()
        
        # Check recurrence indicator in text or history
        is_recurring = any(kw in msg_lower for kw in ["again", "recurring", "worse", "still having", "returned", "past few days"])
        if previous_episodes and len(previous_episodes) > 0:
            is_recurring = True

        # RULE 1 — Recurrent Breathing Difficulty / Dyspnea
        has_breathing_issue = any(any(b in s for b in ["breath", "breathing", "dyspnea", "shortness"]) for s in symptom_names) or any(b in msg_lower for b in ["breathing difficulty", "breathless", "short of breath", "trouble breathing"])
        
        if has_breathing_issue:
            if is_recurring or any(c in condition_names for c in cls.CARDIAC_CONDITIONS) or patient_age >= 55:
                requires_review = True
                level = "URGENT_EVALUATION"
                triggered_rules.append("RULE_01_RECURRENT_DYSPNEA_CARDIO_RISK")
                reasons.append("Recurrent or progressive breathing difficulty detected in a patient with elevated cardiovascular/age risk.")
                suggested_actions.append("Flag for attending clinician review")
                suggested_actions.append("Review recent medication adherence and inhaler/antihypertensive dosage")

        # RULE 2 — Concurrent Chest Pain & Breathlessness
        has_chest_pain = any("chest" in s for s in symptom_names) or "chest pain" in msg_lower or "chest tightness" in msg_lower
        if has_chest_pain and has_breathing_issue:
            requires_review = True
            level = "EMERGENCY"
            triggered_rules.append("RULE_02_ACUTE_CARDIO_PULMONARY_RED_FLAG")
            reasons.append("Simultaneous chest pain and respiratory distress indicate potential acute cardiopulmonary event.")
            suggested_actions.append("Direct patient to emergency care services immediately")
            suggested_actions.append("Trigger high-priority clinician notification")

        # RULE 3 — Severe Pain Threshold (Severity >= 8)
        for s in extracted_symptoms:
            if isinstance(s, dict) and int(s.get("severity", 0)) >= 8:
                requires_review = True
                if level != "EMERGENCY":
                    level = "URGENT_EVALUATION"
                triggered_rules.append("RULE_03_HIGH_SEVERITY_SYMPTOM")
                reasons.append(f"Patient reported high severity ({s.get('severity')}/10) for symptom '{s.get('name')}'.")

        # RULE 4 — Context Suppression for Benign Physical Exertion
        if has_chest_pain and not has_breathing_issue and ("heavy workout" in msg_lower or "muscle sore" in msg_lower or "gym" in msg_lower):
            if level not in ["EMERGENCY", "URGENT_EVALUATION"]:
                level = "MONITORING"
                triggered_rules.append("RULE_04_CONTEXT_EXERTION_SUPPRESSION")
                reasons.append("Chest discomfort likely musculoskeletal post-exertion; continuous monitoring recommended.")

        # Default actions based on review status
        if requires_review:
            suggested_actions.append("Log health event to longitudinal graph memory")
            suggested_actions.append("Generate clinician follow-up alert")
        else:
            suggested_actions.append("Log routine check-in to memory graph")

        return SafetyEvaluationResult(
            requires_clinician_review=requires_review,
            escalation_level=level,
            triggered_rules=triggered_rules,
            reasons=reasons,
            suggested_actions=suggested_actions,
            is_safe_for_automated_reply=True
        )

    @classmethod
    def evaluate_medication_interaction(
        cls,
        new_medicine: str,
        active_medications: List[Dict[str, Any]],
        patient_allergies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Deterministic contraindication & allergy verification
        """
        new_med_lower = new_medicine.lower()
        conflicts = []
        
        # Check Allergy Collisions
        for allergy in patient_allergies:
            alg_name = (allergy.get("name") if isinstance(allergy, dict) else str(allergy)).lower()
            if alg_name in new_med_lower or ("penicillin" in alg_name and any(p in new_med_lower for p in ["amoxicillin", "ampicillin", "augmentin"])):
                conflicts.append(f"Known allergy collision with documented allergy: {alg_name}")

        # Check Duplicate Therapy
        for act in active_medications:
            act_name = (act.get("medicine_name") or act.get("name") or "").lower()
            if act_name and (act_name in new_med_lower or new_med_lower in act_name):
                conflicts.append(f"Duplicate active therapy detected with current medication: {act_name}")

        return {
            "conflict_found": len(conflicts) > 0,
            "conflicts": conflicts,
            "requires_doctor_confirmation": len(conflicts) > 0
        }
