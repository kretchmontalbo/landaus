import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PALETTE = {
  sandstone: '#E5C9A5',
  sandstoneDeep: '#B89968',
  eucalyptus: '#6B8F5E',
  eucalyptusDeep: '#3F5C32',
  goldenHour: '#FFB570',
  terracotta: '#C66E4A',
  red: '#A53A2A',
  cream: '#FFF6E6',
  white: '#F8F4ED',
  doorWood: '#8B5A3C',
  glassCool: '#9CC9E0',
  grass: '#7FA86A',
  sky: '#CFE3EE'
}

function pickRoof(propertyType) {
  switch (propertyType) {
    case 'apartment': return 'flat'
    case 'studio': return 'flat-small'
    case 'townhouse': return 'pitched-narrow'
    case 'house':
    default: return 'pitched'
  }
}

function pickFootprint(propertyType) {
  switch (propertyType) {
    case 'apartment': return [3.4, 1.6, 2.2]
    case 'studio': return [1.6, 1.4, 1.2]
    case 'townhouse': return [1.8, 2.2, 1.4]
    case 'house':
    default: return [2.6, 1.8, 2.0]
  }
}

function House({ bedrooms, bathrooms, parking, propertyType, furnished, floorPlan, autoRotate }) {
  const groupRef = useRef()
  const [w, h, d] = pickFootprint(propertyType)
  const roof = pickRoof(propertyType)
  const wins = Math.min(Math.max(bedrooms || 1, 1), 4)
  const glow = furnished ? PALETTE.goldenHour : PALETTE.glassCool

  useFrame((_state, delta) => {
    const g = groupRef.current
    if (!g) return
    if (autoRotate) g.rotation.y += delta * 0.18
    // Floor-plan: tilt to top-down
    const targetX = floorPlan ? -Math.PI / 2.1 : 0
    g.rotation.x += (targetX - g.rotation.x) * 0.1
  })

  // Window strip across the front (-Z face, faces camera at start)
  const windowSpacing = (w - 0.4) / wins
  const windowY = h * 0.55

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Soft shadow disc */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(w, d) * 0.85, 24]} />
        <meshBasicMaterial color="#0A2540" opacity={0.16} transparent />
      </mesh>

      {/* Walls */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={PALETTE.sandstone} roughness={0.85} />
      </mesh>

      {/* Roof */}
      {roof === 'flat' && (
        <mesh position={[0, h + 0.05, 0]}>
          <boxGeometry args={[w + 0.15, 0.1, d + 0.15]} />
          <meshStandardMaterial color={PALETTE.sandstoneDeep} roughness={0.8} />
        </mesh>
      )}
      {roof === 'flat-small' && (
        <mesh position={[0, h + 0.05, 0]}>
          <boxGeometry args={[w + 0.1, 0.1, d + 0.1]} />
          <meshStandardMaterial color={PALETTE.terracotta} roughness={0.8} />
        </mesh>
      )}
      {roof === 'pitched' && (
        <mesh position={[0, h + 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[Math.max(w, d) * 0.78, 1, 4]} />
          <meshStandardMaterial color={PALETTE.red} roughness={0.7} />
        </mesh>
      )}
      {roof === 'pitched-narrow' && (
        <mesh position={[0, h + 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[Math.max(w, d) * 0.7, 0.8, 4]} />
          <meshStandardMaterial color={PALETTE.terracotta} roughness={0.75} />
        </mesh>
      )}

      {/* Windows on the front face (z = +d/2 + 0.001) */}
      {Array.from({ length: wins }).map((_, i) => {
        const x = -w / 2 + 0.2 + windowSpacing * (i + 0.5)
        return (
          <mesh key={`win-${i}`} position={[x, windowY, d / 2 + 0.005]}>
            <boxGeometry args={[Math.min(0.5, windowSpacing - 0.1), 0.5, 0.04]} />
            <meshStandardMaterial
              color={glow}
              emissive={glow}
              emissiveIntensity={furnished ? 0.55 : 0.15}
              roughness={0.4}
            />
          </mesh>
        )
      })}

      {/* Door */}
      <mesh position={[0, 0.45, d / 2 + 0.01]}>
        <boxGeometry args={[0.45, 0.9, 0.04]} />
        <meshStandardMaterial color={PALETTE.eucalyptus} roughness={0.7} />
      </mesh>
      <mesh position={[0.13, 0.45, d / 2 + 0.04]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={PALETTE.goldenHour} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Roof skylight (bathroom signal) */}
      {bathrooms > 0 && (roof === 'pitched' || roof === 'pitched-narrow') && (
        <mesh position={[0.6, h + 0.25, 0.2]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.3]} />
          <meshStandardMaterial color={PALETTE.glassCool} emissive={PALETTE.glassCool} emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* Garage box if parking > 0 */}
      {parking > 0 && (
        <group position={[w / 2 + 0.6, 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1, 0.8, 1.2]} />
            <meshStandardMaterial color={PALETTE.cream} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[1.05, 0.05, 1.25]} />
            <meshStandardMaterial color={PALETTE.sandstoneDeep} />
          </mesh>
          <mesh position={[0, -0.05, 0.61]}>
            <boxGeometry args={[0.85, 0.7, 0.04]} />
            <meshStandardMaterial color={PALETTE.bridgeSteel || '#5C7280'} metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Picket fence for houses */}
      {propertyType === 'house' && [-0.9, -0.5, -0.1, 0.3, 0.7, 1.1].map(x => (
        <mesh key={`p-${x}`} position={[x, 0.18, d / 2 + 0.7]}>
          <boxGeometry args={[0.06, 0.36, 0.04]} />
          <meshStandardMaterial color={PALETTE.white} />
        </mesh>
      ))}

      {/* Eucalyptus tree to the left */}
      <group position={[-w / 2 - 1.2, 0, 0.4]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 1.4, 8]} />
          <meshStandardMaterial color={PALETTE.sandstoneDeep} />
        </mesh>
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[Math.cos(i * 1.5) * 0.25, 1.55 + i * 0.12, Math.sin(i * 1.5) * 0.25]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial color={PALETTE.eucalyptus} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Ground() {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[8, 48]} />
      <meshStandardMaterial color={PALETTE.grass} roughness={0.95} />
    </mesh>
  )
}

export default function Property3DCard({ bedrooms = 1, bathrooms = 1, parking = 0, propertyType = 'house', furnished = false }) {
  const [floorPlan, setFloorPlan] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div className="p3d-wrap">
      <div className="p3d-head">
        <h3>Take a virtual look</h3>
        <p>Drag to rotate · Click to {floorPlan ? 'see the front view' : 'see the floor plan'}</p>
      </div>
      <div
        className="p3d-canvas"
        onClick={() => setFloorPlan(f => !f)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ transform: hovered ? 'scale(1.02)' : 'scale(1)' }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [4.5, 3.2, 5.5], fov: 45, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={[PALETTE.sky]} />
          <ambientLight color={PALETTE.cream} intensity={0.55} />
          <hemisphereLight color="#A6C4D2" groundColor={PALETTE.grass} intensity={0.4} />
          <directionalLight
            color={PALETTE.goldenHour}
            intensity={1.2}
            position={[6, 8, 4]}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <Ground />
          <House
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            parking={parking}
            propertyType={propertyType}
            furnished={furnished}
            floorPlan={floorPlan}
            autoRotate={!hovered && !floorPlan}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            rotateSpeed={0.7}
          />
        </Canvas>
      </div>
      <p className="p3d-foot">
        {bedrooms} bed · {bathrooms} bath{parking > 0 ? ` · ${parking} parking` : ''}
        {furnished ? ' · furnished' : ''}
      </p>
    </div>
  )
}
