from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, gsc, analysis, ai
import os

app = FastAPI(title="GSC Intelligence API", version="1.0.0")

# Parse allowed origins from env var — comma-separated list
# Example Railway env: ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["auth"])
app.include_router(gsc.router,      prefix="/api/gsc",      tags=["gsc"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(ai.router,       prefix="/api/ai",       tags=["ai"])

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
