import { useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { geoToWorld } from './coords.js'
import { STATE_CENTERS, jitterFromString } from './data/state-centers.js'

function projectListing(listing) {
  const center = STATE_CENTERS[listing.state] || STATE_CENTERS.NSW
  const [jx, jz] = jitterFromString(listing.id || listing.suburb || '', 0)
  const [x, z] = geoToWorld(center.lat, center.lng)
  return [x + jx, z + jz]
}

function PulseMarker({ position, color, onClick, onHoverIn, onHoverOut }) {
  const inner = useRef()
  useFrame(({ clock }) => {
    if (!inner.current) return
    const t = clock.getElapsedTime()
    const pulse = 0.85 + Math.sin(t * 2.4) * 0.1
    inner.current.scale.setScalar(pulse)
  })
  return (
    <group position={position}>
      <mesh
        ref={inner}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
        onPointerOver={(e) => { e.stopPropagation(); onHoverIn?.() }}
        onPointerOut={() => { onHoverOut?.() }}
      >
        <sphereGeometry args={[0.085, 14, 14]} />
        <meshStandardMaterial color="#fff6e6" emissive={color} emissiveIntensity={2.4} roughness={0.35} />
      </mesh>
      <pointLight position={[0, 0.1, 0]} intensity={0.5} distance={0.9} color={color} />
    </group>
  )
}

export default function ListingMarkers() {
  const [listings, setListings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    supabase
      .from('properties')
      .select('id, suburb, state, mode')
      .eq('status', 'active')
      .limit(120)
      .then(({ data }) => {
        if (!active) return
        setListings(Array.isArray(data) ? data : [])
      })
    return () => { active = false }
  }, [])

  return (
    <group>
      {listings.map((l) => {
        const [x, z] = projectListing(l)
        const color = l.mode === 'sale' ? '#c66e4a' : l.mode === 'share' ? '#a6c4d2' : '#ffb570'
        return (
          <PulseMarker
            key={l.id}
            position={[x, 0.84, z]}
            color={color}
            onClick={() => navigate(`/property/${l.id}`)}
            onHoverIn={() => { document.body.style.cursor = 'pointer' }}
            onHoverOut={() => { document.body.style.cursor = 'auto' }}
          />
        )
      })}
    </group>
  )
}
