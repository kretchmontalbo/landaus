import { useState } from 'react'

export default function VerifiedBadge({ size = 14, showLabel = false }) {
  const [showTip, setShowTip] = useState(false)
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, position: 'relative' }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#0B5D3B">
        <path d="M12 2l2.4 4.6 5.1 1-3.8 3.7.9 5.2L12 14l-4.6 2.5.9-5.2L4.5 7.6l5.1-1L12 2z" fill="#B2FCE4" stroke="#0B5D3B" strokeWidth="0.5"/>
        <path d="M9 12l2 2 4-4" stroke="#0B5D3B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showLabel && <span style={{ fontSize: 12, color: '#0B5D3B', fontWeight: 600 }}>Verified</span>}
      {showTip && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#0A2540', color: 'white', padding: '6px 10px', borderRadius: 6,
          fontSize: 11, whiteSpace: 'nowrap', marginBottom: 4, zIndex: 100
        }}>
          ✓ ID verified by LandAus
        </span>
      )}
    </span>
  )
}
