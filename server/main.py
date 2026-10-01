from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import auth_router
from routes.history import history_router
from routes.analyzer import analyzer_router

app = FastAPI(
    title="Audio Analyzer API",
    description="Backend service for transcribing, evaluating speech acoustics, and grammar checking using Gemini models.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach Routers
app.include_router(auth_router)
app.include_router(history_router)
app.include_router(analyzer_router)

@app.get("/")
async def root():
    return {"message": "Audio Analyzer API is running smoothly."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

    
@app.api_route("/health", methods=["GET", "HEAD"], status_code=200, tags=["Health"])
def health_check():
    """
    Endpoint for UptimeRobot to ping and keep the Render instance awake.
    """
    return {"status": "ok", "message": "Server is active and awake"}