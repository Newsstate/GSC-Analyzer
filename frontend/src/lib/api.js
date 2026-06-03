const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('gsc_token') || ''
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`, { headers: headers() })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: headers(), body: JSON.stringify(body)
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function stream(path, body, onChunk) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: headers(), body: JSON.stringify(body)
  })
  if (!r.ok) throw new Error(await r.text())
  const reader = r.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value))
  }
}

// Auth
export const auth = {
  getGoogleUrl: () => get('/api/auth/google'),
  demo: () => get('/api/auth/demo'),
}

// GSC data
export const gsc = {
  sites: () => get('/api/gsc/sites'),
  overview: (site, days=28) => get(`/api/gsc/overview?site_url=${encodeURIComponent(site)}&days=${days}`),
  timeseries: (site, days=28) => get(`/api/gsc/timeseries?site_url=${encodeURIComponent(site)}&days=${days}`),
  pages: (site, days=28) => get(`/api/gsc/pages?site_url=${encodeURIComponent(site)}&days=${days}`),
  queries: (site, days=28) => get(`/api/gsc/queries?site_url=${encodeURIComponent(site)}&days=${days}`),
  opportunities: (site, days=28) => get(`/api/gsc/opportunities?site_url=${encodeURIComponent(site)}&days=${days}`),
  coverage: (site) => get(`/api/gsc/coverage?site_url=${encodeURIComponent(site)}`),
  inspect: (site, url) => get(`/api/gsc/inspect?site_url=${encodeURIComponent(site)}&page_url=${encodeURIComponent(url)}`),
  sitemaps: (site) => get(`/api/gsc/sitemaps?site_url=${encodeURIComponent(site)}`),
}

// Analysis
export const analysis = {
  issues: (site) => get(`/api/analysis/issues?site_url=${encodeURIComponent(site)}`),
  cwv: (site) => get(`/api/analysis/cwv-summary?site_url=${encodeURIComponent(site)}`),
  enhancements: (site) => get(`/api/analysis/enhancements?site_url=${encodeURIComponent(site)}`),
}

// AI streaming
export const ai = {
  diagnosis: (data, onChunk) => stream('/api/ai/diagnosis', data, onChunk),
  indexFix: (data, onChunk) => stream('/api/ai/index-fix', data, onChunk),
  sitemapFix: (data, onChunk) => stream('/api/ai/sitemap-fix', data, onChunk),
  cwv: (data, onChunk) => stream('/api/ai/cwv', data, onChunk),
  opportunities: (data, onChunk) => stream('/api/ai/opportunities', data, onChunk),
  schema: (data, onChunk) => stream('/api/ai/schema', data, onChunk),
  ask: (data, onChunk) => stream('/api/ai/ask', data, onChunk),
}
