import CodeBlock from './CodeBlock'

export default function StepPlan({ steps, impactText, impactValue, actions }) {
  return (
    <div className="card" style={{ marginBottom:14 }}>
      <div style={{ fontSize:13,fontWeight:500,marginBottom:18 }}>Step-by-step fix plan</div>
      <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display:'flex',gap:14,paddingBottom:i<steps.length-1?20:0,position:'relative' }}>
            {i < steps.length-1 && <div style={{ position:'absolute',left:15,top:32,bottom:0,width:1,background:'var(--border)' }} />}
            <div style={{ width:30,height:30,borderRadius:'50%',flexShrink:0,background:step.done?'var(--green-bg)':'var(--bg3)',border:`1px solid ${step.done?'rgba(34,197,94,0.3)':'var(--border2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:step.done?'var(--green)':'var(--text2)',zIndex:1 }}>
              {step.done ? '✓' : i+1}
            </div>
            <div style={{ flex:1,paddingTop:5 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:4 }}>{step.title}</div>
              <div style={{ fontSize:12,color:'var(--text2)',lineHeight:1.65 }}>{step.desc}</div>
              {step.code && <CodeBlock code={step.code} />}
            </div>
          </div>
        ))}
      </div>
      {impactText && (
        <div style={{ marginTop:16,padding:'12px 14px',background:'var(--green-bg)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:'var(--r)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <span style={{ fontSize:13,color:'var(--text2)' }}>{impactText}</span>
          <span style={{ fontSize:15,fontWeight:600,color:'var(--green)' }}>{impactValue}</span>
        </div>
      )}
      {actions?.length > 0 && (
        <div style={{ display:'flex',gap:8,marginTop:14,flexWrap:'wrap' }}>
          {actions.map((a,i) => (
            <button key={i} className={i===0?'btn btn-primary':'btn'} style={{ fontSize:12 }} onClick={a.fn}>{a.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}
