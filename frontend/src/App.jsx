import { useState, useEffect } from 'react'
import ConnectScreen from './pages/ConnectScreen'
import Dashboard from './pages/Dashboard'
import { Performance, IndexCoverage, IndexFix, Sitemaps, CoreWebVitals, Enhancements, Opportunities } from './pages/Pages'
import Sidebar from './components/Sidebar'
import { useGSCData } from './hooks/useGSCData'
import { gsc } from './lib/api'
import { RefreshCw, ChevronDown } from 'lucide-react'

// ─── Auth callback handler ────────────────────────────────────────────────────
function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (token && window.location.pathname === '/auth/callback') {
    try {
      const decoded = JSON.parse(atob(token))
      localStorage.setItem('gsc_token', token)
      localStorage.setItem('gsc_user', JSON.stringify({ email: decoded.email, name: decoded.name }))
      window.history.replaceState({}, '', '/')
      return decoded
    } catch {}
  }
  return null
}

function SiteSelector({ sites, current, onChange }) {
  const [open, setOpen] = useState(false)
  const display = current ? current.replace(/https?:\/\//, '').replace(/\/$/, '') : 'Select site'
  return (
    <div style={{ position:'relative' }}>
      <button className="btn" style={{ fontSize:12,padding:'5px 12px',gap:6 }} onClick={() => setOpen(o => !o)}>
        {display} <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{ position:'absolute',top:'calc(100% + 6px)',right:0,background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--rl)',padding:6,minWidth:220,zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          {sites.map(s => (
            <button key={s} onClick={() => { onChange(s); setOpen(false) }} style={{ width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:'var(--r)',fontSize:12,fontFamily:'var(--mono)',color:s===current?'var(--accent)':'var(--text2)',background:s===current?'var(--bg4)':'transparent',cursor:'pointer',transition:'var(--tr)',border:'none' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
              onMouseLeave={e=>e.currentTarget.style.background=s===current?'var(--bg4)':'transparent'}>
              {s.replace(/https?:\/\//,'').replace(/\/$/,'')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [site, setSite] = useState('')
  const [sites, setSites] = useState([])
  const [page, setPage] = useState('dashboard')
  const [syncing, setSyncing] = useState(false)

  // Check existing session or OAuth callback
  useEffect(() => {
    const cb = handleAuthCallback()
    const token = localStorage.getItem('gsc_token')
    const savedSite = localStorage.getItem('gsc_site')
    if (token) {
      setAuthed(true)
      if (savedSite) setSite(savedSite)
      // Load sites list
      gsc.sites().then(r => {
        setSites(r.sites || [])
        if (!savedSite && r.sites?.[0]) {
          setSite(r.sites[0])
          localStorage.setItem('gsc_site', r.sites[0])
        }
      }).catch(() => {})
    }
  }, [])

  const { data, loading, errors, loadOverview, loadTimeseries, loadPages, loadQueries,
    loadOpportunities, loadCoverage, loadSitemaps, loadIssues, loadCWV, loadEnhancements, refetchAll } = useGSCData(site)

  const handleConnect = ({ site: s, user }) => {
    setAuthed(true)
    setSite(s)
    setSites([s])
    localStorage.setItem('gsc_site', s)
    // After connect, fetch sites list
    gsc.sites().then(r => {
      setSites(r.sites || [s])
    }).catch(() => {})
  }

  const handleDisconnect = () => {
    localStorage.clear()
    setAuthed(false); setSite(''); setSites([]); setPage('dashboard')
  }

  const handleSiteChange = (s) => {
    setSite(s)
    localStorage.setItem('gsc_site', s)
    setPage('dashboard')
  }

  const handleSync = () => {
    setSyncing(true)
    refetchAll()
    setTimeout(() => setSyncing(false), 2000)
  }

  if (!authed) return <ConnectScreen onConnect={handleConnect} />

  const load = { pages: loadPages, queries: loadQueries, opportunities: loadOpportunities, coverage: loadCoverage, sitemaps: loadSitemaps, cwv: loadCWV, enhancements: loadEnhancements }

  const pageProps = { data, loading, site, load, onNav: setPage }

  const PAGES = {
    dashboard:    <Dashboard {...pageProps} refetch={handleSync} />,
    performance:  <Performance {...pageProps} />,
    coverage:     <IndexCoverage {...pageProps} />,
    'index-fix':  <IndexFix {...pageProps} />,
    sitemap:      <Sitemaps {...pageProps} />,
    cwv:          <CoreWebVitals {...pageProps} />,
    enhancements: <Enhancements {...pageProps} />,
    opportunities:<Opportunities {...pageProps} />,
  }

  const issueCounts = {
    errors: { coverage: data.coverage?.summary?.errors || 0, cwv: data.cwv?.poor_pages || 0, enhancements: (data.enhancements?.enhancements||[]).filter(e=>e.errors>0).reduce((s,e)=>s+e.errors,0) },
    warnings: { sitemap: (data.sitemaps?.sitemaps||[]).reduce((s,sm)=>s+sm.warnings,0) }
  }

  return (
    <div style={{ display:'flex',minHeight:'100vh' }}>
      <Sidebar active={page} onNav={setPage} site={site} issueCount={issueCounts} onDisconnect={handleDisconnect} />
      <main style={{ flex:1,overflowY:'auto',minWidth:0,display:'flex',flexDirection:'column' }}>
        {/* Topbar */}
        <div style={{ position:'sticky',top:0,zIndex:20,background:'rgba(9,9,12,0.85)',backdropFilter:'blur(14px)',borderBottom:'1px solid var(--border)',padding:'9px 28px',display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10 }}>
          {sites.length > 1 && <SiteSelector sites={sites} current={site} onChange={handleSiteChange} />}
          <span style={{ fontSize:11,color:'var(--text3)' }}>GSC data live</span>
          <button className="btn" onClick={handleSync} style={{ fontSize:12,padding:'5px 12px' }}>
            <RefreshCw size={13} style={{ animation:syncing?'spin .7s linear infinite':'none' }} />
            {syncing?'Syncing…':'Sync'}
          </button>
        </div>
        {/* Content */}
        <div style={{ padding:'26px 28px 48px',maxWidth:1100,width:'100%' }}>
          {PAGES[page] || PAGES['dashboard']}
        </div>
      </main>
    </div>
  )
}
