import { LayoutDashboard, TrendingUp, FileX, Map, Zap, Activity, Search, Settings, ChevronRight, LogOut } from 'lucide-react'

const NAV = [
  { id:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { id:'performance', label:'Performance', icon:TrendingUp },
  { id:'coverage', label:'Index Coverage', icon:FileX, badge:'err' },
  { id:'sitemap', label:'Sitemaps', icon:Map, badge:'warn' },
  { id:'cwv', label:'Core Web Vitals', icon:Zap, badge:'err' },
  { id:'enhancements', label:'Enhancements', icon:Activity, badge:'err' },
  { id:'opportunities', label:'Opportunities', icon:Search },
]

export default function Sidebar({ active, onNav, site, issueCount, onDisconnect }) {
  return (
    <aside style={{ width:'var(--sw)',minHeight:'100vh',background:'var(--bg2)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0 }}>
      {/* Logo */}
      <div style={{ padding:'18px 14px 14px',borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:9 }}>
          <div style={{ width:30,height:30,borderRadius:9,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <Search size={15} color="#fff" />
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13,fontWeight:600,color:'var(--text)' }}>GSC Intel</div>
            <div style={{ fontSize:11,color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140 }}>
              {site ? site.replace(/https?:\/\//, '').replace(/\/$/, '') : 'No site'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:'8px 8px' }}>
        <div style={{ fontSize:10,fontWeight:600,color:'var(--text3)',letterSpacing:'.08em',padding:'10px 8px 5px',textTransform:'uppercase' }}>Analysis</div>
        {NAV.map(({ id, label, icon:Icon, badge }) => {
          const isActive = active === id
          const count = badge === 'err' ? issueCount?.errors?.[id] : issueCount?.warnings?.[id]
          return (
            <button key={id} onClick={() => onNav(id)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',
              borderRadius:'var(--r)',background:isActive?'var(--bg4)':'transparent',
              color:isActive?'var(--text)':'var(--text2)',marginBottom:1,
              transition:'var(--tr)',border:isActive?'1px solid var(--border2)':'1px solid transparent',
              fontSize:13,fontWeight:isActive?500:400,cursor:'pointer',textAlign:'left',
            }}>
              <Icon size={15} style={{ flexShrink:0 }} />
              <span style={{ flex:1 }}>{label}</span>
              {count > 0 && (
                <span style={{ fontSize:10,fontWeight:600,background:badge==='err'?'var(--red-bg)':'var(--amber-bg)',color:badge==='err'?'var(--red)':'var(--amber)',border:`1px solid ${badge==='err'?'rgba(244,63,94,0.25)':'rgba(245,158,11,0.25)'}`,borderRadius:20,padding:'1px 6px' }}>
                  {count}
                </span>
              )}
              {isActive && <ChevronRight size={12} color="var(--text3)" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'10px 8px',borderTop:'1px solid var(--border)' }}>
        <button onClick={() => onNav('settings')} style={{ width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:'var(--r)',background:'transparent',color:'var(--text2)',border:'1px solid transparent',fontSize:13,cursor:'pointer',transition:'var(--tr)',marginBottom:6 }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <Settings size={15} /><span>Settings</span>
        </button>
        <button onClick={onDisconnect} style={{ width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:'var(--r)',background:'transparent',color:'var(--text3)',border:'1px solid transparent',fontSize:13,cursor:'pointer',transition:'var(--tr)' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
          <LogOut size={14} /><span>Disconnect</span>
        </button>
        <div style={{ marginTop:10,padding:'8px 10px',borderRadius:'var(--r)',background:'var(--bg3)',border:'1px solid var(--border)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:5,marginBottom:3 }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:'var(--green)',flexShrink:0 }} />
            <span style={{ fontSize:11,color:'var(--text2)' }}>Connected</span>
          </div>
          <div style={{ fontSize:10,color:'var(--text3)' }}>GSC data live</div>
        </div>
      </div>
    </aside>
  )
}
