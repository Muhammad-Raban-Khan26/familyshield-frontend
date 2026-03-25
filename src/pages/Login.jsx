// src/pages/Login.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFamily } from '../context/FamilyContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const msgs = {
    'auth/user-not-found':      'Email registered nahi',
    'auth/wrong-password':      'Password galat hai',
    'auth/invalid-email':       'Email format galat hai',
    'auth/invalid-credential':  'Email ya password galat hai',
    'auth/network-request-failed': 'Internet check karo'
  }

  const handle = async (e) => {
    e.preventDefault()
    if (!email || !pass) { setErr('Email aur password daalo'); return }
    setLoading(true); setErr('')
    try { await login(email, pass) }
    catch (er) { setErr(msgs[er.code] || 'Kuch masla hua') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🛡️</div>
      <h1 className="auth-title">Khush Amdeed<br/>FamilyShield</h1>
      <p className="auth-subtitle">Login karein ya naya account banayein</p>
      <div className="auth-tabs">
        <span className="auth-tab active">Login</span>
        <Link to="/register" className="auth-tab">Register</Link>
      </div>
      {err && <div className="error-msg">❌ {err}</div>}
      <form onSubmit={handle}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="aap@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '⏳ Login ho raha hai...' : '🔐 Login'}
        </button>
      </form>
      <div className="divider">ya</div>
      <Link to="/register">
        <button className="btn btn-secondary">✅ Naya Account Banao</button>
      </Link>

      {/* Join Family Box */}
      <div style={{
        background:'rgba(56,189,248,.04)', border:'1px solid rgba(56,189,248,.15)',
        borderRadius:'14px', padding:'16px', marginTop:'16px'
      }}>
        <div style={{fontSize:'13px', fontWeight:700, marginBottom:'4px'}}>
          🔗 Family Code se Join Karo
        </div>
        <div style={{fontSize:'12px', color:'var(--muted2)', marginBottom:'12px'}}>
          Kisi ne invite kiya hai? Pehle register karo — phir dashboard mein join kar sakte ho
        </div>
        <Link to="/register">
          <button className="btn btn-secondary" style={{marginBottom:0}}>
            Register karke Join Karo
          </button>
        </Link>
      </div>
    </div>
  )
}
