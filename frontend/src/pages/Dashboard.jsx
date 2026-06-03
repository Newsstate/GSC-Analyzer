import { useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import MetricCard from '../components/MetricCard'
import AIPanel from '../components/AIPanel'
import { MousePointerClick, Eye, TrendingUp, Crosshair, RefreshCw } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const chartOpts = (reverse=false) => ({
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ display:true, labels:{ font:{ size:11, family:'DM Sans' }, color:'#4a4a60', boxWidth:8, padding:10 } }, tooltip:{ mode:'index', intersect:false, backgroundColor:'#1f1f28', titleColor:'#8888a0', bodyColor:'#eeeef0', borderColor:'rgba(255,255,255,0.08)', borderWidth:1, padding:10 } },
  scales:{ x:{ ticks:{ font:{ size:10 }, color:'#4a4a60', maxTicksLimit:7 }, grid:{ color:'rgba(255,255,255,0.03)' }, border:{ display:false } }, y:{ reverse, ticks:{ font:{ size:10 }, color:'#4a4a60' }, grid:{ color:'rgba(255,255,255,0.03)' }, border:{ display:false } } }
})

const SEV = { critical:'var(--red)', high:'var(--red)', medium:'var(--amber)', low:'var(--purple)', info:'var(--text3)' }
const SBADGE = { critical:'badge-red', high:'badge-red', medium:'badge-amber', low:'badge-purple', info:'badge-blue' }

export default function Dashboard({ data, loading, site, onNav, refetch }) {
  const ov = data.overview
  const ts = data.timeseries
  const issues = data.issues?.issues || []

  const clicksChart = ts ? {
    labels: ts.labels,
    datasets: [
      { label:'This period', data:ts.clicks, borderColor:'#5b7fff', borderWidth:2, pointRadius:0, tension:0.4, fill:true, backgroundColor:'rgba(91,127,255,0.06)' },
      { label:'Prev period', data:ts.prevClicks, borderColor:'rgba(255,255,255,0.12)', borderWidth:1.5, pointRadius:0, tension:0.4, borderDash:[4,4], fill:false },
    ]
  } : null

  const posChart = ts ? {
    labels: ts.labels,
    datasets: [{ label:'Avg position', data:ts.positions, borderColor:'#f59e0b', borderWidth:2, pointRadius:0, tension:0.4, fill:true, backgroundColor:'rgba(245,158,11,0.05)' }]
  } : null

  const aiPayload = ov ? {
    site_url: site,
    clicks: { value: ov.current?.clicks, delta: ov.deltas?.clicks },
    impressions: { value: ov.current?.impressions, delta: ov.deltas?.impressions },
    ctr: { value: ov.current?.ctr, delta: ov.deltas?.ctr },
    position: { value: ov.current?.position, delta: ov.deltas?.position },
    issues: issues.slice(0,5),
    opportunities: data.opportunities?.opportunities?.slice(0,3) || [],
    declining_pages: [],
  } : null

  return (
    <div className="animate-in">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20,fontWeight:600,letterSpacing:'-0.02em' }}>Overview</h1>
          <p style={{ fontSize:13,color:'var(--text2)',marginTop:2 }}>Last 28 days · {site?.replace(/https?:\/\//,'').replace(/\/$/,'')}</p>
        </div>
        <button className="btn" onClick={refetch} style={{ fontSize:12 }}>
          <RefreshCw size={13} style={{ animation:loading.overview?'spin .7s linear infinite':'none' }} />
          {loading.overview ? 'Syncing…' : 'Refresh'}
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16 }}>
        <MetricCard label="Total clicks" value={ov?.current?.clicks} delta={ov?.deltas?.clicks} type="number" icon={MousePointerClick} loading={loading.overview} />
        <MetricCard label="Impressions" value={ov?.current?.impressions} delta={ov?.deltas?.impressions} type="number" icon={Eye} loading={loading.overview} />
        <MetricCard label="Avg. CTR" value={ov?.current?.ctr} delta={ov?.deltas?.ctr} type="pct" icon={TrendingUp} loading={loading.overview} />
        <MetricCard label="Avg. position" value={ov?.current?.position} delta={ov?.deltas?.position} type="pos" icon={Crosshair} loading={loading.overview} />
      </div>

      {/* AI Panel — only renders when data ready */}
      {aiPayload && (
        <AIPanel
          endpoint="diagnosis"
          payload={aiPayload}
          title="AI diagnosis — last 28 days"
          actions={[
            { label:'Fix index issue →', fn:()=>onNav('coverage') },
            { label:'Sitemap audit →', fn:()=>onNav('sitemap') },
            { label:'View opportunities →', fn:()=>onNav('opportunities') },
          ]}
        />
      )}

      {/* Charts */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
        <div className="card">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
            <span style={{ fontSize:13,fontWeight:500 }}>Clicks over time</span>
            <span style={{ fontSize:11,color:'var(--text3)' }}>vs previous 28 days</span>
          </div>
          <div style={{ height:155 }}>
            {clicksChart ? <Line data={clicksChart} options={chartOpts()} /> : <div style={{ height:'100%',background:'var(--bg3)',borderRadius:'var(--r)',animation:'pulse 1.5s infinite' }} />}
          </div>
        </div>
        <div className="card">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
            <span style={{ fontSize:13,fontWeight:500 }}>Avg. position trend</span>
            <span style={{ fontSize:11,color:'var(--text3)' }}>lower = better</span>
          </div>
          <div style={{ height:155 }}>
            {posChart ? <Line data={posChart} options={chartOpts(true)} /> : <div style={{ height:'100%',background:'var(--bg3)',borderRadius:'var(--r)',animation:'pulse 1.5s infinite' }} />}
          </div>
        </div>
      </div>

      {/* Issues queue */}
      <div style={{ marginBottom:8,fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em' }}>Issue queue — AI prioritised</div>
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        {loading.issues ? (
          Array.from({length:5}).map((_,i) => (
            <div key={i} style={{ padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center' }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--bg4)',flexShrink:0 }} />
              <div style={{ flex:1,height:14,background:'var(--bg3)',borderRadius:4,animation:'pulse 1.5s infinite' }} />
            </div>
          ))
        ) : issues.map((issue, i) => (
          <div key={issue.id} onClick={() => onNav(issue.screen || 'dashboard')}
            style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<issues.length-1?'1px solid var(--border)':'none',cursor:'pointer',transition:'background var(--tr)' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ width:8,height:8,borderRadius:'50%',flexShrink:0,background:SEV[issue.severity]||'var(--text3)' }} />
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:2 }}>{issue.title}</div>
              <div style={{ fontSize:11,color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{issue.desc}</div>
            </div>
            <div style={{ textAlign:'right',flexShrink:0 }}>
              <span className={`badge ${SBADGE[issue.severity]||''}`}>{issue.severity}</span>
              <div style={{ fontSize:11,color:'var(--red)',marginTop:3 }}>{issue.impact}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
