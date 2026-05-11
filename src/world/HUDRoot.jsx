import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useWorldStore } from './store.js'
import WorldStage from './WorldStage.jsx'
import DroneRig from './DroneRig.jsx'
import PocketSlot from './PocketSlot.jsx'
import PocketContinentCSS from './css-fallback/PocketContinentCSS.jsx'
import HUDFrame from './HUDFrame.jsx'

export default function HUDRoot({ children }) {
  const tier = useWorldStore((s) => s.tier)
  const isStatic = tier === 2

  return (
    <div className="world-root" data-tier={tier ?? 'init'}>
      <div className="world-canvas-slot" aria-hidden="true">
        {isStatic ? (
          <PocketContinentCSS />
        ) : (
          <Canvas
            dpr={tier === 1 ? [1, 1.5] : [1, 2]}
            gl={{ antialias: tier !== 1, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <WorldStage />
              <DroneRig />
              <PocketSlot />
            </Suspense>
          </Canvas>
        )}
      </div>
      <HUDFrame />
      <div className="world-hud-slot">{children}</div>
    </div>
  )
}
