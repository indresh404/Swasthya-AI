from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from services.supabase_service import supabase
from services.llm_service import LLMService
from services.medical_pipeline import MedicalPipeline
import json

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessageRequest(BaseModel):
    patient_id: str
    session_id: str
    message: str
    patient_context: dict = None

class EndSessionRequest(BaseModel):
    patient_id: str
    session_id: str = None

@router.post("/message")
async def process_chat_message(req: ChatMessageRequest):
    """
    Main endpoint for chatbot interaction. Processes user messages, executes the combined
    medical pipeline, and returns the bot reply, extraction details, and database persistence status.
    """
    try:
        # Run consolidated message processing pipeline
        pipeline_res = await MedicalPipeline.process_message_pipeline(
            patient_id=req.patient_id,
            session_id=req.session_id,
            message=req.message
        )
        
        return {
            "bot_reply": pipeline_res["bot_reply"],
            "extracted_symptom": pipeline_res["extracted_data"],
            "medical_event": pipeline_res["is_medical"],
            "save_status": pipeline_res["save_status"]
        }
    except Exception as e:
        print(f"[chat/message] Error running clinical pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat message: {e}")

@router.post("/end-session")
async def end_chat_session(req: EndSessionRequest):
    """
    On-demand summary endpoint. Generates a clinical summary for the current session and stores it.
    """
    try:
        session_id = req.session_id or "default-session"
        summary_text = await MedicalPipeline.generate_and_store_summary(req.patient_id, session_id)
        return {
            "status": "success",
            "summary": summary_text
        }
    except Exception as e:
        print(f"[end-session] Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {e}")

@router.post("/cron/daily-summaries")
async def cron_generate_daily_summaries():
    """
    Nightly cron endpoint to generate daily summaries for all active patients today.
    """
    try:
        today = datetime.utcnow().date().isoformat()
        recent_chats = supabase.table("chat_events").select("patient_id").gte("created_at", today).execute()
        patient_ids = list(set([c["patient_id"] for c in recent_chats.data]))
        
        processed_count = 0
        for patient_id in patient_ids:
            # Check if summary already exists for today
            existing_summary = supabase.table("daily_summaries").select("id").eq("user_id", patient_id).eq("summary_date", today).execute()
            if existing_summary.data:
                continue
                
            active_symptoms = supabase.table("symptom_tracker").select("*").eq("user_id", patient_id).eq("status", "active").execute()
            chat_events_res = supabase.table("chat_events").select("*").eq("patient_id", patient_id).gte("created_at", today).execute()
            
            summary_text = await LLMService.generate_clinical_summary(chat_events_res.data, active_symptoms.data)
            
            symptoms_list = [s["symptom_name"] for s in active_symptoms.data]
            max_severity = max([s["current_severity"] for s in active_symptoms.data if s.get("current_severity") is not None]) if active_symptoms.data else None
            requires_followup = any([s.get("current_severity", 0) >= 7 for s in active_symptoms.data])
            
            summary_payload = {
                "user_id": patient_id,
                "summary_date": today,
                "summary": summary_text,
                "symptoms": symptoms_list,
                "severity_max": max_severity,
                "requires_followup": requires_followup
            }
            supabase.table("daily_summaries").insert(summary_payload).execute()
            processed_count += 1
            
        return {
            "status": "success",
            "message": f"Processed summaries for {processed_count} active users",
            "active_users_today": patient_ids
        }
    except Exception as e:
        print(f"[cron] Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))