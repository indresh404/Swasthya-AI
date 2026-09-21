from fastapi import APIRouter, Query
from typing import Dict, Any
from math import radians, sin, cos, sqrt, atan2
from services.supabase_service import supabase

router = APIRouter(prefix="/schemes", tags=["schemes"])

@router.get("/nearby")
async def get_nearby_stores(lat: float = Query(...), lon: float = Query(...), limit: int = Query(10)):
    try:
        res = supabase.table("jan_aushadhi_stores").select("*").execute()
        stores = res.data or []
        if not stores:
            return {"status": "success", "total": 0, "stores": []}
            
        for store in stores:
            R = 6371.0
            lat1, lon1 = radians(lat), radians(lon)
            lat2, lon2 = radians(float(store.get('latitude', 19.0760))), radians(float(store.get('longitude', 72.8777)))
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            store['distance_km'] = round(R * c, 1)
            
        stores.sort(key=lambda x: x.get('distance_km', 999))
        return {"status": "success", "total": len(stores), "stores": stores[:limit]}
    except Exception as e:
        return {"status": "error", "message": str(e), "stores": []}

@router.post("/match")
async def match_schemes(data: Dict[str, Any]):
    # Return mock data for testing
    # Using the exact structure expected by the frontend for Jan Aushadhi display
    return {
        "generic_alternatives": [
            {
                "brand_name": "Glycomet",
                "generic_name": "Metformin", 
                "market_price": 52.0,
                "jan_aushadhi_price": 12.0
            },
            {
                "brand_name": "Amlong",
                "generic_name": "Amlodipine", 
                "market_price": 45.0,
                "jan_aushadhi_price": 9.5
            },
            {
                "brand_name": "Pan-D",
                "generic_name": "Pantoprazole", 
                "market_price": 120.0,
                "jan_aushadhi_price": 28.0
            }
        ],
        "eligible_schemes": [
            {
                "scheme_name": "PM-JAY (Ayushman Bharat)",
                "coverage": "₹5,00,000"
            },
            {
                "scheme_name": "State Health Insurance",
                "coverage": "₹2,00,000"
            }
        ],
        "summary": {
            "monthly_savings": 450,
            "annual_savings": 5400
        }
    }

