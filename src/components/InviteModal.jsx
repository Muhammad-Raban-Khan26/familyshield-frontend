// src/components/InviteModal.jsx
import React, { useState } from 'react'
import { useFamily } from '../context/FamilyContext'

export default function InviteModal({ onClose, showToast }) {
  const { familyCode } = useFamily()
  const [cc, setCC]   = useState('+92')
  const [ph, setPh]   = useState('')
  const [rel, setRel] = useState('Bhai')

  const send = () => {
    if (!ph) { showToast('Phone number daalo', 'error'); return }
    onClose()
    showToast(`📨 ${cc+ph} ko invite! Code: ${familyCode||'------'}`)
    setPh('')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"></div>
        <div className="modal-title">📱 Member Invite Karo</div>
        <div className="modal-sub">Phone number daal kar invite bhejo</div>
        <div style={{display:'flex',gap:'8px',marginBottom:'13px'}}>
          <input style={{width:'76px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'12px',padding:'13px 10px',color:'var(--text)',fontSize:'14px',outline:'none',textAlign:'center',fontWeight:700}}
            value={cc} onChange={e=>setCC(e.target.value)} />
          <input style={{flex:1,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'12px',padding:'13px 14px',color:'var(--text)',fontSize:'14px',fontFamily:'Outfit,sans-serif',outline:'none'}}
            placeholder="300 1234567" type="tel" value={ph} onChange={e=>setPh(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Rishta</label>
          <select className="form-input" value={rel} onChange={e=>setRel(e.target.value)}>
            {['Bhai','Behen','Ammi','Abu','Beta','Beti','Dost'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={send}>📨 Invite Bhejo</button>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
