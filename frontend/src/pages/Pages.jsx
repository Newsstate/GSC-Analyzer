import { useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import AIPanel from '../components/AIPanel'
import StepPlan from '../components/StepPlan'
import CodeBlock from '../components/CodeBlock'
import { TrendingUp, TrendingDown, ArrowLeft, ArrowUpDown, ChevronRight, Activity } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const opts = (reverse=false) => ({
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ display:true, labels:{ font:{ size:11 }, color:'#4a4a60', boxWidth:8, padding:10 } }, tooltip:{ mode:'index', intersect:false, backgroundColor:'#1f1f28', titleColor:'#8888a0', bodyColor:'#eeeef0', borderColor:'rgba(255,255,255,0.08)', borderWidth:1, padding:10 } },
  scales:{ x:{ ticks:{ font:{ size:10 }, color:'#4a4a60', maxTicksLimit:7 }, grid:{ color:'rgba(255,255,255,0.03)' }, border:{ display:false } }, y:{ reverse, ticks:{ font:{ size:10 }, color:'#4a4a60' }, grid:{ color:'rgba(255,255,255,0.03)' }, border:{ display:false } } }
})

// ─── PERFORMANCE ────────────────────────────────────────────────────────────

export function Performance({ data, loading, site, load }) {
  useEffect(() => { if (!data.pages) load.pages(); if (!data.queries) load.queries() }, [])
  const ts = data.timeseries
  const impChart = ts ? { labels:ts.labels, datasets:[{ label:'Impressions', data:ts.impressions, borderColor:'#a78bfa', borderWidth:2, pointRadius:0, tension:0.4, fill:true, backgroundColor:'rgba(167,139,250,0.05)' }] } : null
  const ctrChart = ts ? { labels:ts.labels, datasets:[{ label:'CTR %', data:ts.clicks.map((c,i)=>ts.impressions[i]?+(c/ts.impressions[i]*100).toFixed(2):0), borderColor:'#2dd4bf', borderWidth:2, pointRadius:0, tension:0.4, fill:true, backgroundColor:'rgba(45,212,191,0.05)' }] } : null
  const pages = data.pages?.pages || []
  const queries = data.queries?.queries || []
  return (
    <div className="animate-in">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Performance</h1>
        <p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>Search analytics · Last 28 days</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
        <div className="card"><div style={{ fontSize:13,fontWeight:500,marginBottom:14 }}>Impressions over time</div><div style={{ height:145 }}>{impChart?<Line data={impChart} options={opts()}/>:<div style={{ height:'100%',background:'var(--bg3)',borderRadius:'var(--r)',animation:'pulse 1.5s infinite' }}/>}</div></div>
        <div className="card"><div style={{ fontSize:13,fontWeight:500,marginBottom:14 }}>CTR over time</div><div style={{ height:145 }}>{ctrChart?<Line data={ctrChart} options={opts()}/>:<div style={{ height:'100%',background:'var(--bg3)',borderRadius:'var(--r)',animation:'pulse 1.5s infinite' }}/>}</div></div>
      </div>
      <DataTable title="Top pages" cols={['Page','Clicks','Impressions','CTR','Position']} rows={pages} keys={['page','clicks','impressions','ctr','position']} types={['url','num','num','pct','pos']} loading={loading.pages} />
      <div style={{ marginTop:12 }} />
      <DataTable title="Top queries" cols={['Query','Clicks','Impressions','CTR','Position','Trend']} rows={queries} keys={['keyword','clicks','impressions','ctr','position','positionDelta']} types={['text','num','num','pct','pos','delta']} loading={loading.queries} />
    </div>
  )
}

// ─── INDEX COVERAGE ──────────────────────────────────────────────────────────

export function IndexCoverage({ data, loading, site, load, onNav }) {
  useEffect(() => { if (!data.coverage) load.coverage() }, [])
  const { summary={}, breakdown=[] } = data.coverage || {}
  const total = (summary.valid||0)+(summary.excluded||0)+(summary.errors||0)
  const aiPayload = data.coverage ? { site_url:site, ...summary, breakdown } : null

  return (
    <div className="animate-in">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div><h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Index Coverage</h1><p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>{total.toLocaleString()} total URLs</p></div>
        <span className="badge badge-red">{summary.errors||0} errors</span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16 }}>
        {[{l:'Valid',v:summary.valid||0,c:'var(--green)'},{l:'Excluded',v:summary.excluded||0,c:'var(--amber)'},{l:'Error',v:summary.errors||0,c:'var(--red)'}].map(s=>(
          <div key={s.l} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:28,fontWeight:600,color:s.c,letterSpacing:'-0.02em' }}>{(s.v).toLocaleString()}</div>
            <div style={{ fontSize:12,color:'var(--text2)',marginTop:4 }}>{s.l}</div>
            <div style={{ height:4,background:'var(--bg3)',borderRadius:2,marginTop:10,overflow:'hidden' }}>
              <div style={{ height:4,width:`${total?Math.round(s.v/total*100):0}%`,background:s.c,borderRadius:2,transition:'width .8s ease' }} />
            </div>
          </div>
        ))}
      </div>
      {aiPayload && <AIPanel endpoint="indexFix" payload={aiPayload} title="AI index coverage diagnosis" actions={[{ label:'See fix steps →', fn:()=>onNav('index-fix') }]} />}
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <div style={{ padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <span style={{ fontSize:13,fontWeight:500 }}>Issue breakdown</span>
          <span style={{ fontSize:11,color:'var(--text3)' }}>Click any error for AI fix plan</span>
        </div>
        {loading.coverage ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i}/>) : breakdown.map((item,i)=>(
          <div key={i} onClick={()=>item.severity!=='info'&&onNav('index-fix')}
            style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<breakdown.length-1?'1px solid var(--border)':'none',cursor:item.severity!=='info'?'pointer':'default',transition:'background var(--tr)' }}
            onMouseEnter={e=>{if(item.severity!=='info')e.currentTarget.style.background='var(--bg3)'}}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ width:8,height:8,borderRadius:'50%',flexShrink:0,background:{critical:'var(--red)',high:'var(--red)',medium:'var(--amber)',low:'var(--purple)',info:'var(--text3)'}[item.severity]||'var(--text3)' }} />
            <span style={{ flex:1,fontSize:13,fontWeight:500 }}>{item.type}</span>
            <span style={{ fontSize:13,fontWeight:600,color:item.severity==='info'?'var(--text2)':'var(--red)',minWidth:36,textAlign:'right' }}>{item.count}</span>
            <span className={`badge ${{critical:'badge-red',high:'badge-red',medium:'badge-amber',low:'badge-purple',info:'badge-blue'}[item.severity]||''}`}>{item.severity}</span>
            {item.severity!=='info'&&<ChevronRight size={14} color="var(--text3)"/>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── INDEX FIX DRILLDOWN ──────────────────────────────────────────────────────

export function IndexFix({ data, site, onNav }) {
  const { summary={}, breakdown=[] } = data.coverage || {}
  const aiPayload = { site_url:site, ...summary, breakdown }
  const steps = [
    { title:'Find canonical template in your CMS', desc:'Search for rel="canonical" in your theme or layout files — it\'s set globally, not per-page.', code:`grep -r 'rel="canonical"' ./themes/` },
    { title:'Remove incorrect URL prefix', desc:'Change the href to use the correct self-referencing path. The /shop/ prefix does not exist.', code:`<!-- Before -->\n<link rel="canonical" href="{{ site.url }}/shop{{ page.url }}">\n<!-- After -->\n<link rel="canonical" href="{{ site.url }}{{ page.url }}">` },
    { title:'Verify on 2–3 pages before full deploy', desc:'View Source on a product page → search "canonical" → confirm target URL returns 200.', code:null },
    { title:'Deploy and resubmit sitemap in GSC', desc:'GSC → Sitemaps → Resubmit. Then use URL Inspection on top 5 affected pages → Request Indexing.', code:null },
    { title:'Monitor — pages re-index in 3–10 days', desc:'This tool checks index status daily. You\'ll be notified when affected pages return to "Valid".', code:null, done:true },
  ]
  return (
    <div className="animate-in">
      <button className="btn btn-ghost" style={{ marginBottom:16,fontSize:12 }} onClick={()=>onNav('coverage')}><ArrowLeft size={13}/>Back to Index Coverage</button>
      <h1 style={{ fontSize:18,fontWeight:600,letterSpacing:'-0.02em',marginBottom:4 }}>Fix plan: crawled, not indexed</h1>
      <p style={{ fontSize:13,color:'var(--text3)',marginBottom:20 }}>Est. impact: <span style={{ color:'var(--red)' }}>−6,200 clicks/month</span> · Critical</p>
      <AIPanel endpoint="indexFix" payload={aiPayload} title="AI root cause analysis" />
      <StepPlan steps={steps} impactText="Estimated recovery once re-indexed" impactValue="+6,200 clicks/month" actions={[{ label:'Generate code fix →', fn:()=>{} },{ label:'See all affected URLs', fn:()=>{} }]} />
    </div>
  )
}

// ─── SITEMAPS ─────────────────────────────────────────────────────────────────

export function Sitemaps({ data, loading, site, load, onNav }) {
  useEffect(()=>{ if(!data.sitemaps) load.sitemaps() },[])
  const sitemaps = data.sitemaps?.sitemaps || []
  const aiPayload = { site_url:site, sitemaps, issues:[] }
  const steps = [
    { title:'Fix canonical template (unblocks 68 pages)', desc:'Remove the /shop/ prefix from your canonical tag. This resolves the largest batch in one deploy.', code:`<!-- Change from: -->\n<link rel="canonical" href="{{ site.url }}/shop{{ page.url }}">\n<!-- To: -->\n<link rel="canonical" href="{{ site.url }}{{ page.url }}">` },
    { title:'Replace redirect URLs with final destinations', desc:'14 old /catalogue/ URLs in sitemap redirect to /product/. Update sitemap to point directly to final URLs.', code:`# Find redirect URLs\ncurl -s https://${site?.replace(/https?:\/\//,'')}sitemap-products.xml | grep '/catalogue/'` },
    { title:'Remove discontinued product URLs (404s)', desc:'3 URLs returning 404. Remove from sitemap or add 301 redirects to relevant alternatives.', code:null },
    { title:'Update lastmod dates', desc:'22 pages have stale lastmod dates. Update your sitemap generator to pull from your CMS last-updated timestamp.', code:null },
    { title:'Resubmit all sitemaps in GSC', desc:'GSC → Sitemaps → Resubmit each. Then request indexing on top 10 revenue pages manually.', code:null, done:true },
  ]
  return (
    <div className="animate-in">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div><h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Sitemaps</h1><p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>{sitemaps.length} sitemaps submitted</p></div>
      </div>
      <AIPanel endpoint="sitemapFix" payload={aiPayload} title="AI sitemap diagnosis" />
      <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:14 }}>
        {loading.sitemaps ? Array.from({length:3}).map((_,i)=><div key={i} className="card" style={{ height:72,animation:'pulse 1.5s infinite' }}/>) :
          sitemaps.map((s,i)=>{
            const sub = s.contents?.[0]?.submitted||0, idx = s.contents?.[0]?.indexed||0
            const pct = sub>0?Math.round(idx/sub*100):0
            const ok = s.errors===0&&s.warnings===0
            return (
              <div key={i} className="card" style={{ display:'flex',alignItems:'center',gap:14 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:ok?'var(--green-bg)':'var(--amber-bg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:18 }}>{ok?'✓':'⚠'}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:'var(--mono)',fontSize:12,color:'var(--accent)',marginBottom:3 }}>{s.url}</div>
                  <div style={{ fontSize:11,color:'var(--text3)' }}>Submitted {s.lastSubmitted||'—'}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13,fontWeight:500 }}>{idx.toLocaleString()} <span style={{ fontSize:11,color:'var(--text3)' }}>/ {sub.toLocaleString()} indexed</span></div>
                  <div style={{ height:4,background:'var(--bg3)',borderRadius:2,marginTop:6,width:120 }}>
                    <div style={{ height:4,width:`${pct}%`,background:ok?'var(--green)':'var(--amber)',borderRadius:2 }}/>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
      <StepPlan steps={steps} impactText="Estimated URLs re-indexed after fix" impactValue="~68 pages" actions={[{ label:'Export corrected sitemap →', fn:()=>{} }]} />
    </div>
  )
}

// ─── CORE WEB VITALS ──────────────────────────────────────────────────────────

function VBar({ label, val, unit, good, poor }) {
  const status = val<=good?'good':val<=poor?'needs':'poor'
  const col = {good:'var(--green)',needs:'var(--amber)',poor:'var(--red)'}[status]
  const pct = Math.min(100,Math.round(val/(poor*1.5)*100))
  return (
    <div style={{ padding:'11px 13px',background:'var(--bg3)',borderRadius:'var(--r)',borderLeft:`2px solid ${col}` }}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:7 }}>
        <span style={{ fontSize:13,fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:15,fontWeight:600,color:col }}>{val}{unit}</span>
      </div>
      <div style={{ height:5,background:'var(--bg4)',borderRadius:3,overflow:'hidden',marginBottom:5 }}>
        <div style={{ height:5,width:`${pct}%`,background:col,borderRadius:3 }}/>
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text3)' }}>
        <span>Good ≤{good}{unit}</span>
        <span style={{ color:col,fontWeight:500 }}>{{good:'✓ Passing',needs:'⚠ Needs work',poor:'✗ Poor'}[status]}</span>
        <span>Poor &gt;{poor}{unit}</span>
      </div>
    </div>
  )
}

export function CoreWebVitals({ data, loading, site, load }) {
  useEffect(()=>{ if(!data.cwv) load.cwv() },[])
  const cwv = data.cwv || {}
  const mob = cwv.mobile || {}
  const desk = cwv.desktop || {}
  const aiPayload = { site_url:site, lcp:mob.lcp?.value||0, inp:mob.inp?.value||0, cls:mob.cls?.value||0, poor_pages:cwv.poor_pages||0, top_pages:cwv.top_issues||[] }
  return (
    <div className="animate-in">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div><h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Core Web Vitals</h1><p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>Mobile signals · Last 28 days</p></div>
        <span className="badge badge-red">{cwv.poor_pages||0} poor pages</span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16 }}>
        {[{l:'Poor',v:cwv.poor_pages||0,c:'var(--red)'},{l:'Needs improvement',v:cwv.needs_work||0,c:'var(--amber)'},{l:'Good',v:cwv.good||0,c:'var(--green)'}].map(s=>(
          <div key={s.l} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:28,fontWeight:600,color:s.c,letterSpacing:'-0.02em' }}>{s.v}</div>
            <div style={{ fontSize:12,color:'var(--text2)',marginTop:4 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <AIPanel endpoint="cwv" payload={aiPayload} title="AI CWV diagnosis" actions={[{ label:'Generate image optimisation script →', fn:()=>{} },{ label:'Font-display fix →', fn:()=>{} }]} />
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
        <div className="card">
          <div style={{ fontSize:13,fontWeight:500,marginBottom:12 }}>Mobile vitals</div>
          <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
            <VBar label="LCP" val={mob.lcp?.value||0} unit="s" good={2.5} poor={4}/>
            <VBar label="INP" val={mob.inp?.value||0} unit="ms" good={200} poor={500}/>
            <VBar label="CLS" val={mob.cls?.value||0} unit="" good={0.1} poor={0.25}/>
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize:13,fontWeight:500,marginBottom:12 }}>Desktop vitals</div>
          <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
            <VBar label="LCP" val={desk.lcp?.value||0} unit="s" good={2.5} poor={4}/>
            <VBar label="INP" val={desk.inp?.value||0} unit="ms" good={200} poor={500}/>
            <VBar label="CLS" val={desk.cls?.value||0} unit="" good={0.1} poor={0.25}/>
          </div>
        </div>
      </div>
      {(cwv.top_issues||[]).length>0 && (
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ padding:'13px 16px',borderBottom:'1px solid var(--border)' }}><span style={{ fontSize:13,fontWeight:500 }}>Top affected pages</span></div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>{['Page','LCP','CLS','INP','Issue'].map(h=><th key={h} style={{ padding:'9px 14px',textAlign:'left',fontSize:11,color:'var(--text3)',fontWeight:500 }}>{h}</th>)}</tr></thead>
              <tbody>{(cwv.top_issues||[]).map((p,i)=>(
                <tr key={i} style={{ borderBottom:i<(cwv.top_issues.length-1)?'1px solid var(--border)':'none' }}>
                  <td style={{ padding:'9px 14px',fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)' }}>{p.page}</td>
                  <td style={{ padding:'9px 14px',color:p.lcp>4?'var(--red)':'var(--amber)',fontWeight:500 }}>{p.lcp}s</td>
                  <td style={{ padding:'9px 14px',color:p.cls>0.25?'var(--red)':p.cls>0.1?'var(--amber)':'var(--green)',fontWeight:500 }}>{p.cls}</td>
                  <td style={{ padding:'9px 14px',color:'var(--text2)' }}>{p.inp}ms</td>
                  <td style={{ padding:'9px 14px',color:'var(--text2)' }}>{p.issue}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ENHANCEMENTS ─────────────────────────────────────────────────────────────

export function Enhancements({ data, loading, site, load }) {
  useEffect(()=>{ if(!data.enhancements) load.enhancements() },[])
  const enhancements = data.enhancements?.enhancements || []
  const aiPayload = { site_url:site, enhancements }
  const STATUS_COLOR = { error:'var(--red)', warn:'var(--amber)', ok:'var(--green)', missing:'var(--text3)' }
  const STATUS_BG = { error:'var(--red-bg)', warn:'var(--amber-bg)', ok:'var(--green-bg)', missing:'var(--bg4)' }
  function getStatus(e){ if(e.errors>0)return 'error'; if(e.warnings>0)return 'warn'; if(e.valid===0)return 'missing'; return 'ok' }
  return (
    <div className="animate-in">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div><h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Enhancements</h1><p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>Structured data & rich results</p></div>
        <span className="badge badge-red">{enhancements.filter(e=>e.errors>0).reduce((s,e)=>s+e.errors,0)} errors</span>
      </div>
      <AIPanel endpoint="schema" payload={aiPayload} title="AI schema analysis" />
      <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
        {loading.enhancements ? Array.from({length:5}).map((_,i)=><div key={i} className="card" style={{ height:64,animation:'pulse 1.5s infinite' }}/>) :
          enhancements.map((e,i)=>{
            const st = getStatus(e)
            return (
              <div key={i} className="card" style={{ display:'flex',alignItems:'center',gap:13,cursor:'pointer',transition:'background var(--tr)' }}
                onMouseEnter={ev=>ev.currentTarget.style.background='var(--bg3)'} onMouseLeave={ev=>ev.currentTarget.style.background='var(--bg2)'}>
                <div style={{ width:36,height:36,borderRadius:10,background:STATUS_BG[st],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Activity size={17} color={STATUS_COLOR[st]}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:3 }}>
                    <span style={{ fontSize:13,fontWeight:500 }}>{e.type}</span>
                    <span className={`badge ${{ok:'badge-green',warn:'badge-amber',error:'badge-red',missing:'badge-blue'}[st]}`}>{st==='missing'?'Not implemented':st}</span>
                    {st==='missing'&&<span className="badge badge-teal">Opportunity</span>}
                  </div>
                  <div style={{ fontSize:11,color:'var(--text3)' }}>
                    {e.valid>0?`${e.valid} valid`:''}{e.errors>0?` · ${e.errors} errors`:''}{e.warnings>0?` · ${e.warnings} warnings`:''}
                  </div>
                  {e.issue&&<div style={{ fontSize:12,color:'var(--text2)',marginTop:3 }}>{e.issue}</div>}
                </div>
                <ChevronRight size={14} color="var(--text3)"/>
              </div>
            )
          })}
      </div>
    </div>
  )
}

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────

export function Opportunities({ data, loading, site, load }) {
  useEffect(()=>{ if(!data.opportunities) load.opportunities() },[])
  const opps = data.opportunities?.opportunities || []
  const total = opps.reduce((s,k)=>s+(k.opportunity||0),0)
  const aiPayload = { site_url:site, keywords:opps.slice(0,10), total_opportunity:total }
  return (
    <div className="animate-in">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div><h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Opportunities</h1><p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>Keywords positions 4–20 · Quick wins</p></div>
        <div style={{ textAlign:'right' }}><div style={{ fontSize:11,color:'var(--text3)' }}>Total recoverable</div><div style={{ fontSize:17,fontWeight:600,color:'var(--green)' }}>+{total.toLocaleString()} clicks/mo</div></div>
      </div>
      <AIPanel endpoint="opportunities" payload={aiPayload} title="AI opportunity analysis" actions={[{ label:'Content brief for top keyword →', fn:()=>{} }]} />
      <DataTable title="Keyword opportunities" cols={['Keyword','Position','Impressions','CTR','Clicks','Δ Pos','Opportunity']} rows={opps} keys={['keyword','position','impressions','ctr','clicks','positionDelta','opportunity']} types={['text','pos','num','pct','num','delta','opp']} loading={loading.opportunities} />
    </div>
  )
}

// ─── SHARED TABLE COMPONENT ───────────────────────────────────────────────────

function DataTable({ title, cols, rows=[], keys, types, loading }) {
  function fmtCell(v, type) {
    if(v==null||v===undefined) return '—'
    if(type==='url') return <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)' }}>{String(v).length>45?String(v).slice(0,45)+'…':v}</span>
    if(type==='num') return Number(v).toLocaleString()
    if(type==='pct') return `${Number(v).toFixed(1)}%`
    if(type==='pos') return <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600,background:v<=3?'rgba(34,197,94,0.12)':v<=10?'rgba(245,158,11,0.12)':'var(--bg4)',color:v<=3?'var(--green)':v<=10?'var(--amber)':'var(--text3)' }}>{Number(v).toFixed(1)}</span>
    if(type==='delta') return <span style={{ color:v>=0?'var(--green)':'var(--red)',fontWeight:500,fontSize:12 }}>{v>=0?'▲':'▼'} {Math.abs(v)}</span>
    if(type==='opp') return <span style={{ color:'var(--green)',fontWeight:600 }}>+{Number(v).toLocaleString()}</span>
    return String(v)
  }
  return (
    <div className="card" style={{ padding:0,overflow:'hidden' }}>
      <div style={{ padding:'13px 16px',borderBottom:'1px solid var(--border)' }}><span style={{ fontSize:13,fontWeight:500 }}>{title}</span></div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
          <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>{cols.map(c=><th key={c} style={{ padding:'9px 14px',textAlign:'left',fontSize:11,color:'var(--text3)',fontWeight:500,whiteSpace:'nowrap' }}>{c}</th>)}</tr></thead>
          <tbody>
            {loading ? Array.from({length:6}).map((_,i)=>(
              <tr key={i}><td colSpan={cols.length} style={{ padding:'12px 14px' }}><div style={{ height:12,background:'var(--bg3)',borderRadius:4,animation:'pulse 1.5s infinite' }}/></td></tr>
            )) : rows.slice(0,20).map((row,i)=>(
              <tr key={i} style={{ borderBottom:i<rows.length-1?'1px solid var(--border)':'none',transition:'background var(--tr)' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {keys.map((k,j)=><td key={k} style={{ padding:'10px 14px',fontWeight:j===0?500:400,color:'var(--text)' }}>{fmtCell(row[k],types[j])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center' }}>
    <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--bg4)',flexShrink:0 }}/>
    <div style={{ flex:1,height:13,background:'var(--bg3)',borderRadius:4,animation:'pulse 1.5s infinite' }}/>
  </div>
}
