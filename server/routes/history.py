from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from bson import ObjectId
from bson.errors import InvalidId

from database import history_collection
from schemas import ManualHistoryEntry

history_router = APIRouter(prefix="/api/history", tags=["History"])

@history_router.post("")
async def create_history_record(entry: ManualHistoryEntry):
    try:
        new_record = {
            "user_id": entry.user_id,
            "fileName": entry.fileName,
            "contentType": entry.contentType,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": entry.data
        }
        result = await history_collection.insert_one(new_record)
        return {
            "status": "success",
            "message": "Record created successfully.",
            "record_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create history entry: {str(e)}")

@history_router.get("")
async def get_history(user_id: Optional[str] = Query(None)):
    try:
        # Strict isolation: If no user_id is provided, return an empty list instead of all records
        if not user_id:
            return {"status": "success", "history": []}

        query = {"user_id": user_id}
        records = await history_collection.find(query).sort("timestamp", -1).to_list(100)
        clean_history = []

        for doc in records:
            doc_id = str(doc.get("_id", ""))
            data_raw = doc.get("data", {})
            file_info_raw = doc.get("file_info", {}) or data_raw.get("file_info", {})
            analysis_raw = doc.get("analysis", {}) or data_raw.get("analysis", {})

            clean_history.append({
                "id": doc_id,
                "user_id": doc.get("user_id"),
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
                    "analysis": analysis_raw
                }
            })

        return {"status": "success", "history": clean_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@history_router.delete("/{record_id}")
async def delete_history_item(record_id: str):
    try:
        obj_id = ObjectId(record_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid record ID format.")

    try:
        delete_result = await history_collection.delete_one({"_id": obj_id})
        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Record not found in database.")
            
        return {"status": "success", "message": "Record deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting record: {str(e)}")