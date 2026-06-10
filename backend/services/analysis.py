from fastapi import APIRouter, Header, HTTPException
from services.demo_data import DEMO_DATA
from services import crux_service, coverage_service
import base64, json

router = APIRouter()

def get_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No auth token")
    return authorization.replace("Bearer ", "")

def decode_token(token: str) -> dict:
    try:
        decoded = base64.b64decode(token.encode()).decode()
        return json.loads(decoded)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/issues")
async def get_issues(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"issues": DEMO_DATA["issues_queue"]}
    try:
        token_data = decode_token(token)
        # Derive issues from coverage + sitemaps
        coverage = coverage_service.get_real_coverage(token_data, site_url)
        cwv = await crux_service.get_cwv(site_url)

        issues = []

        # Coverage issues
        for item in coverage.get("breakdown", []):
            if item["count"] > 0 and item["severity"] in ("critical", "high"):
                issues.append({
                    "id": f"cov-{item['type'][:10]}",
                    "title": f"{item['count']} pages: {item['type']}",
                    "category": "Index Coverage",
                    "severity": item["severity"],
                    "impact": "Indexing issue",
                    "desc": item["type"],
                    "screen": "coverage"
                })

        # CWV issues
        mobile = cwv.get("mobile", {})
        for metric_key, label in [("lcp", "LCP"), ("cls", "CLS"), ("inp", "INP")]:
            m = mobile.get(metric_key)
            if m and m.get("status") in ("poor", "needs_improvement"):
                issues.append({
                    "id": f"cwv-{metric_key}",
                    "title": f"{label} {m['value']} — {m['status'].replace('_', ' ')} on mobile",
                    "category": "Core Web Vitals",
                    "severity": "high" if m["status"] == "poor" else "medium",
                    "impact": "Ranking signal",
                    "desc": f"{m['poor_pct']}% of users experiencing poor {label}",
                    "screen": "cwv"
                })

        return {"issues": issues}
    except Exception as e:
        return {"issues": [], "error": str(e)}

@router.get("/cwv-summary")
async def get_cwv_summary(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["cwv"]
    try:
        return await crux_service.get_cwv(site_url)
    except Exception as e:
        return {"mobile": {}, "desktop": {}, "poor_pages": 0, "top_issues": [], "error": str(e)}

@router.get("/enhancements")
async def get_enhancements(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return {"enhancements": DEMO_DATA["enhancements"]}
    # GSC Enhancements API not publicly available — return honest empty state
    return {
        "enhancements": [],
        "not_available": True,
        "message": "Schema enhancement data requires manual GSC access. Check Search Console > Enhancements for your site."
    }

@router.get("/coverage")
async def get_coverage(site_url: str, authorization: str = Header(None)):
    token = get_token(authorization)
    if token == "demo":
        return DEMO_DATA["coverage"]
    try:
        token_data = decode_token(token)
        return coverage_service.get_real_coverage(token_data, site_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
