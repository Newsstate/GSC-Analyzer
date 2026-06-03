"""Full demo dataset used when token == 'demo'."""

DEMO_DATA = {
    "overview": {
        "current": {"clicks": 48320, "impressions": 1240000, "ctr": 3.9, "position": 14.2},
        "previous": {"clicks": 55180, "impressions": 1202000, "ctr": 4.7, "position": 12.1},
        "deltas": {"clicks": -12.4, "impressions": 3.1, "ctr": -0.8, "position": -2.1}
    },
    "timeseries": {
        "labels": ["Oct 1","Oct 2","Oct 3","Oct 4","Oct 5","Oct 6","Oct 7","Oct 8","Oct 9","Oct 10","Oct 11","Oct 12","Oct 13","Oct 14","Oct 15","Oct 16","Oct 17","Oct 18","Oct 19","Oct 20","Oct 21","Oct 22","Oct 23","Oct 24","Oct 25","Oct 26","Oct 27","Oct 28"],
        "clicks": [1680,1720,1640,1580,1700,1820,1750,1690,1580,1620,1550,1480,1510,1600,1550,1490,1430,1460,1390,1420,1460,1520,1480,1510,1540,1580,1560,1600],
        "prevClicks": [1820,1790,1810,1830,1800,1850,1830,1810,1820,1840,1860,1850,1830,1820,1810,1800,1820,1840,1860,1830,1800,1820,1840,1850,1830,1810,1820,1800],
        "impressions": [42000,43500,41200,40800,44000,46000,44500,43000,41500,42800,41000,39500,40200,42000,40800,39200,37800,38500,36900,37600,38500,40000,39200,40100,41000,42000,41200,42000],
        "positions": [12.1,12.4,12.8,13.0,13.2,13.5,13.3,13.1,13.4,13.8,14.0,14.2,14.5,14.3,14.1,14.4,14.6,14.8,15.0,14.9,14.7,14.5,14.3,14.2,14.0,14.1,14.2,14.2]
    },
    "top_pages": [
        {"page": "/blog/best-standing-desks-2024", "clicks": 4820, "impressions": 62000, "ctr": 7.8, "position": 2.1},
        {"page": "/product/wireless-headphones-pro", "clicks": 3240, "impressions": 48000, "ctr": 6.8, "position": 3.4},
        {"page": "/category/home-office", "clicks": 2880, "impressions": 71000, "ctr": 4.1, "position": 5.2},
        {"page": "/blog/crm-software-comparison", "clicks": 2340, "impressions": 55000, "ctr": 4.3, "position": 4.8},
        {"page": "/product/ergonomic-chair-lumbar", "clicks": 1920, "impressions": 38000, "ctr": 5.1, "position": 3.9},
        {"page": "/blog/remote-work-tools-2024", "clicks": 1680, "impressions": 44000, "ctr": 3.8, "position": 6.1},
        {"page": "/category/monitors", "clicks": 1540, "impressions": 52000, "ctr": 3.0, "position": 7.2},
    ],
    "queries": [
        {"keyword": "best crm software 2024", "clicks": 1042, "impressions": 24800, "ctr": 4.2, "position": 5.0, "positionDelta": -1.2, "opportunity": 1100},
        {"keyword": "how to export google contacts", "clicks": 564, "impressions": 18200, "ctr": 3.1, "position": 7.0, "positionDelta": -0.8, "opportunity": 820},
        {"keyword": "project management templates free", "clicks": 409, "impressions": 14600, "ctr": 2.8, "position": 9.0, "positionDelta": -0.3, "opportunity": 640},
        {"keyword": "salesforce alternatives small business", "clicks": 217, "impressions": 11400, "ctr": 1.9, "position": 11.0, "positionDelta": 0.4, "opportunity": 390},
        {"keyword": "email automation tools comparison", "clicks": 129, "impressions": 9200, "ctr": 1.4, "position": 14.0, "positionDelta": -0.6, "opportunity": 280},
        {"keyword": "remote team collaboration software", "clicks": 334, "impressions": 8800, "ctr": 3.8, "position": 6.0, "positionDelta": 0.2, "opportunity": 520},
    ],
    "opportunities": [
        {"keyword": "best crm software 2024", "clicks": 1042, "impressions": 24800, "ctr": 4.2, "position": 5.0, "positionDelta": -1.2, "opportunity": 1100},
        {"keyword": "how to export google contacts", "clicks": 564, "impressions": 18200, "ctr": 3.1, "position": 7.0, "positionDelta": -0.8, "opportunity": 820},
        {"keyword": "remote team collaboration software", "clicks": 334, "impressions": 8800, "ctr": 3.8, "position": 6.0, "positionDelta": 0.2, "opportunity": 520},
        {"keyword": "project management templates free", "clicks": 409, "impressions": 14600, "ctr": 2.8, "position": 9.0, "positionDelta": -0.3, "opportunity": 640},
        {"keyword": "salesforce alternatives small business", "clicks": 217, "impressions": 11400, "ctr": 1.9, "position": 11.0, "positionDelta": 0.4, "opportunity": 390},
        {"keyword": "email automation tools comparison", "clicks": 129, "impressions": 9200, "ctr": 1.4, "position": 14.0, "positionDelta": -0.6, "opportunity": 280},
        {"keyword": "monday.com vs asana review", "clicks": 192, "impressions": 7400, "ctr": 2.6, "position": 8.0, "positionDelta": -1.1, "opportunity": 360},
        {"keyword": "small business invoicing software", "clicks": 117, "impressions": 6900, "ctr": 1.7, "position": 12.0, "positionDelta": 0.1, "opportunity": 240},
    ],
    "coverage": {
        "summary": {"valid": 1840, "excluded": 486, "errors": 230, "warnings": 44},
        "breakdown": [
            {"type": "Crawled, currently not indexed", "count": 34, "severity": "critical"},
            {"type": "Duplicate without canonical tag", "count": 82, "severity": "high"},
            {"type": "Redirect error", "count": 12, "severity": "high"},
            {"type": "Submitted URL not found (404)", "count": 8, "severity": "medium"},
            {"type": "Soft 404", "count": 6, "severity": "medium"},
            {"type": "Blocked by robots.txt", "count": 194, "severity": "info"},
            {"type": "Noindex tag", "count": 218, "severity": "info"},
            {"type": "Alternate page (hreflang)", "count": 74, "severity": "info"},
        ]
    },
    "url_inspection": {
        "url": "https://example.com/product/wireless-headphones-pro",
        "coverageState": "Crawled - currently not indexed",
        "robotsTxtState": "ALLOWED",
        "indexingState": "INDEXING_ALLOWED",
        "pageFetchState": "SUCCESSFUL",
        "googleCanonical": "https://example.com/shop/product/wireless-headphones-pro",
        "userCanonical": "https://example.com/shop/product/wireless-headphones-pro",
        "verdict": "NEUTRAL",
        "mobileUsability": "MOBILE_FRIENDLY"
    },
    "sitemaps": [
        {"url": "/sitemap.xml", "lastSubmitted": "Oct 10, 2024", "warnings": 2, "errors": 1, "contents": [{"type": "web", "submitted": 2180, "indexed": 1840}]},
        {"url": "/sitemap-blog.xml", "lastSubmitted": "Sep 28, 2024", "warnings": 0, "errors": 0, "contents": [{"type": "web", "submitted": 340, "indexed": 298}]},
        {"url": "/sitemap-products.xml", "lastSubmitted": "Oct 10, 2024", "warnings": 1, "errors": 1, "contents": [{"type": "web", "submitted": 680, "indexed": 612}]},
    ],
    "cwv": {
        "mobile": {"lcp": {"value": 3.8, "status": "poor"}, "inp": {"value": 142, "status": "good"}, "cls": {"value": 0.24, "status": "poor"}},
        "desktop": {"lcp": {"value": 1.9, "status": "good"}, "inp": {"value": 88, "status": "good"}, "cls": {"value": 0.08, "status": "good"}},
        "poor_pages": 42, "needs_work": 38, "good": 178,
        "top_issues": [
            {"page": "/category/home-office", "lcp": 5.2, "cls": 0.31, "inp": 168, "issue": "Hero image 920KB unoptimised"},
            {"page": "/category/monitors", "lcp": 4.8, "cls": 0.28, "inp": 145, "issue": "Hero image 840KB + web font block"},
            {"page": "/blog/best-standing-desks-2024", "lcp": 4.1, "cls": 0.19, "inp": 122, "issue": "Render-blocking JS above fold"},
            {"page": "/", "lcp": 3.9, "cls": 0.22, "inp": 134, "issue": "Ad unit no reserved space"},
            {"page": "/deals", "lcp": 4.4, "cls": 0.18, "inp": 155, "issue": "Multiple large images, no lazy load"},
        ]
    },
    "enhancements": [
        {"type": "Product", "valid": 612, "warnings": 0, "errors": 8, "issue": "Missing offers.price and offers.availability fields"},
        {"type": "FAQ", "valid": 34, "warnings": 3, "errors": 0, "issue": "Question text exceeds 250 chars on 3 pages"},
        {"type": "Breadcrumb", "valid": 188, "warnings": 1, "errors": 0, "issue": "1 page has incorrect ListItem position ordering"},
        {"type": "Review", "valid": 0, "warnings": 0, "errors": 0, "issue": "Not implemented — high opportunity"},
        {"type": "Video", "valid": 12, "warnings": 0, "errors": 0, "issue": ""},
    ],
    "issues_queue": [
        {"id": "idx-canonical", "title": "34 product pages: crawled, not indexed", "category": "Index Coverage", "severity": "critical", "impact": "-6,200 clicks/mo", "desc": "Canonical tag pointing to /shop/ prefix (404). Template fix required.", "screen": "coverage"},
        {"id": "snippet-loss", "title": "18 blog pages lost featured snippet", "category": "Performance", "severity": "high", "impact": "-3,100 clicks/mo", "desc": "Answer blocks removed in last CMS deploy. Competitors now hold these snippets.", "screen": "performance"},
        {"id": "cwv-lcp", "title": "LCP above 4s on 42 pages", "category": "Core Web Vitals", "severity": "high", "impact": "Ranking suppression", "desc": "Unoptimised hero images (avg 820KB) on category and landing pages.", "screen": "cwv"},
        {"id": "sitemap-errors", "title": "68 URLs in sitemap not indexed", "category": "Sitemaps", "severity": "high", "impact": "-2,800 clicks/mo", "desc": "Sitemap submitted Oct 10 contains URLs with wrong canonical prefix.", "screen": "sitemap"},
        {"id": "product-schema", "title": "Product schema: missing required fields", "category": "Enhancements", "severity": "medium", "impact": "Rich result loss", "desc": "8 product pages missing offers.price and offers.availability.", "screen": "enhancements"},
        {"id": "cls-shift", "title": "CLS 0.24 — layout shift on all pages", "category": "Core Web Vitals", "severity": "medium", "impact": "UX + ranking signal", "desc": "Late-loading ad unit and web font causing cumulative layout shift.", "screen": "cwv"},
        {"id": "dup-canonical", "title": "82 pages: duplicate without canonical", "category": "Index Coverage", "severity": "medium", "impact": "Diluted authority", "desc": "Pagination and filter URLs generating duplicates without rel=canonical.", "screen": "coverage"},
        {"id": "faq-schema", "title": "FAQ schema warnings on 3 pages", "category": "Enhancements", "severity": "low", "impact": "Rich result degraded", "desc": "Question text over 250 char limit. Trim or split questions.", "screen": "enhancements"},
    ],
    "ai_diagnosis": "Traffic dropped **12.4%** despite impressions growing +3.1% — this is a **CTR problem, not a visibility problem.**\n\nThe drop concentrates in two areas: **18 blog pages** lost featured snippet positions between Oct 12–14 (correlates with CMS deploy on Oct 12), and **34 product pages** shifted from Valid to \"Crawled, not indexed\" — triggered by a sitemap re-submission on Oct 10 that introduced a canonical mismatch.\n\nFixing the canonical template error alone is estimated to recover **~6,200 clicks/month**. Combined with restoring featured snippet answer blocks on blog content, total recoverable traffic is approximately **9,300 clicks/month** — 83% of the observed drop.",
    "ai_index_fix": "**Root cause confirmed:** after sitemap re-submission on Oct 10, the canonical tag on all `/product/` pages was changed to point to `/shop/product/` — a URL prefix that doesn't exist and returns 404. Google follows canonicals strictly, so it deindexed the original URLs.\n\nAdditionally, **82 pagination and filter URLs** are generating duplicate content without proper rel=canonical tags — diluting link authority across category pages.\n\nThis is a **1-line template fix** in your CMS. The duplicate canonicals need a sitemap-level filter configuration.",
    "ai_sitemap": "The sitemap submitted on **Oct 10** is the root cause of your index coverage drop. After submission, Googlebot recrawled product pages and found canonical tags pointing to `/shop/product/` — a URL prefix that was never live.\n\n**Three issues in priority order:**\n1. Remove /shop/ prefix from canonical template (unblocks 68 pages)\n2. Remove 14 redirect URLs from sitemap and replace with final destinations\n3. Delete 3 discontinued product URLs from sitemap to stop 404 crawl waste\n\nAfter the template fix is deployed, resubmit the sitemap and use URL Inspection to request indexing on the top 10 affected pages manually. Full recovery expected in 7–14 days.",
    "ai_cwv": "**42 pages fail Core Web Vitals on mobile** — concentrated on category and landing pages.\n\n**LCP (3.8s avg):** Root cause is unoptimised hero images averaging 820KB. Converting to WebP and adding `loading=\"lazy\"` on below-fold images would bring LCP to ~1.9s across all affected pages.\n\n**CLS (0.24):** Two causes: a late-loading ad unit with no reserved space, and web fonts loading without `font-display: swap`. Both are 1-line fixes.\n\n**INP (142ms — passing):** Currently fine. No action needed here.\n\nFixing LCP and CLS alone would move 38 of 42 pages from \"Poor\" to \"Good\" — qualifying for the Core Web Vitals ranking signal benefit.",
    "ai_opportunities": "**Your biggest quick-win cluster is positions 4–8** — 5 keywords with combined impressions of 78,000/month where moving from position 5–8 to top 3 would recover approximately **3,270 clicks/month** with no new content needed.\n\nThe pattern across these pages: they rank well because they have topical authority, but their on-page optimisation is thin. Specifically:\n- No clear answer block in the first 150 words (hurts featured snippet eligibility)\n- Title tags don't include the year or a differentiator\n- Internal linking to these pages is weak — averaging 3 internal links vs competitors at 8–12\n\n**Highest single opportunity:** \"best crm software 2024\" at position 5 with 24,800 impressions. A title tag update + adding a comparison table above the fold is estimated to push this to position 2–3.",
    "ai_schema": "**3 schema types have actionable issues:**\n\n**Product schema (8 errors — highest priority):** Missing `offers.price` and `offers.availability` fields. These are required for Google Shopping rich results. Without them, your products cannot show star ratings, price, or availability in SERPs.\n\n**FAQ schema (3 warnings):** Question text exceeds Google's 250-character recommendation on 3 pages. Google may truncate or suppress the rich result. Fix: shorten question text or split into two separate FAQ entries.\n\n**Review schema (not implemented):** You have 240+ product pages with user reviews but no Review schema. Star ratings in SERPs typically increase CTR by 15–30%."
}
