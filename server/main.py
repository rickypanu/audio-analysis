from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analysis import router as analysis_router
from routes.login import router as auth_router
from routes.history import router as history_router
app = FastAPI(title="Audio Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(analysis_router)
app.include_router(auth_router)
app.include_router(history_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Audio Analyser"}

@app.api_route("/health", methods=["GET", "HEAD"], status_code=200, tags=["Health"])
def health_check():
    """
    Endpoint for UptimeRobot to ping and keep the Render instance awake.
    """
    return {"status": "ok", "message": "Server is active and awake"}