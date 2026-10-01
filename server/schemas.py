from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4)

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    username: str

# --- Analyzer & History Schemas ---
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

class ManualHistoryEntry(BaseModel):
    user_id: Optional[str] = None
    fileName: str
    contentType: Optional[str] = "audio/mpeg"
    data: Dict[str, Any]