import os
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from bson.errors import InvalidId
import motor.motor_asyncio

router = APIRouter()

# ------------------------------------------------------------------
# 1. Database Connection Setup
# ------------------------------------------------------------------
# Replace with your actual Mongo URI or pull from environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "audio_analyzer_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Explicitly define history_collection so it's globally available to routes
history_collection = db["history"]


# ------------------------------------------------------------------
# 2. Pydantic Models & Schemas
# ------------------------------------------------------------------
class AudioFileInfo(BaseModel):
    filename: str = "audio_sample.mp3"
    content_type: str = "audio/mpeg"


class AnalysisData(BaseModel):
    transcription: str = "No transcription available."
    pitch: str = "N/A"
    grammar_issues_found: str = "None detected."


class ResultPayload(BaseModel):
    status: str = "success"
    message: str = "File successfully analyzed."
    file_info: AudioFileInfo = Field(default_factory=AudioFileInfo)
    analysis: AnalysisData = Field(default_factory=AnalysisData)


class HistoryRecord(BaseModel):
    id: str = Field(alias="_id")
    fileName: str = "Untitled Audio"
    contentType: str = "audio/mpeg"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    data: ResultPayload

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )


from pydantic import BaseModel
from typing import Dict, Any, Optional

# Schema for incoming manual history record requests
class ManualHistoryEntry(BaseModel):
    fileName: str
    contentType: Optional[str] = "audio/mpeg"
    data: Dict[str, Any]


@router.post("/api/history")
async def create_history_record(entry: ManualHistoryEntry):
    """Manually creates and saves a new analysis record in MongoDB."""
    try:
        new_record = {
            "fileName": entry.fileName,
            "contentType": entry.contentType,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": entry.data
        }

        # Insert into MongoDB
        result = await history_collection.insert_one(new_record)

        return {
            "status": "success",
            "message": "Record created successfully.",
            "record_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create history entry: {str(e)}"
        )
        

# ------------------------------------------------------------------
# 3. History Endpoints
# ------------------------------------------------------------------
@router.get("/api/history")
async def get_history():
    """Retrieves history records from MongoDB with complete fallback sanitization."""
    try:
        # Querying history_collection safely
        records = await history_collection.find().sort("timestamp", -1).to_list(100)
        clean_history = []

        for doc in records:
            doc_id = str(doc.get("_id", ""))
            
            # Extract nested fields defensively regardless of payload shape
            data_raw = doc.get("data", {})
            file_info_raw = doc.get("file_info", {}) or data_raw.get("file_info", {})
            analysis_raw = doc.get("analysis", {}) or data_raw.get("analysis", {})

            clean_history.append({
                "id": doc_id,
                "fileName": doc.get("fileName") or file_info_raw.get("filename") or "Audio Track",
                "contentType": doc.get("contentType") or file_info_raw.get("content_type") or "audio/mpeg",
                "timestamp": doc.get("timestamp") or datetime.now(timezone.utc).isoformat(),
                "data": {
                    "status": data_raw.get("status", "success"),
                    "message": data_raw.get("message", "Analysis loaded successfully."),
                    "file_info": {
                        "filename": file_info_raw.get("filename", "audio.mp3"),
                        "content_type": file_info_raw.get("content_type", "audio/mpeg")
                    },
                    "analysis": {
                        "transcription": analysis_raw.get("transcription", "No transcription generated."),
                        "pitch": analysis_raw.get("pitch", "Pitch metrics unavailable."),
                        "grammar_issues_found": analysis_raw.get("grammar_issues_found", "No issues logged.")
                    }
                }
            })

        return {"status": "success", "history": clean_history}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.delete("/api/history/{record_id}")
async def delete_history_item(record_id: str):
    """Deletes a record from MongoDB by its ObjectId string."""
    try:
        obj_id = ObjectId(record_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid record ID format."
        )

    try:
        delete_result = await history_collection.delete_one({"_id": obj_id})
        
        if delete_result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found in database."
            )
            
        return {"status": "success", "message": "Record deleted successfully."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting record: {str(e)}"
        )