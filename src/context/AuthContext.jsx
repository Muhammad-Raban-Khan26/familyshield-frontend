// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, addDoc, updateDoc, collection, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const Ctx = createContext()
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid))
          if (snap.exists()) setProfile(snap.data())
          else setProfile(null)
        } catch(e) { setProfile(null) }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  const reloadProfile = async () => {
    if (!auth.currentUser) return
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
      if (snap.exists()) setProfile(snap.data())
    } catch(e) {}
  }

  const login = (e, p) => signInWithEmailAndPassword(auth, e, p)

  const register = async (name, email, password, role = 'member') => {
    // 1. User banao
    const c = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(c.user, { displayName: name })

    // 2. Family code generate karo
    const famCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // 3. Family Firestore mein banao
    const famRef = await addDoc(collection(db, 'families'), {
      name: name + ' Family',
      code: famCode,
      adminUid: c.user.uid,
      members: [c.user.uid],
      createdAt: serverTimestamp()
    })

    // 4. User profile banao family ke saath
    const pd = {
      name, email,
      uid: c.user.uid,
      role,
      emoji: role === 'parent' ? '👨' : '👦',
      families: [famRef.id],
      familyCode: famCode,
      createdAt: serverTimestamp()
    }
    await setDoc(doc(db, 'users', c.user.uid), pd)
    setProfile(pd)
    return c
  }

  const logout = () => signOut(auth)

  if (loading) {
    return (
      <div style={{
        height:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', flexDirection:'column', gap:'16px',
        background:'#050c1a', color:'#00d4aa'
      }}>
        <div style={{fontSize:'48px'}}>🛡️</div>
        <div style={{fontFamily:'sans-serif', fontSize:'16px', fontWeight:600}}>
          FamilyShield load ho raha hai...
        </div>
      </div>
    )
  }

  return (
    <Ctx.Provider value={{ user, profile, login, register, logout, loading, reloadProfile }}>
      {children}
    </Ctx.Provider>
  )
}
