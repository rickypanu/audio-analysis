from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext

from database import users_collection
from schemas import UserRegister, UserResponse, LoginRequest, LoginResponse

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister):
    existing_user = await users_collection.find_one({
        "$or": [{"email": user_data.email}, {"username": user_data.username}]
    })
    
    if existing_user:
        if existing_user.get("email") == user_data.email:
            raise HTTPException(status_code=400, detail="User with this email already exists.")
        raise HTTPException(status_code=400, detail="Username is already taken.")

    hashed_pwd = hash_password(user_data.password)
    user_doc = {
        "email": user_data.email,
        "username": user_data.username,
        "password_hash": hashed_pwd,
        "created_at": datetime.now(timezone.utc)
    }

    result = await users_collection.insert_one(user_doc)

    return UserResponse(
        id=str(result.inserted_id),
        email=user_data.email,
        username=user_data.username,
        created_at=user_doc["created_at"]
    )

@auth_router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = await users_collection.find_one({
        "$or": [{"username": credentials.username}, {"email": credentials.username}]
    })

    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password"
        )

    return LoginResponse(
        success=True,
        message="Login successful",
        user_id=str(user["_id"]),
        username=user["username"]
    )