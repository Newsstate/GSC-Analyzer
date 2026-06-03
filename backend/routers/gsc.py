from fastapi import APIRouter, Header, HTTPException
from services import gsc_service
from services.demo_data import DEMO_DATA
import base64, json

router = APIRouter()

def get_token(authorization: str = Header(None)) -> dict | str:
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth token")
    token = authorization.replace("Bearer ", "")
    if token == "demo":
        return "demo"
    try:
        decoded = base64.b64decode(token.encode()).decode()
        return json.loads(decoded)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/sites")
async def list_sites(authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"sites": ["https://example.com/"]}
    try:
        sites = gsc_service.list_sites(token)
        return {"sites": sites}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/overview")
async def get_overview(site_url: str, days: int = 28, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["overview"]
    try:
        data = gsc_service.get_overview(token, site_url, days)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/timeseries")
async def get_timeseries(site_url: str, days: int = 28, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["timeseries"]
    try:
        data = gsc_service.get_clicks_timeseries(token, site_url, days)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/pages")
async def get_pages(site_url: str, days: int = 28, limit: int = 20, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"pages": DEMO_DATA["top_pages"]}
    try:
        pages = gsc_service.get_top_pages(token, site_url, days, limit)
        return {"pages": pages}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/queries")
async def get_queries(site_url: str, days: int = 28, limit: int = 50, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"queries": DEMO_DATA["queries"]}
    try:
        queries = gsc_service.get_top_queries(token, site_url, days, limit)
        return {"queries": queries}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/opportunities")
async def get_opportunities(site_url: str, days: int = 28, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"opportunities": DEMO_DATA["opportunities"]}
    try:
        opps = gsc_service.get_opportunities(token, site_url, days)
        return {"opportunities": opps}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/coverage")
async def get_coverage(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["coverage"]
    try:
        data = gsc_service.get_index_coverage(token, site_url)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inspect")
async def inspect_url(site_url: str, page_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["url_inspection"]
    try:
        data = gsc_service.inspect_url(token, site_url, page_url)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sitemaps")
async def get_sitemaps(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"sitemaps": DEMO_DATA["sitemaps"]}
    try:
        sitemaps = gsc_service.get_sitemaps(token, site_url)
        return {"sitemaps": sitemaps}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
