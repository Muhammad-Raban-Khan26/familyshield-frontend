// src/components/ScreenTimeTab.jsx
import React from 'react'
import { useFamily } from '../context/FamilyContext'

const COLORS = [
  'linear-gradient(90deg,#818cf8,#6366f1)',
  'linear-gradient(90deg,#f472b6,#ec4899)',
  'linear-gradient(90deg,#38bdf8,#0284c7)',
  'linear-gradient(90deg,#00d4aa,#00a882)'
]
const DEMO_APPS = [['📺 YouTube','🎮 PUBG'],['📷 Instagram','💬 WhatsApp'],['💬 WhatsApp'],['📧 Email']]

export default function ScreenTimeTab() {
  const { members } = useFamily()

  return (
    <div>
      <div className="section-header">
        <div className="section-title">⏱️ Screen Time</div>
        <div className="section-action">Limits Set</div>
      </div>
      {members.length === 0
        ? <div className="empty-state">👥<br/>Koi member nahi</div>
        : members.map((m,i) => {
          const used = m.screenUsed || Math.floor(Math.random()*200+60)
          const lim  = m.screenLimit || 240
          const pct  = Math.min(100, Math.round(used/lim*100))
          const clr  = pct>=90?'var(--rose)':pct>=70?'var(--amber)':'var(--teal)'
          return (
            <div key={m.uid} className="st-card">
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                <div style={{fontSize:'22px'}}>{m.emoji||'👤'}</div>
                <div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:'14px',fontWeight:700}}>{m.name}</div>
                  <div style={{fontSize:'11px',color:'var(--muted2)'}}>{m.role==='parent'?'👨 Parent':'👦 Bacha'} • Aaj</div>
                </div>
              </div>
              <div style={{display:'flex',gap:'8px',marginBottom:'11px'}}>
                {[
                  {v:`${Math.floor(used/60)}h ${used%60}m`, l:'Kiya', c:clr},
                  {v:`${Math.floor(lim/60)}h`, l:'Limit'},
                  {v:`${pct}%`, l:'Used', c:clr}
                ].map((s,j) => (
                  <div key={j} style={{flex:1,background:'var(--bg3)',borderRadius:'11px',padding:'10px',textAlign:'center'}}>
                    <div style={{fontFamily:'Syne,sans-serif',fontSize:'17px',fontWeight:700,color:s.c||'var(--text)'}}>{s.v}</div>
                    <div style={{fontSize:'10px',color:'var(--muted2)',marginTop:'2px'}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="st-bar-bg">
                <div className="st-bar-fill" style={{width:`${pct}%`,background:COLORS[i%COLORS.length]}}></div>
              </div>
              <div className="st-chips">
                {(DEMO_APPS[i]||['📱 Phone']).map((a,j) => <div key={j} className="st-chip">{a}</div>)}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}
