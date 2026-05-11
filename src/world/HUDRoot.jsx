import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorldStore } from './store.js'
import WorldStage from './WorldStage.jsx'
import DroneRig from './DroneRig.jsx'
import PocketSlot from './PocketSlot.jsx'
import CityMarkers from './CityMarkers.jsx'
import Landmarks from './Landmarks.jsx'
import ListingMarkers from './ListingMarkers.jsx'
import Postprocessing from './Postprocessing.jsx'
import PocketCSSFallback from './css-fallback/PocketCSSFallback.jsx'
import HUDFrame from './HUDFrame.jsx'

export default function HUDRoot({ children }) {
  const tier = useWorldStore((s) => s.tier)
  const pocket = useWorldStore((s) => s.pocket)
  const isStatic = tier === 2

  return (
    <div className="world-root" data-tier={tier ?? 'init'} data-pocket={pocket}>
      <div className="world-canvas-slot" aria-hidden="true">
        {isStatic ? (
          <PocketCSSFallback pocket={pocket} />
        ) : (
          <Canvas
            shadows={tier === 0}
            dpr={tier === 1 ? [1, 1.5] : [1, 2]}
            gl={{
              antialias: tier !== 1,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              outputColorSpace: THREE.SRGBColorSpace
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <WorldStage />
              <DroneRig />
              <PocketSlot />
              <CityMarkers />
              <Landmarks />
              <ListingMarkers />
              <Postprocessing />
            </Suspense>
          </Canvas>
        )}
      </div>
      <HUDFrame />
      <div className="world-hud-slot">{children}</div>
    </div>
  )
}
