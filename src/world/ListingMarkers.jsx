import { useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { supabase } from '../lib/supabase.js'
import { geoToWorld } from './coords.js'
import { STATE_CENTERS, jitterFromString } from './data/state-centers.js'

function ListingPin({ position, color, onClick }) {
  const inner = useRef()
  useFrame(({ clock }) => {
    if (!inner.current) return
    const t = clock.getElapsedTime()
    inner.current.scale.setScalar(0.85 + Math.sin(t * 2.2 + position[0]) * 0.08)
  })
  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <mesh ref={inner}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#fff6e6" emissive={color} emissiveIntensity={2.6} roughness={0.3} />
      </mesh>
      <pointLight intensity={0.45} distance={1.1} color={color} />
    </group>
  )
}

function projectListing(listing) {
  const center = STATE_CENTERS[listing.state] || STATE_CENTERS.NSW
  const [jx, jz] = jitterFromString(listing.id || listing.suburb || '', 0)
  const [x, z] = geoToWorld(center.lat, center.lng)
  return [x + jx, z + jz]
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
        const color = l.mode === 'sale' ? '#c66e4a' : l.mode === 'share' ? '#a6c4d2' : '#ffb878'
        return (
          <ListingPin
            key={l.id}
            position={[x, 0.95, z]}
            color={color}
            onClick={() => navigate(`/property/${l.id}`)}
          />
        )
      })}
    </group>
  )
}
