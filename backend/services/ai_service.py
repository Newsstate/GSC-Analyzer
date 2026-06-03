"""
AI Analysis service using real Claude API.
Generates streaming diagnoses, fix plans, and recommendations.
"""
import anthropic
import json
import os
from typing import AsyncIterator

client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT = """You are an expert SEO and technical web analyst. You have deep knowledge of:
- Google Search Console data interpretation
- Core Web Vitals and page experience signals  
- Structured data / schema markup
- Crawling, indexing, and canonicalization
- Search ranking factors and CTR optimization

When analyzing data, you:
1. Identify the ROOT CAUSE, not just symptoms
2. Quantify impact where possible (estimated clicks lost/gained)
3. Give SPECIFIC, actionable recommendations with exact code when relevant
4. Prioritize fixes by business impact × implementation ease
5. Speak plainly — no jargon without explanation

Format your responses with **bold** for key findings and `code` for technical terms/code snippets.
Keep responses focused and scannable. Lead with the most important insight."""

async def stream_diagnosis(data: dict) -> AsyncIterator[str]:
    """Stream overall site diagnosis based on all GSC data."""
    prompt = f"""Analyze this Google Search Console data and provide a concise diagnosis:

OVERVIEW (last 28 days vs previous 28 days):
- Clicks: {data.get('clicks', {}).get('value', 0):,} ({data.get('clicks', {}).get('delta', 0):+.1f}%)
- Impressions: {data.get('impressions', {}).get('value', 0):,} ({data.get('impressions', {}).get('delta', 0):+.1f}%)
- CTR: {data.get('ctr', {}).get('value', 0):.1f}% ({data.get('ctr', {}).get('delta', 0):+.2f}pp)
- Avg Position: {data.get('position', {}).get('value', 0):.1f} ({data.get('position', {}).get('delta', 0):+.1f})

TOP DECLINING PAGES (if any):
{json.dumps(data.get('declining_pages', [])[:5], indent=2)}

ACTIVE ISSUES:
{json.dumps(data.get('issues', [])[:8], indent=2)}

TOP OPPORTUNITIES (pos 4-20 keywords):
{json.dumps(data.get('opportunities', [])[:5], indent=2)}

In 3-4 sentences: What's the primary story? What's the root cause of any drops? What's the single highest-impact action to take this week?"""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_index_fix(data: dict) -> AsyncIterator[str]:
    """Stream diagnosis and fix plan for index coverage issues."""
    prompt = f"""Analyze these index coverage issues for {data.get('site_url', 'this site')}:

COVERAGE SUMMARY:
- Valid pages: {data.get('valid', 0):,}
- Excluded: {data.get('excluded', 0):,}  
- Errors: {data.get('errors', 0):,}

ISSUE BREAKDOWN:
{json.dumps(data.get('breakdown', []), indent=2)}

SAMPLE URL INSPECTION RESULTS:
{json.dumps(data.get('url_inspections', [])[:5], indent=2)}

Provide:
1. Root cause analysis (what's causing the biggest index coverage problem)
2. Estimated traffic impact
3. Step-by-step fix plan with specific code/config changes
4. How to verify the fix worked"""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_sitemap_fix(data: dict) -> AsyncIterator[str]:
    """Stream sitemap audit and fix recommendations."""
    prompt = f"""Audit these sitemap issues for {data.get('site_url', 'this site')}:

SITEMAPS:
{json.dumps(data.get('sitemaps', []), indent=2)}

DETECTED ISSUES:
{json.dumps(data.get('issues', []), indent=2)}

Provide:
1. What's causing the gap between submitted and indexed URLs
2. Which sitemap problems to fix first (prioritized by impact)
3. Specific steps to fix each issue
4. Best practices for this site's sitemap structure going forward"""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_cwv_fix(data: dict) -> AsyncIterator[str]:
    """Stream Core Web Vitals diagnosis and fixes."""
    prompt = f"""Analyze Core Web Vitals for {data.get('site_url', 'this site')}:

VITAL SCORES (mobile):
- LCP: {data.get('lcp', 'unknown')}s (Good: ≤2.5s, Poor: >4s)
- INP: {data.get('inp', 'unknown')}ms (Good: ≤200ms, Poor: >500ms)
- CLS: {data.get('cls', 'unknown')} (Good: ≤0.1, Poor: >0.25)

AFFECTED PAGES: {data.get('poor_pages', 0)} pages failing

TOP FAILING PAGES:
{json.dumps(data.get('top_pages', [])[:5], indent=2)}

Provide:
1. Which vital is causing the most damage and why
2. Most likely root causes for each failing vital (LCP = images/fonts/CSS, CLS = dynamic content, INP = JS)
3. Specific code fixes with before/after examples
4. Priority order for implementation"""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_opportunities(data: dict) -> AsyncIterator[str]:
    """Stream keyword opportunity analysis."""
    prompt = f"""Analyze these keyword opportunities for {data.get('site_url', 'this site')}:

TOP OPPORTUNITIES (keywords in positions 4-20):
{json.dumps(data.get('keywords', [])[:15], indent=2)}

TOTAL RECOVERABLE CLICKS: ~{data.get('total_opportunity', 0):,}/month

For the top 3 opportunities:
1. Why is each keyword stuck at its current position?
2. What specific on-page changes would push it to top 3?
3. Which is quickest to implement?

Be specific — reference the actual keyword text and give actionable content/SEO recommendations."""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_schema_fix(data: dict) -> AsyncIterator[str]:
    """Stream schema/enhancements fix recommendations."""
    prompt = f"""Analyze structured data issues for {data.get('site_url', 'this site')}:

ENHANCEMENT STATUS:
{json.dumps(data.get('enhancements', []), indent=2)}

For each schema type with issues:
1. What exactly is wrong and why it matters for rich results
2. The corrected JSON-LD code snippet
3. How to verify it works (Rich Results Test URL)
4. Expected impact on CTR once fixed

Also flag any missing schema types that would be high-value for this site."""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_page_analysis(url: str, inspection_data: dict) -> AsyncIterator[str]:
    """Stream deep analysis of a specific URL."""
    prompt = f"""Deep-dive analysis of this URL: {url}

URL INSPECTION RESULTS:
{json.dumps(inspection_data, indent=2)}

Provide:
1. Current indexing status and what it means
2. Any issues preventing this page from ranking well
3. Specific fixes in priority order
4. Estimated timeline for fixes to take effect"""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text

async def stream_custom_question(question: str, context: dict) -> AsyncIterator[str]:
    """Stream answer to a custom question with site context."""
    prompt = f"""Question about {context.get('site_url', 'this site')}: {question}

CURRENT SITE DATA CONTEXT:
- Clicks (28d): {context.get('clicks', 0):,}
- Impressions (28d): {context.get('impressions', 0):,}  
- Avg Position: {context.get('position', 0):.1f}
- Active issues: {context.get('issue_count', 0)}
- Top opportunity keywords: {context.get('top_keywords', [])}

Answer the question directly and specifically. If you need more data to answer fully, say what data would help."""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        async for text in stream.text_stream:
            yield text
