import os
import motor.motor_asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "audio_analyzer_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db["users"]
history_collection = db["history"]

UPLOAD_DIR = "temp_audio_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

gemini_client = genai.Client()