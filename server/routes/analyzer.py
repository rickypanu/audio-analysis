import os
import shutil
import json
import traceback
import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from google.genai import types, errors

from database import gemini_client, history_collection, UPLOAD_DIR
from schemas import AudioAnalysisResult

analyzer_router = APIRouter(prefix="/api", tags=["Audio Analyzer"])

@analyzer_router.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...), user_id: Optional[str] = Query(None)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not an audio file.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)
    uploaded_file = None

    try:
        def save_file():
            with open(file_location, "wb") as file_object:
                shutil.copyfileobj(file.file, file_object)

        await asyncio.to_thread(save_file)

        uploaded_file = await gemini_client.aio.files.upload(file=file_location)

        prompt = """
        You are an elite linguistic expert and speech acoustics analyst. Analyze the provided audio file thoroughly and produce an in-depth, precise evaluation covering the following components:

        1. VERBATIM TRANSCRIPTION:
           - Provide a complete, exact, word-for-word transcript from start to finish.
           - Do NOT summarize, shorten, or truncate any part of the spoken text.
           - Capture all spoken words, including filler words (e.g., 'um', 'uh', 'like'), false starts, and repeated phrases.

        2. PITCH, TONE, AND DELIVERY ANALYSIS:
           - Analyze the speaker's pitch profile (e.g., dynamic vs. monotone, high/low register, pitch modulation at sentence endings).
           - Detail their vocal tone (e.g., energetic, authoritative, conversational, hesitant, strained).
           - Assess speech rhythm, cadence, speaking speed, and significant pauses or hesitations.

        3. GRAMMAR AND PRONUNCIATION ISSUES:
           - Systematically inspect the audio for every grammatical mistake, non-standard usage, mispronunciation, or awkward phrasing.
           - Provide the exact original phrase, the corrected version, and a clear explanation for each instance found.

        4. ACTIONABLE FEEDBACK:
           - Summarize comprehensive, practical suggestions for improving communication, pronunciation, and vocal delivery.
        """

        models_to_try = ["gemini-3.5-flash", "gemini-2.5-flash"]
        response = None
        last_exception = None

        for model_name in models_to_try:
            try:
                response = await gemini_client.aio.models.generate_content(
                    model=model_name,
                    contents=[uploaded_file, prompt],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AudioAnalysisResult,
                    ),
                )
                break  
            except errors.ClientError as err:
                last_exception = err
                if err.code == 429:
                    await asyncio.sleep(3)

                if model_name == models_to_try[-1]:
                    raise err

        if not response or not response.text:
            raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(last_exception)}")

        analysis_data = json.loads(response.text)

        record_doc = {
            "user_id": user_id,
            "fileName": file.filename,
            "contentType": file.content_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": {
                "status": "success",
                "message": "File successfully analyzed by Gemini.",
                "file_info": {
                    "filename": file.filename,
                    "content_type": file.content_type,
                },
                "analysis": analysis_data,
            },
        }

        inserted_result = await history_collection.insert_one(record_doc)

        return {
            "status": "success",
            "message": "File successfully analyzed and stored in database.",
            "record_id": str(inserted_result.inserted_id),
            "file_info": record_doc["data"]["file_info"],
            "analysis": analysis_data,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing file with Gemini: {str(e)}")

    finally:
        file.file.close()

        if os.path.exists(file_location):
            os.remove(file_location)

        if uploaded_file:
            try:
                await gemini_client.aio.files.delete(name=uploaded_file.name)
            except Exception as del_err:
                print(f"Failed to delete remote file: {del_err}")