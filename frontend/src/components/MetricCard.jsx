import { TrendingUp, TrendingDown } from 'lucide-react'

function fmt(v, type) {
  if (type==='number') return v>=1e6?(v/1e6).toFixed(2)+'M':v>=1000?(v/1000).toFixed(1)+'K':Math.round(v).toLocaleString()
  if (type==='pct') return v.toFixed(1)+'%'
  if (type==='pos') return v.toFixed(1)
  return v
}

export default function MetricCard({ label, value=0, delta=0, type='number', icon:Icon, loading }) {
  if (loading) return (
    <div className="card" style={{ padding:'16px 20px' }}>
      <div style={{ height:14,width:80,background:'var(--bg4)',borderRadius:4,marginBottom:14,animation:'pulse 1.5s infinite' }} />
      <div style={{ height:30,width:100,background:'var(--bg4)',borderRadius:4,marginBottom:10,animation:'pulse 1.5s infinite' }} />
      <div style={{ height:12,width:120,background:'var(--bg4)',borderRadius:4,animation:'pulse 1.5s infinite' }} />
    </div>
  )
  const posLabel = label === 'Avg. position'
  const up = delta >= 0
  const positive = posLabel ? !up : up
  return (
    <div className="card" style={{ padding:'16px 20px' }}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10 }}>
        <span style={{ fontSize:11,fontWeight:500,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.06em' }}>{label}</span>
        {Icon && <Icon size={14} color="var(--text3)" />}
      </div>
      <div style={{ fontSize:26,fontWeight:600,color:'var(--text)',letterSpacing:'-0.02em',marginBottom:6 }}>
        {fmt(value, type)}
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12 }}>
        {up ? <TrendingUp size={12} color={positive?'var(--green)':'var(--red)'} /> : <TrendingDown size={12} color={positive?'var(--green)':'var(--red)'} />}
        <span style={{ color:positive?'var(--green)':'var(--red)',fontWeight:500 }}>
          {up?'+':''}{type==='pos'?delta.toFixed(1):delta.toFixed(1)+(type==='pct'?'pp':'%')}
        </span>
        <span style={{ color:'var(--text3)' }}>vs prev 28d</span>
      </div>
    </div>
  )
}
