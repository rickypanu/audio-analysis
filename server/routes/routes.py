from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import whisper

router = APIRouter()

UPLOAD_DIR = "temp_audio_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load the AI model into memory when the module is imported
print("Loading Whisper AI model... (This might take a minute the first time)")
model = whisper.load_model("base")
print("Model loaded successfully!")

@router.post("/api/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    # Simple validation
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not an audio file.")

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # 1. Save the file to disk temporarily
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # 2. RUN THE AI TRANSCRIPTION
        print(f"Transcribing {file.filename}...")
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
                "pitch": "Pitch analysis coming soon...", 
                "grammar_issues_found": "coming soon...",                 
                "transcription": transcription_text.strip()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error processing the file: {str(e)}")
    
    finally:
        file.file.close()
        # Clean up the temp file after processing so the disk doesn't fill up
        if os.path.exists(file_location):
            os.remove(file_location)