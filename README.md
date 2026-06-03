# GSC Intelligence Tool

AI-powered Google Search Console analysis tool. Connects to your real GSC account, fetches live data, and uses Claude AI to diagnose traffic drops, index issues, and growth opportunities — with streaming fix plans.

---

## What it does

- **Dashboard** — clicks, impressions, CTR, position vs previous period + AI diagnosis
- **Performance** — top pages and queries with trend arrows
- **Index Coverage** — crawl errors, canonical issues, with AI fix plans + code
- **Sitemaps** — audit all submitted sitemaps, detect errors, step-by-step fixes
- **Core Web Vitals** — LCP, INP, CLS per page with AI diagnosis
- **Enhancements** — schema errors with corrected JSON-LD code
- **Opportunities** — keywords in positions 4–20, ranked by click potential

---

## Setup (15 minutes)

### 1. Clone / extract

```bash
cd gsc-intelligence-tool
```

### 2. Google Cloud credentials

1. Go to https://console.cloud.google.com/
2. Create a project (or use existing)
3. **APIs & Services → Enable APIs** → enable:
   - Google Search Console API
   - Google OAuth2 API
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorised redirect URIs: `http://localhost:8000/api/auth/callback`
5. Copy **Client ID** and **Client Secret**

### 3. Anthropic API key

1. Go to https://console.anthropic.com/
2. Create an API key
3. Copy it

### 4. Backend setup

```bash
cd backend
pip install -r requirements.txt

# Copy and fill in your keys
cp .env.example .env
# Edit .env with your Google Client ID, Client Secret, and Anthropic API key
```

### 5. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# .env already points to http://localhost:8000 — no changes needed for local dev
```

### 6. Run

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Demo mode

Click **"Try with demo data"** on the connect screen — no Google credentials needed. Uses realistic example.com data with real Claude AI streaming.

You still need an `ANTHROPIC_API_KEY` in backend `.env` for AI panels to work, even in demo mode.

---

## Deploy to production

### Backend → Railway

1. Push backend folder to a GitHub repo
2. New Railway project → Deploy from GitHub → select backend repo
3. Add environment variables (same as .env)
4. Railway gives you a URL like `https://gsc-backend.railway.app`

### Frontend → Vercel

1. Push frontend folder to a GitHub repo
2. New Vercel project → Import repo
3. Add environment variable: `VITE_API_URL=https://gsc-backend.railway.app`
4. Deploy

### Update Google OAuth redirect URI

In Google Cloud Console → Credentials → your OAuth client:
- Add `https://gsc-backend.railway.app/api/auth/callback` to Authorised redirect URIs

---

## Project structure

```
gsc-intelligence-tool/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── auth.py             # Google OAuth flow
│   │   ├── gsc.py              # GSC data endpoints
│   │   ├── analysis.py         # Computed metrics
│   │   └── ai.py               # Claude streaming endpoints
│   └── services/
│       ├── gsc_service.py      # Real Google API calls
│       ├── ai_service.py       # Real Claude API calls
│       └── demo_data.py        # Demo dataset
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app + routing
    │   ├── lib/api.js          # All API calls
    │   ├── hooks/
    │   │   ├── useGSCData.js   # Data fetching
    │   │   └── useAIStream.js  # Real AI streaming
    │   ├── components/
    │   │   ├── AIPanel.jsx     # Streaming AI analysis
    │   │   ├── Sidebar.jsx
    │   │   ├── MetricCard.jsx
    │   │   ├── CodeBlock.jsx
    │   │   └── StepPlan.jsx
    │   └── pages/
    │       ├── ConnectScreen.jsx
    │       ├── Dashboard.jsx
    │       └── Pages.jsx       # All other pages
    └── package.json
```

---

## Stack

- **Frontend:** React + Vite + Chart.js
- **Backend:** Python FastAPI + Uvicorn
- **AI:** Anthropic Claude (real streaming)
- **Google:** Search Console API v1 + OAuth 2.0
- **Hosting:** Vercel (frontend) + Railway (backend)
