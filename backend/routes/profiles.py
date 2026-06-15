from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from services.supabase_service import supabase
from services.qr_service import QRService
from services.auth_middleware import get_current_user
from schemas.models import UpdateProfileRequest, UpdateMedicalRequest, PatientProfileUpsertRequest

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me")
async def get_my_profile(current_user = Depends(get_current_user)):
    # 1. Fetch base patient record from patients table
    res_pat = supabase.table("patients").select("*").eq("id", current_user.id).execute()
    if not res_pat.data:
        raise HTTPException(status_code=404, detail="Profile not found in patients")
        
    patient = res_pat.data[0]
    
    # Initialize profile with fields from patients table
    profile = {
        "id": patient.get("id"),
        "full_name": patient.get("full_name"),
        "phone_number": patient.get("phone_number"),
        "phone": patient.get("phone_number"),  # Return both phone and phone_number for frontend mapping compatibility
        "email": patient.get("email"),
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "blood_group": "",
        "height": "",
        "weight": "",
        "allergies": "",
        "current_medication": "",
        "chronic_diseases": "",
        "family_history": "",
        "smoking": "",
        "alcohol": "",
        "emergency_contact": ""
    }
    
    # 2. Fetch and merge from patient_profiles if it exists
    try:
        res_prof = supabase.table("patient_profiles").select("*").eq("id", current_user.id).execute()
        if res_prof.data:
            prof = res_prof.data[0]
            for key in ["full_name", "age", "gender", "blood_group", "height", "weight", 
                        "allergies", "current_medication", "chronic_diseases", "family_history", 
                        "smoking", "alcohol", "emergency_contact"]:
                val = prof.get(key)
                if val:
                    profile[key] = val
    except Exception as e:
        print(f"Failed to fetch patient_profiles in me endpoint: {e}")

    # 3. Fetch and merge from medical_information if it exists
    try:
        res_med = supabase.table("medical_information").select("*").eq("patient_id", current_user.id).execute()
        if res_med.data:
            med = res_med.data[0]
            # Merge fields if they are empty in the profile
            if not profile.get("height") and med.get("height"):
                profile["height"] = str(med.get("height"))
            if not profile.get("weight") and med.get("weight"):
                profile["weight"] = str(med.get("weight"))
            if not profile.get("blood_group") and med.get("blood_type"):
                profile["blood_group"] = med.get("blood_type")
            if not profile.get("allergies") and med.get("allergies"):
                profile["allergies"] = med.get("allergies")
            if not profile.get("chronic_diseases") and med.get("chronic_conditions"):
                profile["chronic_diseases"] = med.get("chronic_conditions")
            if not profile.get("family_history") and med.get("family_genetics"):
                profile["family_history"] = med.get("family_genetics")
    except Exception as e:
        print(f"Failed to merge medical_information: {e}")
        
    return profile

@router.put("")
async def update_my_profile(data: PatientProfileUpsertRequest, current_user = Depends(get_current_user)):
    db_payload = {
        "id": current_user.id,
        "full_name": data.full_name,
        "age": data.age,
        "gender": data.gender,
        "blood_group": data.blood_group,
        "height": data.height,
        "weight": data.weight,
        "allergies": data.allergies,
        "current_medication": data.current_medication,
        "chronic_diseases": data.chronic_diseases,
        "family_history": data.family_history,
        "smoking": data.smoking,
        "alcohol": data.alcohol,
        "emergency_contact": data.emergency_contact,
        "updated_at": datetime.utcnow().isoformat()
    }
    res = supabase.table("patient_profiles").upsert(db_payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    
    # Mirror updates to primary patients table for basic info
    try:
        supabase.table("patients").update({
            "full_name": data.full_name,
            "age": data.age,
            "gender": data.gender
        }).eq("id", current_user.id).execute()
    except Exception as e:
        print(f"Failed to update mirror patients table: {e}")

    return {"status": "success", "profile": res.data[0]}

@router.get("/symptoms")
async def get_my_symptoms(current_user = Depends(get_current_user)):
    """
    Fetches the list of all symptoms reported by the authenticated patient.
    """
    try:
        res = supabase.table("symptoms")\
            .select("*")\
            .eq("patient_id", current_user.id)\
            .order("last_reported_at", desc=True)\
            .execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve symptoms: {e}")

@router.get("/medical")
async def get_my_medical_info(current_user = Depends(get_current_user)):
    res = supabase.table("medical_information").select("*").eq("patient_id", current_user.id).execute()
    if not res.data:
        return {}
    return res.data[0]

@router.put("/medical")
async def update_my_medical_info(data: UpdateMedicalRequest, current_user = Depends(get_current_user)):
    db_payload = {
        "patient_id": current_user.id,
        "weight": data.weight,
        "height": data.height,
        "blood_type": data.blood_type,
        "allergies": data.allergies,
        "blood_pressure": data.blood_pressure,
        "heart_rate": data.heart_rate,
        "oxygen_level": data.oxygen_level,
        "surgeries": data.surgeries,
        "chronic_conditions": data.chronic_conditions,
        "vaccinations": data.vaccinations,
        "family_genetics": data.family_genetics,
        "updated_at": datetime.now().isoformat()
    }
    # Explicitly target on_conflict="patient_id" to prevent duplicate key constraint violations
    res = supabase.table("medical_information").upsert(db_payload, on_conflict="patient_id").execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update medical information")
    
    return {"status": "success", "medical_information": res.data[0]}

@router.get("/summaries")
async def get_my_summaries(current_user = Depends(get_current_user)):
    """
    Fetches the list of all conversation summaries for the authenticated patient.
    """
    try:
        res = supabase.table("conversation_summaries")\
            .select("*")\
            .eq("patient_id", current_user.id)\
            .order("created_at", desc=True)\
            .execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve summaries: {e}")

