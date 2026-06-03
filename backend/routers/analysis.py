from fastapi import APIRouter, Header, HTTPException
from services.demo_data import DEMO_DATA
import base64, json

router = APIRouter()

def get_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth token")
    return authorization.replace("Bearer ", "")

@router.get("/issues")
async def get_issues(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"issues": DEMO_DATA["issues_queue"]}
    # In production: derive from real GSC coverage + sitemaps + CWV data
    return {"issues": []}

@router.get("/cwv-summary")
async def get_cwv_summary(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["cwv"]
    return {"mobile": {}, "desktop": {}, "poor_pages": 0, "top_issues": []}

@router.get("/enhancements")  
async def get_enhancements(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"enhancements": DEMO_DATA["enhancements"]}
    return {"enhancements": []}
