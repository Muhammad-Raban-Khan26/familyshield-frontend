// src/components/FamilyCodeModal.jsx
import React from 'react'

export default function FamilyCodeModal({ code, onClose, showToast }) {
  const copy = () => {
    const c = code || '------'
    if (navigator.clipboard) {
      navigator.clipboard.writeText(c).then(() => showToast('📋 Code copy ho gaya: ' + c))
    } else {
      showToast('Code: ' + c, 'info')
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle"></div>
        <div className="modal-title">🔑 Family Code</div>
        <div className="modal-sub">Yeh code share karo — log directly join kar saktey hain</div>
        <div className="family-code-display">{code || '------'}</div>
        <button className="btn btn-primary" onClick={copy}>📋 Code Copy Karo</button>
        <button className="btn btn-secondary" onClick={onClose}>Theek Hai</button>
      </div>
    </div>
  )
}
