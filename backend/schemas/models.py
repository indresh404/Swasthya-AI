from pydantic import BaseModel
from typing import Optional

class UpdateProfileRequest(BaseModel):
    full_name: str
    phone: str
    age: int
    gender: str

class UpdateMedicalRequest(BaseModel):
    weight: Optional[str] = ""
    height: Optional[str] = ""
    blood_type: Optional[str] = ""
    allergies: Optional[str] = ""
    blood_pressure: Optional[str] = ""
    heart_rate: Optional[str] = ""
    oxygen_level: Optional[str] = ""
    surgeries: Optional[str] = ""
    chronic_conditions: Optional[str] = ""
    vaccinations: Optional[str] = ""
    family_genetics: Optional[str] = ""

class PatientProfileUpsertRequest(BaseModel):
    full_name: Optional[str] = ""
    age: Optional[int] = None
    gender: Optional[str] = ""
    blood_group: Optional[str] = ""
    height: Optional[str] = ""
    weight: Optional[str] = ""
    allergies: Optional[str] = ""
    current_medication: Optional[str] = ""
    chronic_diseases: Optional[str] = ""
    family_history: Optional[str] = ""
    smoking: Optional[str] = ""
    alcohol: Optional[str] = ""
    emergency_contact: Optional[str] = ""

