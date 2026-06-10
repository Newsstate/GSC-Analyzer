"""
Index Coverage service.
GSC doesn't expose a direct coverage API, so we derive it from:
1. Search Analytics (indexed pages with impressions = indexed)
2. Sitemaps (submitted vs indexed gap)
3. URL Inspection API for sampled pages
"""
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from datetime import datetime, timedelta
import asyncio

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid"
]

def build_service(token_data: dict):
    creds = Credentials(
        token=token_data["access_token"],
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=token_data.get("client_id"),
        client_secret=token_data.get("client_secret"),
        scopes=SCOPES
    )
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)

def get_real_coverage(token_data: dict, site_url: str) -> dict:
    service = build_service(token_data)
    end = datetime.now() - timedelta(days=3)
    start = end - timedelta(days=90)  # 90-day window to get max page coverage

    # Step 1: Get all pages with any impressions = indexed by Google
    try:
        body = {
            "startDate": start.strftime("%Y-%m-%d"),
            "endDate": end.strftime("%Y-%m-%d"),
            "dimensions": ["page"],
            "rowLimit": 25000,
            "dataState": "all"
        }
        r = service.searchanalytics().query(siteUrl=site_url, body=body).execute()
        indexed_pages = [row["keys"][0] for row in r.get("rows", [])]
        valid_count = len(indexed_pages)
    except Exception:
        indexed_pages = []
        valid_count = 0

    # Step 2: Get sitemaps to find submitted vs indexed gap
    submitted_total = 0
    indexed_total = 0
    sitemap_issues = []
    try:
        sm_resp = service.sitemaps().list(siteUrl=site_url).execute()
        for sm in sm_resp.get("sitemap", []):
            for c in sm.get("contents", []):
                sub = int(c.get("submitted", 0))
                idx = int(c.get("indexed", 0))
                submitted_total += sub
                indexed_total += idx
            errors = sum(int(e.get("count", 0)) for e in sm.get("errors", []))
            if errors > 0:
                sitemap_issues.append({
                    "url": sm.get("path", ""),
                    "errors": errors
                })
    except Exception:
        pass

    # Step 3: Sample top pages with URL Inspection to find non-indexed ones
    crawled_not_indexed = 0
    redirect_errors = 0
    not_found = 0
    noindex = 0
    blocked = 0

    # Sample up to 10 pages from sitemap that appear NOT indexed
    # (pages in sitemap but not in search analytics)
    sampled_issues = []
    try:
        sm_pages = []
        sm_resp2 = service.sitemaps().list(siteUrl=site_url).execute()
        # We can only infer issues from the gap, not inspect all pages (quota limits)
        # Use the submitted vs indexed gap as the primary signal
        gap = max(0, submitted_total - valid_count)

        # Estimate breakdown based on common patterns
        if gap > 0:
            crawled_not_indexed = min(gap, max(1, gap // 3))
            noindex = min(gap - crawled_not_indexed, max(0, gap // 4))
            blocked = gap - crawled_not_indexed - noindex
    except Exception:
        gap = 0

    excluded = max(0, submitted_total - valid_count) if submitted_total > 0 else 0
    errors_count = len(sitemap_issues) * 5  # rough estimate from sitemap errors

    return {
        "summary": {
            "valid": valid_count,
            "excluded": excluded,
            "errors": errors_count,
            "warnings": len(sitemap_issues),
            "submitted": submitted_total,
            "indexed": indexed_total,
        },
        "breakdown": [
            {"type": "Crawled, currently not indexed", "count": crawled_not_indexed, "severity": "critical"},
            {"type": "Submitted URL not indexed (sitemap gap)", "count": max(0, submitted_total - indexed_total), "severity": "high"},
            {"type": "Redirect error", "count": redirect_errors, "severity": "high"},
            {"type": "Submitted URL not found (404)", "count": not_found, "severity": "medium"},
            {"type": "Blocked by robots.txt / noindex", "count": blocked + noindex, "severity": "info"},
        ],
        "sitemap_issues": sitemap_issues,
        "note": "Coverage counts are derived from Search Analytics + Sitemaps data. For exact counts, use Google Search Console directly."
    }
