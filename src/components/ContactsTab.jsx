// src/components/ContactsTab.jsx
import React from 'react'
import { useFamily } from '../context/FamilyContext'

export default function ContactsTab() {
  const { members } = useFamily()

  return (
    <div>
      <div className="section-header">
        <div className="section-title">👨‍👩‍👧‍👦 Family Members</div>
      </div>

      {members.length === 0
        ? <div className="empty-state">
            👥<br/>Koi member nahi<br/>
            <span style={{fontSize:'11px'}}>Invite karo — woh join karein</span>
          </div>
        : members.map((m, i) => {
            const isOnline = m.onlineStatus?.online || m.status === 'online'
            const bat = m.location?.battery || m.battery || '?'
            return (
              <div key={m.uid} className="contact-card">
                <div className="contact-avatar" style={{fontSize:'22px', background:'var(--bg3)'}}>
                  {m.emoji || '👤'}
                </div>
                <div style={{flex:1}}>
                  <div className="contact-name">{m.name}</div>
                  <div className="contact-phone">
                    {m.email || m.phone || 'Family Member'}
                  </div>
                  <div style={{fontSize:'10px', marginTop:'3px', color: isOnline ? 'var(--teal)' : 'var(--muted2)'}}>
                    {isOnline ? '🟢 Online' : '⚫ Offline'} • 🔋 {bat}%
                  </div>
                </div>
                <div className={`contact-tag ${m.role === 'parent' ? 'tag-family' : 'tag-unknown'}`}
                  style={{background: m.role === 'parent' ? 'rgba(56,189,248,.1)' : 'rgba(0,212,170,.1)',
                    color: m.role === 'parent' ? 'var(--sky)' : 'var(--teal)'}}>
                  {m.role === 'parent' ? '👨 Parent' : '👦 Member'}
                </div>
              </div>
            )
          })
      }
    </div>
  )
}
