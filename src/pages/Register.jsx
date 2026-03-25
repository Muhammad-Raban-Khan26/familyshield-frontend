// src/pages/Register.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [name, setName]   = useState('')
  const [role, setRole]   = useState('member')
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(null) // family code show karne ke liye

  const msgs = {
    'auth/email-already-in-use': 'Email pehle se registered hai',
    'auth/weak-password': 'Password weak hai (min 6 chars)',
    'auth/invalid-email': 'Email format galat hai'
  }

  const handle = async (e) => {
    e.preventDefault()
    if (!name || !email || !pass) { setErr('Sab fields bharo'); return }
    if (pass.length < 6) { setErr('Password 6 characters se zyada hona chahiye'); return }
    setLoading(true); setErr('')
    try {
      await register(name, email, pass, role)
      // Register ke baad family code show hoga AuthContext mein
    } catch (er) {
      setErr(msgs[er.code] || er.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">🛡️</div>
      <h1 className="auth-title">Account Banao</h1>
      <p className="auth-subtitle">
        Register karo — family automatically ban jaayegi aur code mil jaayega!
      </p>
      <div className="auth-tabs">
        <Link to="/login" className="auth-tab">Login</Link>
        <span className="auth-tab active">Register</span>
      </div>
      {err && <div className="error-msg">❌ {err}</div>}
      <form onSubmit={handle}>
        <div className="form-group">
          <label className="form-label">Aapka Naam</label>
          <input className="form-input" type="text" placeholder="Ahmed Khan"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Aap kaun hain?</label>
          <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="parent">👨 Parent (Walid/Walida)</option>
            <option value="member">👦 Family Member (Bacha)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="aap@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters"
            value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '⏳ Account ban raha hai...' : '✅ Register Karo'}
        </button>
      </form>
      <div style={{
        background:'rgba(0,212,170,.06)', border:'1px solid rgba(0,212,170,.15)',
        borderRadius:'12px', padding:'12px 14px', marginTop:'12px',
        fontSize:'12px', color:'var(--muted2)', lineHeight:1.6
      }}>
        ℹ️ Register karne par automatically ek <strong style={{color:'var(--teal)'}}>Family Code</strong> generate hoga.
        Woh code family members ko bhejo — woh Login karke us code se join kar saktey hain.
      </div>
    </div>
  )
}
