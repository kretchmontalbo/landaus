import { useMemo } from 'react'
import * as THREE from 'three'
import { AU_BOUNDS } from '../coords.js'

const SANDSTONE = '#d4b386'
const SANDSTONE_DEEP = '#b89968'
const EUCALYPTUS = '#6B8F5E'
const OUTBACK = '#c66e4a'
const OUTBACK_DEEP = '#8b3f24'
const OCEAN = '#3a6a82'

// Real lat/lng anchor points roughly tracing Australia's coastline,
// projected to world coords for a recognisable silhouette.
const COAST_POINTS_GEO = [
  [-10.9, 142.5],  // Cape York
  [-12.5, 130.8],  // Darwin
  [-15.0, 124.0],  // Kimberley
  [-20.0, 119.0],  // Pilbara
  [-24.5, 113.5],  // Carnarvon
  [-29.0, 114.5],  // Geraldton
  [-31.95, 115.86],// Perth
  [-34.5, 117.5],  // Albany
  [-32.5, 127.0],  // Nullarbor
  [-34.0, 135.0],  // Eyre
  [-34.93, 138.6], // Adelaide
  [-38.4, 142.0],  // SW Vic
  [-37.81, 144.96],// Melbourne
  [-37.5, 149.0],  // Vic SE corner
  [-35.0, 150.5],  // Eden NSW
  [-33.87, 151.21],// Sydney
  [-30.0, 153.0],  // Coffs Harbour
  [-27.0, 153.5],  // Gold Coast
  [-22.5, 150.0],  // Mackay
  [-19.0, 147.0],  // Townsville
  [-15.0, 145.0],  // Cooktown
  [-10.9, 142.5]   // back to Cape York
]

function geoToShapeXY(lat, lng) {
  const tx = (lng - AU_BOUNDS.lngMin) / (AU_BOUNDS.lngMax - AU_BOUNDS.lngMin)
  const tz = (AU_BOUNDS.latMax - lat) / (AU_BOUNDS.latMax - AU_BOUNDS.latMin)
  // shape lives in XY plane; we'll rotate it onto XZ
  const x = -12 + tx * 24
  const y = -8 + tz * 16
  return [x, y]
}

function ContinentMesh() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    COAST_POINTS_GEO.forEach(([lat, lng], i) => {
      const [x, y] = geoToShapeXY(lat, lng)
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.8,
      bevelEnabled: true,
      bevelSize: 0.22,
      bevelThickness: 0.18,
      bevelSegments: 3,
      curveSegments: 18
    })
    g.rotateX(-Math.PI / 2)
    // displace some vertices upward for terrain feel
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      if (y > 0.4) {
        const r = Math.sqrt(x * x + z * z)
        const bump = Math.sin(x * 0.6) * Math.cos(z * 0.6) * 0.15
        const dome = Math.max(0, (8 - r) / 8) * 0.25
        pos.setY(i, y + bump + dome)
      }
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={SANDSTONE} roughness={0.92} metalness={0.02} flatShading />
    </mesh>
  )
}

function CoastalFringe() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    COAST_POINTS_GEO.forEach(([lat, lng], i) => {
      const [x, y] = geoToShapeXY(lat, lng)
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
    // outer hole (slightly bigger)
    const g = new THREE.ShapeGeometry(s)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0.81, 0)
    return g
  }, [])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={EUCALYPTUS} roughness={1} transparent opacity={0.32} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  )
}

function OutbackPatch() {
  // Centred roughly on Alice Springs / Uluru area
  return (
    <mesh position={[0.5, 0.95, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.2, 48]} />
      <meshStandardMaterial color={OUTBACK} roughness={1} transparent opacity={0.82} />
    </mesh>
  )
}

function OutbackInner() {
  return (
    <mesh position={[0.5, 0.97, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.5, 32]} />
      <meshStandardMaterial color={OUTBACK_DEEP} roughness={1} transparent opacity={0.6} />
    </mesh>
  )
}

function Ocean() {
  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color={OCEAN} roughness={0.55} metalness={0.25} />
    </mesh>
  )
}

export default function PocketContinent() {
  return (
    <group>
      <Ocean />
      <ContinentMesh />
      <CoastalFringe />
      <OutbackPatch />
      <OutbackInner />
    </group>
  )
}
