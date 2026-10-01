import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from bson import ObjectId
from bson.errors import InvalidId
import motor.motor_asyncio
from passlib.context import CryptContext

router = APIRouter()

# ------------------------------------------------------------------
# 1. Database Connection Setup
# ------------------------------------------------------------------
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "audio_analyzer_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# ------------------------------------------------------------------
# 2. Security & Hashing
# ------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ------------------------------------------------------------------
# 3. Pydantic Schemas
# ------------------------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4)

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ------------------------------------------------------------------
# 4. Authentication Routes
# ------------------------------------------------------------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister):
    # Check if user with given email or username already exists
    existing_user = await db["users"].find_one({
        "$or": [
            {"email": user_data.email},
            {"username": user_data.username}
        ]
    })
    
    if existing_user:
        if existing_user.get("email") == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken."
        )

    # Hash password and prepare user document
    hashed_pwd = hash_password(user_data.password)
    user_doc = {
        "email": user_data.email,
        "username": user_data.username,
        "password_hash": hashed_pwd,
        "created_at": datetime.now(timezone.utc)
    }


    result = await db["users"].insert_one(user_doc)

    return UserResponse(
        id=str(result.inserted_id),
        email=user_data.email,
        username=user_data.username,
        created_at=user_doc["created_at"]
    )