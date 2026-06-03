import { useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useAIStream } from '../hooks/useAIStream'
import { useState } from 'react'

function md(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--mono);font-size:11.5px;background:var(--bg4);padding:1px 6px;border-radius:4px;color:var(--teal)">$1</code>')
    .replace(/^(\d+)\.\s/gm, '<br/><strong style="color:var(--text2)">$1.</strong> ')
    .replace(/\n/g, '<br/>')
}

export default function AIPanel({ endpoint, payload, title = 'AI analysis', actions = [], autoRun = true }) {
  const { text, streaming, done, error, stream, reset } = useAIStream()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (autoRun && payload) {
      stream(endpoint, payload)
    }
  }, [endpoint, JSON.stringify(payload)])

  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(91,127,255,0.05) 0%,rgba(167,139,250,0.05) 100%)',
      border: '1px solid rgba(91,127,255,0.18)', borderRadius: 'var(--rl)', marginBottom: 16,
    }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'13px 16px',cursor:'pointer',userSelect:'none' }}
        onClick={() => done && setCollapsed(c => !c)}>
        <div style={{ width:28,height:28,borderRadius:8,background:'rgba(91,127,255,0.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <Sparkles size={14} color="var(--accent)" />
        </div>
        <span style={{ fontSize:13,fontWeight:500,color:'var(--text)',flex:1 }}>{title}</span>
        {streaming && <div className="spinner" />}
        {done && !error && (collapsed ? <ChevronDown size={14} color="var(--text3)" /> : <ChevronUp size={14} color="var(--text3)" />)}
        {error && <AlertCircle size={14} color="var(--red)" />}
      </div>

      {!collapsed && (
        <div style={{ padding:'0 16px 14px' }}>
          {error ? (
            <div style={{ fontSize:13,color:'var(--red)',padding:'8px 12px',background:'var(--red-bg)',borderRadius:'var(--r)',marginBottom:10 }}>
              {error}. Check your API key and try again.
            </div>
          ) : (
            <div style={{ fontSize:13,color:'var(--text2)',lineHeight:1.75,marginBottom:text ? 12 : 0 }}
              dangerouslySetInnerHTML={{ __html: md(text) + (streaming ? '<span style="animation:blink 1s infinite;color:var(--accent)">▌</span>' : '') }} />
          )}
          {done && !error && actions.length > 0 && (
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {actions.map((a,i) => (
                <button key={i} className="btn" style={{ fontSize:12,padding:'5px 12px' }} onClick={a.fn}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
