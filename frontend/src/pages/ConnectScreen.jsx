import { useState } from 'react'
import { Search, Shield, BarChart2, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { auth } from '../lib/api'

const FEATURES = [
  { icon:BarChart2, label:'Traffic drop detection', desc:'AI finds drops and explains why in seconds' },
  { icon:Search, label:'Issue auto-diagnosis', desc:'Root cause analysis for every GSC error' },
  { icon:Zap, label:'Step-by-step fix plans', desc:'Exact code and steps — no guessing' },
  { icon:Shield, label:'Read-only access only', desc:'We never modify your GSC data' },
]

export default function ConnectScreen({ onConnect }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try {
      const { auth_url } = await auth.getGoogleUrl()
      window.location.href = auth_url
    } catch (e) {
      setError('Could not reach backend. Is the server running?')
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true); setError('')
    try {
      const res = await auth.demo()
      localStorage.setItem('gsc_token', 'demo')
      localStorage.setItem('gsc_site', 'https://example.com/')
      localStorage.setItem('gsc_user', JSON.stringify({ email: res.email, name: res.name }))
      onConnect({ site: 'https://example.com/', user: res })
    } catch (e) {
      setError('Could not connect to backend. Make sure it is running on port 8000.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:24 }}>
      <div style={{ maxWidth:440,width:'100%' }}>
        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:36 }}>
          <div style={{ width:58,height:58,borderRadius:16,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px' }}>
            <Search size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize:26,fontWeight:700,letterSpacing:'-0.03em',marginBottom:10 }}>GSC Intelligence</h1>
          <p style={{ fontSize:14,color:'var(--text2)',lineHeight:1.65 }}>
            Connect your Search Console and get AI-powered diagnosis of every traffic drop, index issue, and growth opportunity — in real time.
          </p>
        </div>

        {/* Features */}
        <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:28 }}>
          {FEATURES.map(({ icon:Icon, label, desc }) => (
            <div key={label} style={{ display:'flex',alignItems:'center',gap:14,padding:'11px 14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--rl)' }}>
              <div style={{ width:34,height:34,borderRadius:10,background:'rgba(91,127,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Icon size={16} color="var(--accent)" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:500 }}>{label}</div>
                <div style={{ fontSize:12,color:'var(--text3)' }}>{desc}</div>
              </div>
              <CheckCircle size={14} color="var(--green)" style={{ flexShrink:0 }} />
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--red-bg)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:'var(--r)',marginBottom:14,fontSize:13,color:'var(--red)' }}>
            <AlertCircle size={14} />{error}
          </div>
        )}

        {/* Google OAuth button */}
        <button onClick={handleGoogle} disabled={loading} style={{ width:'100%',padding:'13px 20px',borderRadius:'var(--rl)',background:loading?'var(--bg3)':'#fff',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontSize:14,fontWeight:600,color:'#111',cursor:loading?'default':'pointer',transition:'var(--tr)',marginBottom:10 }}>
          {loading ? <><div className="spinner" style={{ borderTopColor:'#555' }} /><span style={{ color:'var(--text2)' }}>Connecting…</span></> : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Connect Google Search Console
            </>
          )}
        </button>

        {/* Demo button */}
        <button onClick={handleDemo} disabled={loading} style={{ width:'100%',padding:'10px 20px',borderRadius:'var(--rl)',background:'var(--bg2)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:13,color:'var(--text2)',cursor:'pointer',transition:'var(--tr)',marginBottom:12 }}>
          Try with demo data (example.com)
        </button>

        <p style={{ fontSize:11,color:'var(--text3)',textAlign:'center',lineHeight:1.6 }}>
          Read-only access · No data stored externally · Disconnect anytime
        </p>
      </div>
    </div>
  )
}
