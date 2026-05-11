import { useWorldStore } from './store.js'

export default function HUDRoot({ children }) {
  const tier = useWorldStore((s) => s.tier)
  return (
    <div className="world-root" data-tier={tier ?? 'init'}>
      <div className="world-canvas-slot" aria-hidden="true">
        {/* canvas wired in Task 1.4 */}
      </div>
      <div className="world-hud-slot">{children}</div>
    </div>
  )
}
