// src/components/AlertsTab.jsx
import React from 'react'
import { useFamily } from '../context/FamilyContext'

function fmtTime(ts) {
  if (!ts) return 'Abhi'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const s = Math.floor((Date.now() - d) / 1000)
  if (s < 60) return 'Abhi'
  if (s < 3600) return `${Math.floor(s/60)} min pehle`
  if (s < 86400) return `${Math.floor(s/3600)} ghante pehle`
  return `${Math.floor(s/86400)} din pehle`
}

export default function AlertsTab({ showToast }) {
  const { alerts, deleteAlert } = useFamily()
  const clearAll = () => { alerts.forEach(a => deleteAlert(a.id)); showToast('✅ Sab clear ho gaye') }
  return (
    <div>
      <div className="section-header">
        <div className="section-title">🔔 Alerts</div>
        <div className="section-action" onClick={clearAll}>Sab Clear</div>
      </div>
      {alerts.length === 0
        ? <div className="empty-state">🎉<br/>Koi alert nahi!<br/><span style={{fontSize:'11px'}}>Sab theek hai</span></div>
        : alerts.map(a => {
          const tc = a.type==='sos'?'sos':a.type==='zone'?'zone':'info'
          const cc = a.type==='sos'?'chip-red':a.type==='zone'?'chip-amber':'chip-blue'
          return (
            <div key={a.id} className={`alert-card ${tc}`} onClick={() => { deleteAlert(a.id); showToast('✅ Alert hataya gaya') }}>
              <div className="alert-icon-box">{a.icon||'🔔'}</div>
              <div style={{flex:1}}>
                <div className="alert-title">{a.title}</div>
                <div className="alert-desc">{a.desc}</div>
                <div className="alert-time">⏱ {a.time || fmtTime(a.createdAt)}</div>
              </div>
              <div className={`alert-chip ${cc}`}>{a.type==='sos'?'SOS':a.type==='zone'?'Zone':'Info'}</div>
            </div>
          )
        })
      }
    </div>
  )
}
