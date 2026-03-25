// src/pages/FamilySetup.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../services/firebase'
import {
  collection, addDoc, getDocs, query,
  where, updateDoc, doc, serverTimestamp, arrayUnion
} from 'firebase/firestore'

export default function FamilySetup() {
  const { user, reloadProfile } = useAuth()
  const navigate  = useNavigate()
  const [name, setName]   = useState('')
  const [code, setCode]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]     = useState('')

  const handleCreate = async () => {
    if (!user) { setErr('Pehle login karo'); return }
    setLoading(true); setErr('')
    try {
      const famCode = Math.random().toString(36).substring(2,8).toUpperCase()
      
      // Family banao
      const famRef = await addDoc(collection(db, 'families'), {
        name: name.trim() || 'Meri Family',
        code: famCode,
        adminUid: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp()
      })

      // User profile update karo
      await updateDoc(doc(db, 'users', user.uid), {
        families: arrayUnion(famRef.id)
      })

      // Profile reload karo
      await reloadProfile()

      alert(`🎉 Family ban gayi!\n\nFamily Code: ${famCode}\n\nYeh code family members ko share karo!`)
      
      // Dashboard par jao
      navigate('/', { replace: true })

    } catch(e) {
      console.error('Family create error:', e)
      setErr('Masla hua: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!code.trim()) { setErr('Family code daalo'); return }
    if (!user) { setErr('Pehle login karo'); return }
    setLoading(true); setErr('')
    try {
      const q = query(
        collection(db, 'families'),
        where('code', '==', code.trim().toUpperCase())
      )
      const snap = await getDocs(q)
      
      if (snap.empty) {
        setErr('Yeh code galat hai — dobara check karo')
        setLoading(false)
        return
      }
      
      const famDoc = snap.docs[0]
      
      // Family mein add karo
      await updateDoc(famDoc.ref, {
        members: arrayUnion(user.uid)
      })
      
      // User profile update karo
      await updateDoc(doc(db, 'users', user.uid), {
        families: arrayUnion(famDoc.id)
      })

      // Profile reload karo
      await reloadProfile()

      navigate('/', { replace: true })

    } catch(e) {
      console.error('Join error:', e)
      setErr('Masla hua: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">👨‍👩‍👧‍👦</div>
      <h1 className="auth-title">Family Setup</h1>
      <p className="auth-subtitle">
        Naya family group banao ya kisi ke group mein shamil ho jao
      </p>

      {err && <div className="error-msg">❌ {err}</div>}

      <div className="form-group">
        <label className="form-label">Family Ka Naam</label>
        <input
          className="form-input"
          placeholder="Khan Family"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? '⏳ Ban raha hai...' : '🏠 Naya Family Group Banao'}
      </button>

      <div className="divider">ya kisi ke group mein shamil ho</div>

      <div className="form-group">
        <label className="form-label">Family Code</label>
        <input
          className="form-input"
          placeholder="ABC123"
          style={{
            textTransform:'uppercase',
            letterSpacing:'4px',
            textAlign:'center',
            fontWeight:800,
            fontSize:'18px'
          }}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          disabled={loading}
        />
      </div>

      <button
        className="btn btn-secondary"
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? '⏳ Join ho raha hai...' : '🔗 Code se Join Karo'}
      </button>
    </div>
  )
}
