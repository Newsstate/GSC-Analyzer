"""
Chrome UX Report (CrUX) API service.
Fetches real Core Web Vitals data. No auth needed — uses API key.
Get a free key at: https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started
"""
import httpx
import os

CRUX_API = "https://chromeuxreport.googleapis.com/v1/records:queryRecord"

def _status(value, metric):
    thresholds = {
        "lcp":  (2500, 4000),   # ms
        "inp":  (200,  500),    # ms
        "cls":  (0.1,  0.25),   # score
        "fcp":  (1800, 3000),   # ms
        "ttfb": (800,  1800),   # ms
    }
    good, poor = thresholds.get(metric, (0, 0))
    if value <= good:
        return "good"
    if value <= poor:
        return "needs_improvement"
    return "poor"

def _extract(data: dict, metric_key: str) -> dict | None:
    metric = data.get("metrics", {}).get(metric_key)
    if not metric:
        return None
    hist = metric.get("histogram", [])
    p75 = metric.get("percentiles", {}).get("p75")
    if p75 is None:
        return None
    # CrUX returns ms for LCP/FCP/TTFB/INP, score for CLS
    short = metric_key.lower().replace("largest_contentful_paint", "lcp") \
                               .replace("interaction_to_next_paint", "inp") \
                               .replace("cumulative_layout_shift", "cls") \
                               .replace("first_contentful_paint", "fcp") \
                               .replace("experimental_time_to_first_byte", "ttfb")
    # Convert ms to seconds for LCP/FCP/TTFB
    display_val = round(p75 / 1000, 2) if short in ("lcp", "fcp", "ttfb") else p75
    return {
        "value": display_val,
        "p75": p75,
        "status": _status(p75 if short == "cls" else p75, short),
        "good_pct": round(hist[0].get("density", 0) * 100, 1) if hist else 0,
        "ni_pct":   round(hist[1].get("density", 0) * 100, 1) if len(hist) > 1 else 0,
        "poor_pct": round(hist[2].get("density", 0) * 100, 1) if len(hist) > 2 else 0,
    }

async def get_cwv(site_url: str) -> dict:
    """Fetch CWV for origin (mobile + desktop)."""
    api_key = os.getenv("CRUX_API_KEY", "")
    # Strip to origin only
    from urllib.parse import urlparse
    parsed = urlparse(site_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    results = {"mobile": {}, "desktop": {}, "poor_pages": 0, "needs_work": 0, "good": 0, "top_issues": [], "not_enough_data": False}

    async with httpx.AsyncClient(timeout=15) as client:
        for form_factor in ("PHONE", "DESKTOP"):
            key = "mobile" if form_factor == "PHONE" else "desktop"
            try:
                params = {"key": api_key} if api_key else {}
                resp = await client.post(
                    CRUX_API,
                    params=params,
                    json={"origin": origin, "formFactor": form_factor}
                )
                if resp.status_code == 404:
                    results[key] = {"not_enough_data": True}
                    continue
                if resp.status_code != 200:
                    results[key] = {"error": f"CrUX API returned {resp.status_code}"}
                    continue

                data = resp.json().get("record", {})
                lcp  = _extract(data, "largest_contentful_paint")
                inp  = _extract(data, "interaction_to_next_paint")
                cls_ = _extract(data, "cumulative_layout_shift")
                fcp  = _extract(data, "first_contentful_paint")
                ttfb = _extract(data, "experimental_time_to_first_byte")

                results[key] = {
                    k: v for k, v in
                    {"lcp": lcp, "inp": inp, "cls": cls_, "fcp": fcp, "ttfb": ttfb}.items()
                    if v is not None
                }

                # Count poor vitals for mobile
                if form_factor == "PHONE":
                    for m in [lcp, inp, cls_]:
                        if m:
                            if m["status"] == "poor":
                                results["poor_pages"] += 1
                            elif m["status"] == "needs_improvement":
                                results["needs_work"] += 1
                            else:
                                results["good"] += 1

                    # Build top issues list
                    issues = []
                    if lcp and lcp["status"] in ("poor", "needs_improvement"):
                        issues.append({"metric": "LCP", "value": lcp["value"], "status": lcp["status"], "poor_pct": lcp["poor_pct"]})
                    if cls_ and cls_["status"] in ("poor", "needs_improvement"):
                        issues.append({"metric": "CLS", "value": cls_["value"], "status": cls_["status"], "poor_pct": cls_["poor_pct"]})
                    if inp and inp["status"] in ("poor", "needs_improvement"):
                        issues.append({"metric": "INP", "value": inp["value"], "status": inp["status"], "poor_pct": inp["poor_pct"]})
                    results["top_issues"] = issues

            except Exception as e:
                results[key] = {"error": str(e)}

    return results
