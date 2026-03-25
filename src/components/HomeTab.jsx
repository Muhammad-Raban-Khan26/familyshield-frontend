// src/components/HomeTab.jsx
import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useFamily } from '../context/FamilyContext'

const COLORS = ['#818cf8','#f472b6','#38bdf8','#00d4aa','#fb923c','#a78bfa']

export default function HomeTab({ showToast, onInvite }) {
  const { members, alerts, zones } = useFamily()
  const mapRef    = useRef(null)
  const leafRef   = useRef(null)
  const markersRef= useRef({})
  const [selMem, setSelMem] = useState(null)

  const online = members.filter(m => m.onlineStatus?.online).length

  // Init map
  useEffect(() => {
    if (leafRef.current || !mapRef.current) return
    leafRef.current = L.map(mapRef.current, { zoomControl:false, attributionControl:false })
      .setView([33.590, 71.450], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 })
      .addTo(leafRef.current)
    // Home pin
    const hi = L.divIcon({
      html: `<div style="background:linear-gradient(135deg,#00d4aa,#38bdf8);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.3);box-shadow:0 4px 12px rgba(0,0,0,.4)"><span style="transform:rotate(45deg);font-size:14px">🏠</span></div>`,
      className:'', iconSize:[32,32], iconAnchor:[16,32]
    })
    L.marker([33.598,71.458],{icon:hi}).addTo(leafRef.current).bindPopup('🏠 Ghar')
  }, [])

  // Update member markers
  useEffect(() => {
    if (!leafRef.current) return
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}
    members.forEach((m,i) => {
      const lat = m.location?.lat || (33.580 + i*0.006)
      const lng = m.location?.lng || (71.440 + i*0.008)
      const col = m.color || COLORS[i % COLORS.length]
      const ic = L.divIcon({
        html:`<div style="background:${col};width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.2);box-shadow:0 4px 14px rgba(0,0,0,.5)"><span style="transform:rotate(45deg);font-size:13px">${m.emoji||'👤'}</span></div>`,
        className:'', iconSize:[30,30], iconAnchor:[15,30]
      })
      markersRef.current[m.uid] = L.marker([lat,lng],{icon:ic})
        .addTo(leafRef.current)
        .bindPopup(`${m.emoji||'👤'} ${m.name}<br>🔋 ${m.battery||m.location?.battery||'?'}%`)
    })
  }, [members])

  const STATS = [
    {icon:'👥', val:`${online}/${members.length}`, label:'Online Members', col:'var(--teal)',   sc:'linear-gradient(90deg,#00d4aa,#00a882)'},
    {icon:'⚠️', val:alerts.length,                 label:'Pending Alerts', col:'var(--rose)',   sc:'linear-gradient(90deg,#fb7185,#dc2626)'},
    {icon:'📍', val:zones.filter(z=>z.isActive).length, label:'Active Zones', col:'var(--sky)', sc:'linear-gradient(90deg,#38bdf8,#0284c7)'},
    {icon:'⏱️', val:'3h',                           label:'Screen Time',    col:'var(--violet)',sc:'linear-gradient(90deg,#a78bfa,#7c3aed)'},
  ]

  return (
    <div>
      <div className="live-bar">
        <div className="pulse-dot"></div>
        <span>{online} members online hain</span>
        <span style={{marginLeft:'auto',fontSize:'10px',color:'var(--muted2)'}}>LIVE</span>
      </div>

      <div className="section-header">
        <div className="section-title">👨‍👩‍👧‍👦 Family Members</div>
        <div className="section-action" onClick={onInvite}>+ Invite</div>
      </div>
      <div className="member-scroll">
        {members.length === 0
          ? <div style={{padding:'16px',color:'var(--muted2)',fontSize:'13px'}}>Koi member nahi. Invite karo!</div>
          : members.map((m,i) => {
            const col = m.color || COLORS[i % COLORS.length]
            const isOnline = m.onlineStatus?.online || m.status === 'online'
            return (
              <div key={m.uid} className={`member-card ${selMem===m.uid?'selected':''}`}
                style={{'--mc':col}} onClick={() => setSelMem(selMem===m.uid?null:m.uid)}>
                <span className="member-emoji">{m.emoji||'👤'}</span>
                <div className="member-name">{m.name}</div>
                <div className="member-loc">{m.location?'Live GPS':(m.loc||'N/A')}</div>
                <div className={`member-status ${isOnline?'status-online':'status-away'}`}>
                  {isOnline?'🟢 Online':'🟡 Away'}
                </div>
                <div className="member-battery">🔋 {m.battery||m.location?.battery||'?'}%</div>
              </div>
            )
          })
        }
      </div>

      <div className="section-header">
        <div className="section-title">🗺️ Live Map</div>
        <div className="section-action" onClick={() => showToast('🗺️ Map refresh ho gaya')}>Refresh</div>
      </div>
      <div className="map-container">
        <div ref={mapRef} style={{width:'100%',height:'100%',filter:'brightness(.85) saturate(.7)'}}></div>
        <div className="map-zoom-btns">
          <div className="map-zoom-btn" onClick={() => leafRef.current?.zoomIn()}>+</div>
          <div className="map-zoom-btn" onClick={() => leafRef.current?.zoomOut()}>−</div>
        </div>
      </div>

      <div className="stats-grid">
        {STATS.map((s,i) => (
          <div key={i} className="stat-card" style={{'--sc':s.sc}}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{color:s.col}}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
