from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import whisper # Import the Whisper library

app = FastAPI(title="Audio Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_audio_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load the AI model into memory when the server starts.
# "base" is a good balance of speed and accuracy. You can also use "tiny" for faster (but less accurate) results.
print("Loading Whisper AI model... (This might take a minute the first time)")
model = whisper.load_model("base")
print("Model loaded successfully!")

@app.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not an audio file.")

    try:
        # 1. Save the file to disk
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # 2. RUN THE AI TRANSCRIPTION
        print(f"Transcribing {file.filename}...")
        
        # ADD 'language="en"' to force English output instead of auto-guessing Urdu
        result = model.transcribe(file_location, language="en") 
        
        transcription_text = result["text"]
        
        # 3. Return the real transcription to React
        return {
            "status": "success",
            "message": "File successfully uploaded and processed.",
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type,
            },
            "analysis": {
                "pitch": "Pitch analysis coming soon...", # Still mock
                "grammar_issues_found": "coming soon...",                # Still mock
                "transcription": transcription_text.strip() # <--- REAL AI TEXT!
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error processing the file: {str(e)}")
    
    finally:
        file.file.close()
        # Optional: Clean up the file after processing
        if os.path.exists(file_location):
            os.remove(file_location)