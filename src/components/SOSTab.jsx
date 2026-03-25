// src/components/SOSTab.jsx
import React, { useRef, useState } from 'react'
import { useFamily } from '../context/FamilyContext'

export default function SOSTab({ showToast }) {
  const { members, sendSOS } = useFamily()
  const progRef    = useRef(null)
  const timerRef   = useRef(null)
  const intervalRef= useRef(null)
  const [pressing, setPressing] = useState(false)

  const COLORS = ['rgba(129,140,248,.15)','rgba(244,114,182,.15)','rgba(56,189,248,.15)','rgba(0,212,170,.15)']

  const startSOS = (e) => {
    e.preventDefault()
    setPressing(true)
    let pct = 0
    intervalRef.current = setInterval(() => {
      pct += 3.4
      if (progRef.current) progRef.current.style.width = Math.min(pct, 100) + '%'
    }, 100)
    timerRef.current = setTimeout(async () => {
      clearInterval(intervalRef.current)
      setPressing(false)
      if (progRef.current) progRef.current.style.width = '0'
      let lat = '?', lng = '?'
      try {
        const p = await new Promise((res,rej) => navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}))
        lat = p.coords.latitude.toFixed(5)
        lng = p.coords.longitude.toFixed(5)
      } catch(e) {}
      await sendSOS(lat, lng)
      showToast('🆘 SOS bhej diya! Family alert ho gayi', 'error')
    }, 3000)
  }

  const cancelSOS = () => {
    clearTimeout(timerRef.current)
    clearInterval(intervalRef.current)
    setPressing(false)
    if (progRef.current) progRef.current.style.width = '0'
  }

  return (
    <div>
      <div className="section-header"><div className="section-title">🆘 Emergency SOS</div></div>
      <div style={{padding:'0 18px 14px',fontSize:'12px',color:'var(--muted2)'}}>3 second tak daba ke rakho — Family ko turant alert jayega</div>
      <div className="sos-page">
        <div className="sos-ring">
          <button className={`sos-button ${pressing?'pressing':''}`}
            onMouseDown={startSOS} onMouseUp={cancelSOS}
            onTouchStart={startSOS} onTouchEnd={cancelSOS}>
            SOS<div ref={progRef} className="sos-progress"></div>
          </button>
        </div>
        <div className="sos-label">ایمرجنسی بٹن | Emergency</div>
        <div className="sos-desc">3 second hold karo<br/>Family ko location ke saath alert jayega</div>
        <div className="sos-contacts-box">
          <div style={{fontFamily:'Syne,sans-serif',fontSize:'13px',fontWeight:700,marginBottom:'11px'}}>📞 Emergency Contacts</div>
          {members.slice(0,4).map((m,i) => (
            <div key={m.uid} className="sos-contact">
              <div className="sos-contact-avatar" style={{background:COLORS[i]}}>{m.emoji||'👤'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:600}}>{m.name}</div>
                <div style={{fontSize:'11px',color:'var(--muted2)'}}>Family</div>
              </div>
              <div className="sos-contact-call" onClick={() => showToast(`📞 ${m.name} ko call...`,'info')}>📞</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
