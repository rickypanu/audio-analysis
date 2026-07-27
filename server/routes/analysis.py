import os
import shutil
import json
import traceback
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types, errors
import motor.motor_asyncio

router = APIRouter()
load_dotenv()

# --- 1. MongoDB Setup (Using Motor AsyncIO) ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "audio_analyzer_db")

mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = mongo_client[DB_NAME]
# Updated collection name to match history route: "history"
history_collection = db["history"]

# --- 2. Local Storage & Gemini Client Setup ---
UPLOAD_DIR = "temp_audio_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Client automatically uses GEMINI_API_KEY from environment
gemini_client = genai.Client()


# --- 3. Pydantic Response Schema ---
class AudioAnalysisResult(BaseModel):
    transcription: str = Field(description="The complete text transcription.")
    pitch: str = Field(description="Analysis of the speaker's pitch and tone.")
    grammar_issues_found: str = Field(description="Any grammar mistakes or improvement areas found.")


# --- 4. Endpoints ---
@router.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not an audio file.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)
    uploaded_file = None

    try:
        # Step A: Save uploaded file locally in an off-thread executor
        def save_file():
            with open(file_location, "wb") as file_object:
                shutil.copyfileobj(file.file, file_object)

        await asyncio.to_thread(save_file)

        # Step B: Upload file to Gemini File API (Using Async Gemini SDK)
        print(f"Uploading {file.filename} to Gemini...")
        uploaded_file = await gemini_client.aio.files.upload(
            file=file_location
        )

        prompt = """
        You are an expert audio analysis assistant. Please analyze this audio and provide:
        1. An accurate, verbatim transcription of the English speech.
        2. A brief analysis of the speaker's vocal pitch (e.g., high, low, standard, energetic, flat).
        3. A list of any grammar or pronunciation issues found in their speech.
        """

        # Step C: Generate content with dynamic model fallback
        models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash"]
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
                break  # Successfully generated
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

        # Step D: Parse structured JSON result
        analysis_data = json.loads(response.text)

        # Step E: Persist result directly to MongoDB "history" collection
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

        # Native Motor async insert
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
        # Step F: Ensure cleanup happens REGARDLESS of success or failure
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