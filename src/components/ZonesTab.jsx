// src/components/ZonesTab.jsx
import React, { useState } from 'react'
import { useFamily } from '../context/FamilyContext'

export default function ZonesTab({ showToast }) {
  const { zones, toggleZone, addZone } = useFamily()
  const [showAdd, setShowAdd] = useState(false)
  const [zName, setZName]     = useState('')
  const [zEmoji, setZEmoji]   = useState('📍')
  const [zRadius, setZRadius] = useState('300')

  const save = async () => {
    if (!zName) { showToast('Zone ka naam daalo', 'error'); return }
    await addZone({ name:zName, emoji:zEmoji||'📍', radius:parseInt(zRadius)||300, color:'rgba(0,212,170,.1)' })
    setShowAdd(false); setZName(''); setZEmoji('📍'); setZRadius('300')
    showToast(`✅ ${zName} zone add ho gaya`)
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-title">🗺️ Safe Zones</div>
      </div>
      <div style={{padding:'0 18px 14px',fontSize:'12px',color:'var(--muted2)'}}>Koi bhi zone se bahar jaye toh turant alert</div>
      {zones.length === 0
        ? <div className="empty-state">📍<br/>Koi zone nahi<br/><span style={{fontSize:'11px'}}>Neeche se add karo</span></div>
        : zones.map(z => (
          <div key={z.id} className="zone-card">
            <div className="zone-icon" style={{background:z.color||'rgba(0,212,170,.1)'}}>{z.emoji||'📍'}</div>
            <div style={{flex:1}}>
              <div className="zone-name">{z.name}</div>
              <div className="zone-detail">{z.radius||300}m radius</div>
              <div className="zone-members">👤 Family</div>
            </div>
            <div className={`toggle ${z.isActive?'on':'off'}`}
              onClick={() => { toggleZone(z.id, z.isActive); showToast(z.isActive?'❌ Zone off':'✅ Zone on') }}>
            </div>
          </div>
        ))
      }
      <div className="add-zone-btn" onClick={() => setShowAdd(true)}>➕ Naya Safe Zone Add Karo</div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="modal-handle"></div>
            <div className="modal-title">📍 Naya Safe Zone</div>
            <div className="modal-sub">Zone ka naam aur size set karo</div>
            <div className="form-group">
              <label className="form-label">Zone Ka Naam</label>
              <input className="form-input" placeholder="School, Masjid, Ghar..." value={zName} onChange={e=>setZName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input className="form-input" placeholder="🏫" value={zEmoji} onChange={e=>setZEmoji(e.target.value)} style={{fontSize:'22px',textAlign:'center'}} />
            </div>
            <div className="form-group">
              <label className="form-label">Radius (Meter)</label>
              <input className="form-input" type="number" value={zRadius} onChange={e=>setZRadius(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={save}>✅ Zone Save Karo</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
