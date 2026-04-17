import { useState } from 'react'
import ReportModal from './ReportModal.jsx'

const LABELS = {
  property: '🚩 Report this listing',
  profile: '🚩 Report this user',
  suburb_guide: '🚩 Report this guide'
}

export default function ReportButton({ targetType, targetId }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: 'transparent', border: 'none', padding: '8px 0',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          color: hover ? '#B91C1C' : 'var(--ink-muted)',
          transition: 'color 0.15s'
        }}
      >
        {LABELS[targetType] || '🚩 Report'}
      </button>
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
