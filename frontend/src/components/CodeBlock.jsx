import { useState } from 'react'
import { Copy, CheckCheck } from 'lucide-react'

export default function CodeBlock({ code, lang = '' }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ position:'relative',marginTop:10 }}>
      <pre style={{ background:'var(--bg)',border:'1px solid var(--border2)',borderRadius:'var(--r)',padding:'10px 14px',fontFamily:'var(--mono)',fontSize:11.5,color:'var(--teal)',lineHeight:1.7,overflowX:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all' }}>
        {code}
      </pre>
      <button onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
        style={{ position:'absolute',top:8,right:8,background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:6,padding:'3px 8px',fontSize:11,color:copied?'var(--green)':'var(--text3)',display:'flex',alignItems:'center',gap:4,cursor:'pointer' }}>
        {copied ? <><CheckCheck size={11}/>Copied</> : <><Copy size={11}/>Copy</>}
      </button>
    </div>
  )
}
