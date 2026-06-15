from fastapi import APIRouter, Depends
from services.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/verify-token")
async def verify_token(current_user = Depends(get_current_user)):
    """
    Utility endpoint to verify if a token is valid.
    """
    return {
        "status": "success",
        "user_id": current_user.id,
        "email": current_user.email
    }
