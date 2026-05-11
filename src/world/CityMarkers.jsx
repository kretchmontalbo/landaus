import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { geoToWorld } from './coords.js'
import { CITIES } from './data/cities.js'

function CityPulse({ position }) {
  const ring = useRef()
  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = (clock.getElapsedTime() % 2.4) / 2.4
    const s = 0.4 + t * 1.6
    ring.current.scale.set(s, s, s)
    ring.current.material.opacity = (1 - t) * 0.7
  })
  return (
    <mesh ref={ring} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.18, 0.24, 32]} />
      <meshBasicMaterial color="#ffe6c8" transparent opacity={0.6} depthWrite={false} />
    </mesh>
  )
}

function CityMarker({ city }) {
  const navigate = useNavigate()
  const [x, z] = geoToWorld(city.lat, city.lng)
  const pos = [x, 0.92, z]
  return (
    <group>
      <mesh
        position={pos}
        onClick={(e) => { e.stopPropagation(); navigate(`/suburbs?city=${city.slug}`) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#fff6e6"
          emissive="#ffb570"
          emissiveIntensity={2.2}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <CityPulse position={[x, 0.7, z]} />
      <Html position={[x, 1.4, z]} center distanceFactor={14} occlude={false} zIndexRange={[1, 0]}>
        <div className="city-label" aria-hidden="true">
          <span className="city-label__dot" /> {city.name}
        </div>
      </Html>
    </group>
  )
}

export default function CityMarkers() {
  return (
    <group>
      {CITIES.map((c) => <CityMarker key={c.slug} city={c} />)}
    </group>
  )
}
