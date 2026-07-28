import base64
import os
import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
import insightface
from insightface.app import FaceAnalysis
import motor.motor_asyncio

# Rate Limiter imports
from slowapi import Limiter
from slowapi.util import get_remote_address

load_dotenv()

router = APIRouter()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# MongoDB Connection Setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "audio_analyzer_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]


class FaceLoginRequest(BaseModel):
    image_base64: str
    gesture_completed: bool = False  # Liveness trigger flag


class LoginResponse(BaseModel):
    success: bool
    message: str
    user: str


# Global state
face_app = None
SIMILARITY_THRESHOLD = 0.48


@router.on_event("startup")
def startup_event():
    global face_app
    try:
        face_app = FaceAnalysis(name="buffalo_s", providers=["CPUExecutionProvider"])
        face_app.prepare(ctx_id=0, det_size=(640, 640))
        print("✅ ONNX InsightFace model loaded successfully.")
    except Exception as e:
        print(f"⚠️ Failed to load InsightFace model: {e}")


def cosine_distance(embedding1, embedding2):
    """Calculates cosine distance between two vectors."""
    a = np.array(embedding1, dtype=np.float32)
    b = np.array(embedding2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 1.0
    return 1.0 - (np.dot(a, b) / (norm_a * norm_b))


@router.post("/api/login/face", response_model=LoginResponse)
@limiter.limit("2/minute")
async def login_with_face(request: Request, payload: FaceLoginRequest):
    # 1. Verify liveness gesture requirement
    if not payload.gesture_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authentication gesture incomplete. Please try again.",
        )

    # 2. Fetch users with saved embeddings from MongoDB
    cursor = users_collection.find(
        {"face_embedding": {"$exists": True, "$ne": None}},
        {"username": 1, "face_embedding": 1},
    )
    authorized_users = await cursor.to_list(length=1000)

    if not authorized_users:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No authorized user face profiles found in database.",
        )

    try:
        # 3. Decode base64 image
        image_data = payload.image_base64.split(",")[-1]
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image payload.",
            )

        # 4. Generate embedding vector using InsightFace
        faces = face_app.get(img)
        if len(faces) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No face detected in webcam stream. Please center your face.",
            )

        captured_embedding = faces[0].normed_embedding

        # 5. Compare against database users
        best_match_user = None
        min_distance = float("inf")

        print("\n--- 📸 New Face Scan Attempt ---")
        for user_doc in authorized_users:
            user_name = user_doc.get("username")
            ref_embedding = user_doc.get("face_embedding")

            if ref_embedding:
                dist = cosine_distance(captured_embedding, ref_embedding)
                match_percentage = max(0.0, (1.0 - dist) * 100)

                print(f"👤 User: {user_name} | Distance: {dist:.4f} | Match: {match_percentage:.2f}%")

                if dist < min_distance:
                    min_distance = dist
                    best_match_user = user_name

        best_match_percentage = max(0.0, (1.0 - min_distance) * 100)
        print(f"🎯 Best Result: {best_match_user} with {best_match_percentage:.2f}% match (Distance: {min_distance:.4f} | Limit: {SIMILARITY_THRESHOLD})\n")

        # 6. Verify distance against security threshold
        if min_distance <= SIMILARITY_THRESHOLD and best_match_user:
            return {
                "success": True,
                "message": f"Welcome back, {best_match_user}! ({best_match_percentage:.1f}% match)",
                "user": best_match_user,
            }

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Face authentication failed. Access denied.",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication pipeline error: {str(e)}",
        )