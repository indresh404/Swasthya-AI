import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://placeholder.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") or "placeholder-anon-key"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://placeholder.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") or "placeholder-anon-key"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

MOCK_MEDICINES_DATABASE = [
    {"product_name": "Glycomet 500mg", "salt_composition": "Metformin 500mg", "product_price": "₹ 52.00"},
    {"product_name": "Glycomet 1g", "salt_composition": "Metformin 1000mg", "product_price": "₹ 82.00"},
    {"product_name": "Dolo 650", "salt_composition": "Paracetamol 650mg", "product_price": "₹ 32.00"},
    {"product_name": "Dolo 650mg", "salt_composition": "Paracetamol 650mg", "product_price": "₹ 32.00"},
    {"product_name": "Amlokind 5mg", "salt_composition": "Amlodipine 5mg", "product_price": "₹ 48.00"},
    {"product_name": "Amlopin 10mg", "salt_composition": "Amlodipine 10mg", "product_price": "₹ 78.00"},
    {"product_name": "Calcirol 60k", "salt_composition": "Vitamin D3", "product_price": "₹ 65.00"},
    {"product_name": "Crocin 650mg", "salt_composition": "Paracetamol 650mg", "product_price": "₹ 30.00"},
    {"product_name": "Ecosprin 75mg", "salt_composition": "Aspirin 75mg", "product_price": "₹ 28.00"},
    {"product_name": "Atorva 10mg", "salt_composition": "Atorvastatin 10mg", "product_price": "₹ 75.00"},
    {"product_name": "Atorva 20mg", "salt_composition": "Atorvastatin 20mg", "product_price": "₹ 115.00"},
    {"product_name": "Pan 40mg", "salt_composition": "Pantoprazole 40mg", "product_price": "₹ 85.00"},
    {"product_name": "Telma 40mg", "salt_composition": "Telmisartan 40mg", "product_price": "₹ 68.00"},
    {"product_name": "Telma 80mg", "salt_composition": "Telmisartan 80mg", "product_price": "₹ 110.00"},
    {"product_name": "Combiflam", "salt_composition": "Ibuprofen & Paracetamol", "product_price": "₹ 45.00"},
    {"product_name": "Augmentin 625 DUO", "salt_composition": "Amoxicillin & Clavulanic Acid", "product_price": "₹ 201.00"},
    {"product_name": "Limcee 500mg", "salt_composition": "Vitamin C", "product_price": "₹ 25.00"},
    {"product_name": "Zifi 200mg", "salt_composition": "Cefixime 200mg", "product_price": "₹ 105.00"},
    {"product_name": "Omez 20mg", "salt_composition": "Omeprazole 20mg", "product_price": "₹ 55.00"},
    {"product_name": "Thyronorm 50mcg", "salt_composition": "Thyroxine 50mcg", "product_price": "₹ 130.00"},
    {"product_name": "Thyronorm 100mcg", "salt_composition": "Thyroxine 100mcg", "product_price": "₹ 165.00"},
    {"product_name": "Clopilet 75mg", "salt_composition": "Clopidogrel 75mg", "product_price": "₹ 95.00"},
]

GENERIC_JANAUSHADHI_PRICES = {
    "metformin": 9.20,
    "amlodipine": 5.50,
    "vitamin d3": 12.00,
    "paracetamol": 4.50,
    "aspirin": 3.80,
    "atorvastatin": 10.50,
    "pantoprazole": 12.40,
    "telmisartan": 8.90,
    "ibuprofen": 6.00,
    "amoxicillin": 18.00,
    "vitamin c": 5.00,
    "cefixime": 22.00,
    "omeprazole": 7.50,
    "thyroxine": 15.00,
    "clopidogrel": 11.00,
}

def parse_price(price_str: str) -> float:
    if not price_str:
        return 0.0
    match = re.search(r'[\d\.]+', price_str.replace(',', ''))
    if match:
        try:
            return float(match.group())
        except ValueError:
            return 0.0
    return 0.0

def get_janaushadhi_equivalent(product_name: str, salt_composition: str, product_price: float):
    salt_lower = (salt_composition or "").lower()
    product_lower = product_name.lower()
    
    matched_salt = "Generic equivalent"
    jan_price = 0.0
    
    for salt, price in GENERIC_JANAUSHADHI_PRICES.items():
        if salt in salt_lower or salt in product_lower:
            matched_salt = salt.capitalize()
            dosage_match = re.search(r'\d+\s*(mg|mcg|g|k)', product_name + " " + (salt_composition or ""))
            if dosage_match:
                matched_salt = f"{matched_salt} {dosage_match.group()}"
            jan_price = price
            break
            
    if jan_price == 0.0:
        jan_price = round(product_price * 0.15, 2)
        if jan_price < 2.0:
            jan_price = 2.0
        if salt_composition:
            matched_salt = salt_composition.split('+')[0].split('&')[0].strip()
        else:
            matched_salt = product_name
            
    return {
        "generic_name": matched_salt,
        "jan_price": jan_price
    }

class SupabaseService:
    @staticmethod
    def is_valid_uuid(val: str) -> bool:
        try:
            uuid.UUID(str(val))
            return True
        except ValueError:
            return False

    @classmethod
    def get_medicines(cls, patient_id: str):
        try:
            res = supabase.table("medicines").select("*").eq("patient_id", patient_id).eq("is_active", True).execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"[SupabaseService] get_medicines failed: {e}")
        return []

    @classmethod
    def log_adherence(cls, patient_id: str, medicine: str):
        try:
            supabase.table("adherence_log").insert({
                "patient_id": patient_id,
                "medicine": medicine,
                "taken_at": datetime.utcnow().isoformat()
            }).execute()
            return True
        except Exception as e:
            print(f"[SupabaseService] log_adherence failed: {e}")
            return True

    @classmethod
    def add_medicine(cls, patient_id: str, medicine_data: dict):
        try:
            res = supabase.table("medicines").insert({
                "patient_id": patient_id,
                "medicine_name": medicine_data.get("medicine_name"),
                "dosage": medicine_data.get("dosage", "Standard"),
                "frequency": medicine_data.get("frequency", "Once daily"),
                "is_critical": medicine_data.get("is_critical", False),
                "is_active": True,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print(f"[SupabaseService] add_medicine failed: {e}")
        
        return {
            "id": f"custom-{uuid.uuid4()}",
            "patient_id": patient_id,
            "medicine_name": medicine_data.get("medicine_name"),
            "dosage": medicine_data.get("dosage", "Standard"),
            "frequency": medicine_data.get("frequency", "Once daily"),
            "is_critical": medicine_data.get("is_critical", False),
            "is_active": True
        }

    @classmethod
    def search_medicines(cls, query: str):
        try:
            res = supabase.table("Medicines").select("*").ilike("product_name", f"%{query}%").limit(15).execute()
            if res.data and len(res.data) > 0:
                results = []
                for row in res.data:
                    m_price = parse_price(row.get("product_price"))
                    equivalent = get_janaushadhi_equivalent(
                        row.get("product_name", ""),
                        row.get("salt_composition", ""),
                        m_price
                    )
                    results.append({
                        "product_name": row.get("product_name"),
                        "salt_composition": row.get("salt_composition"),
                        "market_price": m_price,
                        "generic_name": equivalent["generic_name"],
                        "jan_aushadhi_price": equivalent["jan_price"]
                    })
                return results
        except Exception as e:
            print(f"[SupabaseService] search_medicines database search failed: {e}")
        
        # Local fallback search
        results = []
        q = query.lower()
        for med in MOCK_MEDICINES_DATABASE:
            if q in med["product_name"].lower() or q in med["salt_composition"].lower():
                m_price = parse_price(med["product_price"])
                equivalent = get_janaushadhi_equivalent(
                    med["product_name"],
                    med["salt_composition"],
                    m_price
                )
                results.append({
                    "product_name": med["product_name"],
                    "salt_composition": med["salt_composition"],
                    "market_price": m_price,
                    "generic_name": equivalent["generic_name"],
                    "jan_aushadhi_price": equivalent["jan_price"]
                })
        return results[:15]

