// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFamily } from '../context/FamilyContext'
import HomeTab from '../components/HomeTab'
import AlertsTab from '../components/AlertsTab'
import SOSTab from '../components/SOSTab'
import ZonesTab from '../components/ZonesTab'
import ScreenTimeTab from '../components/ScreenTimeTab'
import ContactsTab from '../components/ContactsTab'

// ── Toast ──
function Toast({ msg, type }) {
  return (
    <div className="toast-wrap">
      <div className={`toast ${type}`}>{msg}</div>
    </div>
  )
}

// ── Invite + Code Modal ──
function InviteModal({ onClose, showToast, familyCode, joinFamily }) {
  const [cc, setCC]     = useState('+92')
  const [ph, setPh]     = useState('')
  const [rel, setRel]   = useState('Bhai')
  const [jCode, setJCode] = useState('')
  const [tab, setTab]   = useState('invite') // 'invite' ya 'join'
  const [loading, setLoading] = useState(false)

  const copyCode = () => {
    navigator.clipboard?.writeText(familyCode || '')
    showToast('📋 Family code copy ho gaya!')
  }

  const sendInvite = () => {
    if (!ph) { showToast('Phone number daalo', 'error'); return }
    showToast(`📨 Invite bhejo! Family Code: ${familyCode}`)
    setPh('')
    onClose()
  }

  const handleJoin = async () => {
    if (!jCode) { showToast('Code daalo', 'error'); return }
    setLoading(true)
    try {
      await joinFamily(jCode)
      showToast('✅ Family join ho gayi!')
      onClose()
    } catch(e) {
      showToast('❌ ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"></div>
        <div className="modal-title">👨‍👩‍👧‍👦 Family Management</div>

        {/* Tabs */}
        <div className="auth-tabs" style={{marginBottom:'20px'}}>
          <span className={`auth-tab ${tab==='invite'?'active':''}`}
            onClick={() => setTab('invite')}>📨 Invite</span>
          <span className={`auth-tab ${tab==='join'?'active':''}`}
            onClick={() => setTab('join')}>🔗 Join</span>
        </div>

        {/* Invite Tab */}
        {tab === 'invite' && (
          <>
            {/* Family Code Box */}
            <div style={{
              background:'rgba(0,212,170,.06)', border:'2px solid rgba(0,212,170,.25)',
              borderRadius:'16px', padding:'18px', marginBottom:'16px', textAlign:'center'
            }}>
              <div style={{fontSize:'12px', color:'var(--muted2)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px'}}>
                🔑 Aapka Family Code
              </div>
              <div style={{
                fontFamily:'Syne,sans-serif', fontSize:'32px', fontWeight:800,
                color:'var(--teal)', letterSpacing:'8px', marginBottom:'12px'
              }}>
                {familyCode || '------'}
              </div>
              <div style={{fontSize:'12px', color:'var(--muted2)', marginBottom:'12px'}}>
                Yeh code family members ko bhejo — woh is se join kar saktey hain
              </div>
              <button className="btn btn-primary" style={{marginBottom:0}} onClick={copyCode}>
                📋 Code Copy Karo
              </button>
            </div>

            <div className="divider">ya phone se invite karo</div>

            <div style={{display:'flex', gap:'8px', marginBottom:'13px'}}>
              <input style={{width:'76px', background:'var(--bg3)', border:'1px solid var(--border)',
                borderRadius:'12px', padding:'13px 10px', color:'var(--text)', fontSize:'14px',
                outline:'none', textAlign:'center', fontWeight:700}}
                value={cc} onChange={e => setCC(e.target.value)} />
              <input style={{flex:1, background:'var(--bg3)', border:'1px solid var(--border)',
                borderRadius:'12px', padding:'13px 14px', color:'var(--text)', fontSize:'14px', outline:'none'}}
                placeholder="300 1234567" type="tel"
                value={ph} onChange={e => setPh(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Rishta</label>
              <select className="form-input" value={rel} onChange={e => setRel(e.target.value)}>
                {['Bhai','Behen','Ammi','Abu','Beta','Beti','Dost'].map(r =>
                  <option key={r}>{r}</option>
                )}
              </select>
            </div>
            <button className="btn btn-primary" onClick={sendInvite}>📨 Invite Bhejo</button>
          </>
        )}

        {/* Join Tab */}
        {tab === 'join' && (
          <>
            <div style={{fontSize:'13px', color:'var(--muted2)', marginBottom:'16px', lineHeight:1.6}}>
              Kisi ne aapko invite kiya hai? Unka Family Code yahan daalo:
            </div>
            <div className="form-group">
              <label className="form-label">Family Code</label>
              <input className="form-input"
                placeholder="ABC123"
                style={{textTransform:'uppercase', letterSpacing:'4px', textAlign:'center', fontWeight:800, fontSize:'20px'}}
                value={jCode}
                onChange={e => setJCode(e.target.value.toUpperCase())}
              />
            </div>
            <button className="btn btn-primary" onClick={handleJoin} disabled={loading}>
              {loading ? '⏳ Join ho raha hai...' : '🔗 Family Join Karo'}
            </button>
          </>
        )}

        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, logout } = useAuth()
  const { alerts, familyCode, codeLoading, updateLocation, joinFamily } = useFamily()
  const [tab, setTab]           = useState('home')
  const [showInvite, setInvite] = useState(false)
  const [toast, setToast]       = useState(null)
  const toastRef = useRef(null)

  // GPS
  useEffect(() => {
    if (!navigator.geolocation) return
    const w = navigator.geolocation.watchPosition(
      p => updateLocation(p.coords.latitude, p.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 15000 }
    )
    return () => navigator.geolocation.clearWatch(w)
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 3000)
  }

  const now = new Date().getHours()
  const greet = now < 12 ? 'Subha Bakhair' : now < 17 ? 'Dopahar Bakhair' : 'Shaam Bakhair'
  const unread = alerts.filter(a => !a.isRead).length

  const TABS = [
    { id:'home',       icon:'🏠', label:'Home'     },
    { id:'alerts',     icon:'🔔', label:'Alerts'   },
    { id:'sos',        icon:'🆘', label:'SOS'      },
    { id:'zones',      icon:'🗺️',  label:'Zones'    },
    { id:'screentime', icon:'⏱️',  label:'Screen'   },
    { id:'contacts',   icon:'👥', label:'Contacts' },
  ]

  return (
    <div className="app-shell">

      {/* ── Topbar ── */}
      <div className="topbar">
        <div>
          <div className="tb-title">🛡️ FamilyShield</div>
          <div className="tb-sub">{greet}, {profile?.name?.split(' ')[0] || 'User'}!</div>
        </div>
        <div className="tb-btns">
          <div className="icon-btn" onClick={() => setInvite(true)} title="Family Code & Invite">
            👨‍👩‍👧‍👦
          </div>
          <div className="icon-btn" onClick={() => setTab('alerts')}>
            🔔{unread > 0 && <span className="notif-badge">{unread}</span>}
          </div>
          <div className="icon-btn" onClick={logout} title="Logout">🚪</div>
        </div>
      </div>

      {/* ── Family Code Bar ── */}
      <div onClick={() => setInvite(true)} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(0,212,170,.05)', borderBottom:'1px solid rgba(0,212,170,.12)',
        padding:'10px 18px', flexShrink:0, cursor:'pointer',
        transition:'background .2s'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{fontSize:'16px'}}>🔑</span>
          <div>
            <div style={{fontSize:'10px', color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'0.5px'}}>
              Family Code
            </div>
            <div style={{
              fontFamily:'Syne,sans-serif', fontWeight:800,
              color: familyCode ? 'var(--teal)' : 'var(--muted)',
              letterSpacing:'4px', fontSize:'16px'
            }}>
              {codeLoading ? '...' : (familyCode || '------')}
            </div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{
            fontSize:'11px', color:'var(--teal)', padding:'4px 12px',
            border:'1px solid rgba(0,212,170,.25)', borderRadius:'8px', fontWeight:600
          }}>
            📋 Copy
          </div>
          <div style={{
            fontSize:'11px', color:'var(--sky)', padding:'4px 12px',
            border:'1px solid rgba(56,189,248,.25)', borderRadius:'8px', fontWeight:600
          }}>
            ➕ Invite
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="page-content">
        {tab === 'home'       && <HomeTab showToast={showToast} onInvite={() => setInvite(true)} />}
        {tab === 'alerts'     && <AlertsTab showToast={showToast} />}
        {tab === 'sos'        && <SOSTab showToast={showToast} />}
        {tab === 'zones'      && <ZonesTab showToast={showToast} />}
        {tab === 'screentime' && <ScreenTimeTab />}
        {tab === 'contacts'   && <ContactsTab />}
      </div>

      {/* ── Tab Bar ── */}
      <div className="tabbar">
        {TABS.map(t => (
          <div key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            <div className="tab-bar-line"></div>
            <div className="tab-icon">{t.icon}</div>
            <div className="tab-label">{t.label}</div>
          </div>
        ))}
      </div>

      {/* ── Modals ── */}
      {showInvite && (
        <InviteModal
          onClose={() => setInvite(false)}
          showToast={showToast}
          familyCode={familyCode}
          joinFamily={joinFamily}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
