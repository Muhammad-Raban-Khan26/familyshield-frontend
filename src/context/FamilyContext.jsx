// src/context/FamilyContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, doc, updateDoc, deleteDoc,
  serverTimestamp, arrayUnion, getDocs, getDoc
} from 'firebase/firestore'
import { ref, set, onValue } from 'firebase/database'
import { db, rtdb } from '../services/firebase'
import { useAuth } from './AuthContext'

const Ctx = createContext()
export const useFamily = () => useContext(Ctx)

export function FamilyProvider({ children }) {
  const { user, profile } = useAuth()
  const [familyId, setFamilyId]     = useState(null)
  const [familyCode, setFamilyCode] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [members, setMembers]       = useState([])
  const [alerts, setAlerts]         = useState([])
  const [zones, setZones]           = useState([])
  const [codeLoading, setCodeLoading] = useState(true)

  // Family load karo
  useEffect(() => {
    if (!profile?.families?.length) {
      setCodeLoading(false)
      return
    }
    const fid = profile.families[0]
    setFamilyId(fid)

    // Family code Firestore se load karo
    getDoc(doc(db, 'families', fid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data()
          setFamilyCode(data.code || '')
          setFamilyName(data.name || '')
        }
      })
      .catch(e => console.error('Family load error:', e))
      .finally(() => setCodeLoading(false))

  }, [profile])

  // Members realtime
  useEffect(() => {
    if (!familyId) return
    try {
      const q = query(collection(db, 'users'), where('families', 'array-contains', familyId))
      return onSnapshot(q, snap => {
        const mems = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
        setMembers(mems)
        mems.forEach(m => {
          try {
            onValue(ref(rtdb, `locations/${m.uid}`), s => {
              setMembers(prev => prev.map(x =>
                x.uid === m.uid ? { ...x, location: s.val() } : x
              ))
            }, { onlyOnce: true })
          } catch(e) {}
        })
      }, () => {})
    } catch(e) {}
  }, [familyId])

  // Alerts realtime
  useEffect(() => {
    if (!familyId) return
    try {
      const q = query(collection(db, 'alerts'), where('familyId', '==', familyId))
      return onSnapshot(q, snap => {
        setAlerts(snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        )
      }, () => {})
    } catch(e) {}
  }, [familyId])

  // Zones realtime
  useEffect(() => {
    if (!familyId) return
    try {
      const q = query(collection(db, 'safeZones'), where('familyId', '==', familyId))
      return onSnapshot(q, snap => {
        setZones(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }, () => {})
    } catch(e) {}
  }, [familyId])

  // Join family by code
  const joinFamily = async (code) => {
    const q = query(collection(db, 'families'), where('code', '==', code.toUpperCase()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Code galat hai')
    const fd = snap.docs[0]
    await updateDoc(fd.ref, { members: arrayUnion(user.uid) })
    await updateDoc(doc(db, 'users', user.uid), { families: arrayUnion(fd.id) })
    setFamilyId(fd.id)
    setFamilyCode(fd.data().code)
    setFamilyName(fd.data().name)
    return fd.id
  }

  const sendSOS = async (lat, lng) => {
    if (!familyId) return
    await addDoc(collection(db, 'alerts'), {
      type: 'sos', icon: '🆘',
      title: `🆘 ${profile?.name || 'User'} ne SOS dabaya!`,
      desc: `Fori madad! Lat: ${lat}, Lng: ${lng}`,
      uid: user.uid, familyId, isRead: false,
      createdAt: serverTimestamp()
    })
  }

  const toggleZone  = async (id, cur) =>
    updateDoc(doc(db, 'safeZones', id), { isActive: !cur })

  const addZone = async (data) =>
    addDoc(collection(db, 'safeZones'), {
      ...data, familyId, isActive: true,
      createdBy: user.uid, createdAt: serverTimestamp()
    })

  const deleteAlert = async (id) =>
    deleteDoc(doc(db, 'alerts', id))

  const updateLocation = async (lat, lng) => {
    if (!user) return
    try {
      await set(ref(rtdb, `locations/${user.uid}`), {
        lat, lng, uid: user.uid, ts: Date.now()
      })
    } catch(e) {}
  }

  return (
    <Ctx.Provider value={{
      familyId, familyCode, familyName,
      members, alerts, zones, codeLoading,
      joinFamily, sendSOS,
      toggleZone, addZone, deleteAlert, updateLocation
    }}>
      {children}
    </Ctx.Provider>
  )
}
