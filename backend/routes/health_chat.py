from fastapi import APIRouter, HTTPException, Query
from groq import Groq
from datetime import datetime
import json
import os
from prompts.importance_detector import check_importance
from services.neo4j_health_service import neo4j_service
from services.supabase_service import supabase
from pydantic import BaseModel
from typing import List, Dict, Optional

router = APIRouter(prefix="/health", tags=["health"])

class ChatRequest(BaseModel):
    patient_id: str
    message: str

class ChatResponse(BaseModel):
    ai_reply: str
    bot_reply: Optional[str] = None
    saving: bool  # Show "saving..." loading indicator
    saved_data: Optional[dict] = None
    importance_score: Optional[int] = None

EXTRACTION_PROMPT = """
You are a precise clinical information extractor. Extract any relevant health, lifestyle, and history details from the patient message.
Respond ONLY with a valid JSON object matching the following structure:
{
  "conditions": [{"name": "Diabetes", "status": "active/managed/resolved", "date": "YYYY-MM-DD"}],
  "symptoms": [{"name": "Fever", "severity": 8, "date": "YYYY-MM-DD"}],
  "medications": [{"name": "Paracetamol", "dosage": "500mg", "frequency": "twice daily", "start_date": "YYYY-MM-DD"}],
  "allergies": [{"allergen": "Penicillin", "severity": "high/medium/low", "date": "YYYY-MM-DD"}],
  "surgeries": [{"name": "Appendectomy", "date": "YYYY-MM-DD", "notes": "notes"}],
  "vaccinations": [{"name": "COVID Booster", "date": "YYYY-MM-DD"}],
  "habits": [{"name": "Smoking", "frequency": "daily/weekly/occasional", "duration": "5 years"}],
  "sleep": [{"hours": 7.5, "quality": "poor/good/excellent"}],
  "diets": [{"type": "Vegetarian/Keto/etc."}],
  "visits": [{"doctor": "Dr. Sharma", "reason": "regular checkup", "date": "YYYY-MM-DD"}],
  "hospitalizations": [{"reason": "Dengue", "date": "YYYY-MM-DD"}],
  "labs": [{"test_name": "HbA1c", "value": "6.5", "unit": "%", "date": "YYYY-MM-DD"}],
  "blood_group": "O+/A-/etc.",
  "emergency_contacts": [{"name": "Jane Doe", "phone": "1234567890", "relation": "Spouse"}],
  "family_member_link": "relative_patient_id"
}

Fill in missing details or dates with today's date ("{today}") if applicable. Only include sections where actual information was mentioned.

Message:
"{message}"
"""

@router.post("/chat-old", response_model=ChatResponse)
async def health_chat(request: ChatRequest):
    """
    Chat with patient → extract comprehensive health graph nodes → check importance →
    save to Neo4j if important → return AI reply with saved metadata
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 1. Get compassionate health assistant reply
    reply = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a compassionate health assistant. Reply empathetically."},
            {"role": "user", "content": request.message}
        ]
    )
    ai_reply = reply.choices[0].message.content
    
    # 2. Extract structured fields using LLM
    extract = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": EXTRACTION_PROMPT.format(today=today, message=request.message)}
        ],
        temperature=0.1
    )
    
    try:
        content = extract.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content.split("```json")[1].split("```")[0].strip()
        elif content.startswith("```"):
            content = content.split("```")[1].split("```")[0].strip()
        extracted = json.loads(content)
    except Exception as e:
        print(f"[health_chat] Extraction error: {e}. Content: {extract.choices[0].message.content}")
        extracted = {}
        
    # 3. Assess data importance
    importance = check_importance(extracted, client)
    should_save = importance.get("should_save", False)
    importance_score = importance.get("importance_score", 0)
    
    saved_data = {}
    
    # 4. Save to Neo4j health graph if score threshold met (>= 4 for detailed schemas)
    if should_save and importance_score >= 4:
        # Conditions
        for cond in extracted.get("conditions", []):
            if cond.get("name"):
                neo4j_service.save_condition(request.patient_id, cond["name"], cond.get("status", "active"), cond.get("date", today))
                saved_data.setdefault("conditions", []).append(cond["name"])
                
        # Symptoms
        for symptom in extracted.get("symptoms", []):
            if symptom.get("name"):
                neo4j_service.save_symptom(request.patient_id, symptom["name"], symptom.get("severity", 5), symptom.get("date", today))
                saved_data.setdefault("symptoms", []).append(symptom["name"])
                
        # Medications
        for med in extracted.get("medications", []):
            if med.get("name"):
                neo4j_service.save_medication(request.patient_id, med["name"], med.get("dosage", ""), med.get("frequency", ""), med.get("start_date", today))
                saved_data.setdefault("medications", []).append(med["name"])
                
        # Allergies
        for alg in extracted.get("allergies", []):
            if alg.get("allergen"):
                neo4j_service.save_allergy(request.patient_id, alg["allergen"], alg.get("severity", "medium"), alg.get("date", today))
                saved_data.setdefault("allergies", []).append(alg["allergen"])
                
        # Surgeries
        for surg in extracted.get("surgeries", []):
            if surg.get("name"):
                neo4j_service.save_surgery(request.patient_id, surg["name"], surg.get("date", today), surg.get("notes", ""))
                saved_data.setdefault("surgeries", []).append(surg["name"])
                
        # Vaccinations
        for vac in extracted.get("vaccinations", []):
            if vac.get("name"):
                neo4j_service.save_vaccination(request.patient_id, vac["name"], vac.get("date", today))
                saved_data.setdefault("vaccinations", []).append(vac["name"])
                
        # Habits
        for habit in extracted.get("habits", []):
            if habit.get("name"):
                neo4j_service.save_habit(request.patient_id, habit["name"], habit.get("frequency", "daily"), habit.get("duration", ""), today)
                saved_data.setdefault("habits", []).append(habit["name"])
                
        # Sleep
        for sl in extracted.get("sleep", []):
            if sl.get("hours") is not None:
                neo4j_service.save_sleep(request.patient_id, float(sl["hours"]), sl.get("quality", "good"), today)
                saved_data.setdefault("sleep", []).append(f"{sl['hours']}h ({sl.get('quality', 'good')})")
                
        # Diets
        for diet in extracted.get("diets", []):
            if diet.get("type"):
                neo4j_service.save_diet(request.patient_id, diet["type"], today)
                saved_data.setdefault("diets", []).append(diet["type"])
                
        # Doctor Visits
        for visit in extracted.get("visits", []):
            if visit.get("doctor"):
                neo4j_service.save_doctor_visit(request.patient_id, visit["doctor"], visit.get("reason", ""), visit.get("date", today))
                saved_data.setdefault("visits", []).append(visit["doctor"])
                
        # Hospitalizations
        for hosp in extracted.get("hospitalizations", []):
            if hosp.get("reason"):
                neo4j_service.save_hospitalization(request.patient_id, hosp["reason"], hosp.get("date", today))
                saved_data.setdefault("hospitalizations", []).append(hosp["reason"])
                
        # Labs
        for lab in extracted.get("labs", []):
            if lab.get("test_name"):
                neo4j_service.save_lab_result(request.patient_id, lab["test_name"], str(lab.get("value", "")), lab.get("unit", ""), lab.get("date", today))
                saved_data.setdefault("labs", []).append(lab["test_name"])
                
        # Blood Group
        bg = extracted.get("blood_group")
        if bg:
            neo4j_service.save_blood_group(request.patient_id, bg)
            saved_data["blood_group"] = [bg]
            
        # Emergency Contacts
        for contact in extracted.get("emergency_contacts", []):
            if contact.get("name") and contact.get("phone"):
                neo4j_service.save_emergency_contact(request.patient_id, contact["name"], contact["phone"], contact.get("relation", "Contact"))
                saved_data.setdefault("emergency_contacts", []).append(contact["name"])
                
        # Family link
        fl = extracted.get("family_member_link")
        if fl:
            neo4j_service.link_family_member(request.patient_id, fl)
            saved_data["family_member_link"] = [fl]

    return ChatResponse(
        ai_reply=ai_reply,
        bot_reply=ai_reply,
        saving=bool(should_save and importance_score >= 4),
        saved_data=saved_data if (should_save and importance_score >= 4) else None,
        importance_score=importance_score if (should_save and importance_score >= 4) else None
    )

@router.post("/daily-summary")
async def generate_daily_summary(patient_id: str):
    """
    Generate daily summary from Neo4j data collected today
    Store in Supabase table
    """
    today = datetime.now().strftime("%Y-%m-%d")
    
    with neo4j_service.driver.session() as session:
        result = session.run("""
            MATCH (u:User {id: $patient_id})-[r]->(n)
            WHERE r.last_reported = $date OR r.since = $date OR r.started_date = $date 
               OR r.date = $date OR r.last_updated = $date OR r.diagnosed_date = $date
            RETURN type(r) as rel_type, labels(n)[0] as node_type, 
                   coalesce(n.name, n.text, n.type) as label
        """, patient_id=patient_id, date=today)
        data = [dict(record) for record in result]
        
    symptoms = [d["label"] for d in data if d["node_type"] == "Symptom"]
    facts = [d["label"] for d in data if d["node_type"] == "HealthFact"]
    surgeries = [d["label"] for d in data if d["node_type"] == "Surgery"]
    medications = [d["label"] for d in data if d["node_type"] == "Medication"]
    
    # Fallback to general count if empty
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    summary_prompt = f"""
    Generate a brief daily health summary based on today's logs:
    Symptoms: {symptoms}
    Health facts/habits: {facts}
    Surgeries: {surgeries}
    Medications: {medications}
    
    Write 1-2 sentences summarizing the patient's health status today.
    """
    
    summary_response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a medical summarizer. Be concise."},
            {"role": "user", "content": summary_prompt}
        ]
    )
    summary_text = summary_response.choices[0].message.content
    
    supabase.table("daily_health_summaries").upsert({
        "patient_id": patient_id,
        "summary_date": today,
        "summary_text": summary_text,
        "symptoms_reported": symptoms,
        "facts_mentioned": facts,
        "surgeries_mentioned": surgeries,
        "medications_mentioned": medications,
        "data_importance_score": len(data),
        "important_data_found": len(data) > 0,
        "chat_messages_count": len(data)
    }).execute()
    
    return {
        "status": "summary_saved",
        "date": today,
        "summary": summary_text,
        "data_count": len(data)
    }

# --- Hackathon Insights APIs ---

@router.get("/insights/family-disease-risk")
async def get_family_disease_risk(patient_id: str = Query(...)):
    return neo4j_service.get_family_disease_risk(patient_id)

@router.get("/insights/shared-medications")
async def get_shared_medications(patient_id: str = Query(...)):
    return neo4j_service.get_shared_medications(patient_id)

@router.get("/insights/symptom-trends")
async def get_symptom_trends(patient_id: str = Query(...)):
    return neo4j_service.get_symptom_trends(patient_id)

@router.get("/insights/habit-correlations")
async def get_habit_correlations(patient_id: str = Query(...)):
    return neo4j_service.get_habit_correlations(patient_id)

@router.get("/insights/timeline")
async def get_health_timeline(patient_id: str = Query(...)):
    return neo4j_service.get_health_timeline(patient_id)
