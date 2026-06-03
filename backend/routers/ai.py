from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services import ai_service
from services.demo_data import DEMO_DATA
import base64, json, asyncio

router = APIRouter()

def get_token(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth token")
    return authorization.replace("Bearer ", "")

class DiagnosisRequest(BaseModel):
    site_url: str
    clicks: dict
    impressions: dict
    ctr: dict
    position: dict
    declining_pages: list = []
    issues: list = []
    opportunities: list = []

class IndexFixRequest(BaseModel):
    site_url: str
    valid: int = 0
    excluded: int = 0
    errors: int = 0
    breakdown: list = []
    url_inspections: list = []

class SitemapFixRequest(BaseModel):
    site_url: str
    sitemaps: list = []
    issues: list = []

class CWVRequest(BaseModel):
    site_url: str
    lcp: float = 0
    inp: float = 0
    cls: float = 0
    poor_pages: int = 0
    top_pages: list = []

class OpportunitiesRequest(BaseModel):
    site_url: str
    keywords: list = []
    total_opportunity: int = 0

class SchemaRequest(BaseModel):
    site_url: str
    enhancements: list = []

class QuestionRequest(BaseModel):
    question: str
    site_url: str
    clicks: int = 0
    impressions: int = 0
    position: float = 0
    issue_count: int = 0
    top_keywords: list = []

async def demo_stream(text: str):
    """Stream demo text word by word."""
    words = text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words)-1 else "")
        await asyncio.sleep(0.03)

def is_demo(authorization: str) -> bool:
    token = authorization.replace("Bearer ", "") if authorization else ""
    return token == "demo"

@router.post("/diagnosis")
async def stream_diagnosis(req: DiagnosisRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        demo_text = DEMO_DATA["ai_diagnosis"]
        return StreamingResponse(demo_stream(demo_text), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_diagnosis(req.model_dump()),
        media_type="text/plain"
    )

@router.post("/index-fix")
async def stream_index_fix(req: IndexFixRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        return StreamingResponse(demo_stream(DEMO_DATA["ai_index_fix"]), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_index_fix(req.model_dump()),
        media_type="text/plain"
    )

@router.post("/sitemap-fix")
async def stream_sitemap_fix(req: SitemapFixRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        return StreamingResponse(demo_stream(DEMO_DATA["ai_sitemap"]), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_sitemap_fix(req.model_dump()),
        media_type="text/plain"
    )

@router.post("/cwv")
async def stream_cwv(req: CWVRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        return StreamingResponse(demo_stream(DEMO_DATA["ai_cwv"]), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_cwv_fix(req.model_dump()),
        media_type="text/plain"
    )

@router.post("/opportunities")
async def stream_opportunities(req: OpportunitiesRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        return StreamingResponse(demo_stream(DEMO_DATA["ai_opportunities"]), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_opportunities(req.model_dump()),
        media_type="text/plain"
    )

@router.post("/schema")
async def stream_schema(req: SchemaRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        return StreamingResponse(demo_stream(DEMO_DATA["ai_schema"]), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_schema_fix(req.model_dump()),
        media_type="text/plain"
    )

@router.post("/ask")
async def ask_question(req: QuestionRequest, authorization: str = Header(None)):
    auth = authorization or ""
    if is_demo(auth):
        demo = f"Great question about **{req.site_url}**. Based on the current data showing {req.clicks:,} clicks and position {req.position:.1f}, here's my analysis: {req.question} — I'd focus first on the {req.issue_count} active issues, particularly any quick wins in positions 4–10."
        return StreamingResponse(demo_stream(demo), media_type="text/plain")
    return StreamingResponse(
        ai_service.stream_custom_question(req.question, req.model_dump()),
        media_type="text/plain"
    )
