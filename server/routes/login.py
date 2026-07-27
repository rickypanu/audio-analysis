import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

# Load environment variables
load_dotenv()

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str

@router.post("/api/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    valid_username = os.getenv("ADMIN_USERNAME")
    valid_password = os.getenv("ADMIN_PASSWORD")

    if credentials.username == valid_username and credentials.password == valid_password:
        return {"success": True, "message": "Login successful"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password"
    )