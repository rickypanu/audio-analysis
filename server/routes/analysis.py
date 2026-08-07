import os
import shutil
import json
import traceback
import asyncio
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types, errors
import motor.motor_asyncio

router = APIRouter()
load_dotenv()

# --- 1. MongoDB Setup ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "audio_analyzer_db")

mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
history_collection = db["history"]

# --- 2. Local Storage & Gemini Client Setup ---
UPLOAD_DIR = "temp_audio_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

gemini_client = genai.Client()


# --- 3. Enhanced Pydantic Response Schema ---
class GrammarIssue(BaseModel):
    original_phrase: str = Field(description="The exact spoken text containing the error or non-standard usage.")
    correction: str = Field(description="The grammatically correct phrasing.")
    explanation: str = Field(description="Detailed explanation of the rule or pronunciation feedback.")

class AudioAnalysisResult(BaseModel):
    transcription: str = Field(
        description="The complete, unabridged, verbatim transcription of all spoken text in the audio. Includes filler words, false starts, and exact wording without summarization."
    )
    pitch_and_tone_analysis: str = Field(
        description="A thorough analysis of vocal characteristics including pitch range, variations, tone, pacing (WPM), pauses, inflection, and overall audio clarity."
    )
    grammar_and_pronunciation_issues: List[GrammarIssue] = Field(
        description="An itemized list detailing every grammar error, awkward phrasing, or pronunciation issue identified in the recording."
    )
    key_takeaways_and_feedback: str = Field(
        description="Actionable advice for the speaker on how to improve clarity, delivery, grammar, and articulation based on this recording."
    )


# --- 4. Endpoints ---
@router.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not an audio file.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)
    uploaded_file = None

    try:
        def save_file():
            with open(file_location, "wb") as file_object:
                shutil.copyfileobj(file.file, file_object)

        await asyncio.to_thread(save_file)

        print(f"Uploading {file.filename} to Gemini...")
        uploaded_file = await gemini_client.aio.files.upload(
            file=file_location
        )

        # Enhanced detailed prompt
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

        #  ["gemini-2.5-flash", "gemini-2.5-pro"]
        models_to_try = ["gemini-3.5-flash", "gemini-2.5-flash"]
        response = None
        last_exception = None

        for model_name in models_to_try:
            try:
                print(f"Analyzing audio with {model_name}...")
                
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
                print(f"Issue with {model_name} (Status Code {err.code}): {err.message}")

                if err.code == 429:
                    print("Rate limit hit. Waiting 3s before retrying fallback model...")
                    await asyncio.sleep(3)

                if model_name == models_to_try[-1]:
                    raise err

        if not response or not response.text:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate analysis: {str(last_exception)}"
            )

        analysis_data = json.loads(response.text)

        record_doc = {
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
        record_id = str(inserted_result.inserted_id)

        return {
            "status": "success",
            "message": "File successfully analyzed and stored in database.",
            "record_id": record_id,
            "file_info": record_doc["data"]["file_info"],
            "analysis": analysis_data,
        }

    except Exception as e:
        print("\n--- DETAILED BACKEND ERROR ---")
        traceback.print_exc()
        print("------------------------------\n")
        raise HTTPException(status_code=500, detail=f"Error processing file with Gemini: {str(e)}")

    finally:
        file.file.close()

        if os.path.exists(file_location):
            os.remove(file_location)

        if uploaded_file:
            try:
                await gemini_client.aio.files.delete(
                    name=uploaded_file.name
                )
                print("Remote Gemini file deleted successfully.")
            except Exception as del_err:
                print(f"Failed to delete remote file: {del_err}")