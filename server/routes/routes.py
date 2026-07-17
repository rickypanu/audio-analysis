from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

router = APIRouter()

load_dotenv()

UPLOAD_DIR = "temp_audio_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize the Gemini client
# It automatically picks up your GEMINI_API_KEY environment variable.
client = genai.Client()

@router.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not an audio file.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # 1. Save the file to disk temporarily
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # 2. Upload the audio file to the Gemini File API
        print(f"Uploading {file.filename} to Gemini...")
        uploaded_file = client.files.upload(file=file_location)
        
        # 3. Request transcription and analysis in a single structured call
        print("Analyzing audio with Gemini 3.5 Flash...")
        
        prompt = """
        You are an expert audio analysis assistant. Please analyze this audio and provide:
        1. An accurate, verbatim transcription of the English speech.
        2. A brief analysis of the speaker's vocal pitch (e.g., high, low, standard, energetic, flat).
        3. A list of any grammar or pronunciation issues found in their speech.
        """
        
        # We enforce a structured JSON schema so your React frontend gets reliable keys
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=[uploaded_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "transcription": types.Schema(type=types.Type.STRING, description="The complete text transcription."),
                        "pitch": types.Schema(type=types.Type.STRING, description="Analysis of the speaker's pitch and tone."),
                        "grammar_issues_found": types.Schema(type=types.Type.STRING, description="Any grammar mistakes or improvement areas found.")
                    },
                    required=["transcription", "pitch", "grammar_issues_found"]
                )
            )
        )
        
        # Clean up the file from Google's servers immediately to keep things tidy
        client.files.delete(name=uploaded_file.name)
        
        # Parse the JSON returned by Gemini
        import json
        analysis_data = json.loads(response.text)
        
        # 4. Return the response to React
        return {
            "status": "success",
            "message": "File successfully analyzed by Gemini.",
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type,
            },
            "analysis": analysis_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file with Gemini: {str(e)}")
    
    finally:
        file.file.close()
        # Clean up the local temp file
        if os.path.exists(file_location):
            os.remove(file_location)