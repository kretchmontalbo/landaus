import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { AU_BOUNDS } from '../coords.js'
import {
  SAND_DIFF, SAND_NORM, SAND_ROUGH,
  GRASS_DIFF, GRASS_NORM, GRASS_ROUGH
} from '../data/texture-urls.js'

// Coastline traced from real lat/lng anchors.
const COAST_POINTS_GEO = [
  [-10.9, 142.5], [-11.3, 142.0], [-12.5, 130.8], [-13.5, 126.5],
  [-15.0, 124.0], [-17.5, 122.2], [-20.0, 119.0], [-22.5, 114.2],
  [-24.5, 113.5], [-27.5, 114.0], [-29.0, 114.5], [-31.95, 115.86],
  [-33.6, 115.0], [-34.5, 117.5], [-33.7, 121.8], [-32.5, 127.0],
  [-33.5, 132.5], [-34.0, 135.0], [-34.93, 138.6], [-37.0, 140.5],
  [-38.4, 142.0], [-38.5, 143.8], [-37.81, 144.96], [-37.5, 149.0],
  [-37.0, 150.2], [-35.0, 150.5], [-33.87, 151.21], [-32.3, 152.5],
  [-30.0, 153.0], [-28.5, 153.6], [-27.0, 153.5], [-25.0, 153.0],
  [-22.5, 150.0], [-19.0, 147.0], [-17.0, 146.0], [-15.0, 145.0],
  [-12.5, 143.0], [-10.9, 142.5]
]

function geoToShape(lat, lng) {
  const tx = (lng - AU_BOUNDS.lngMin) / (AU_BOUNDS.lngMax - AU_BOUNDS.lngMin)
  const tz = (AU_BOUNDS.latMax - lat) / (AU_BOUNDS.latMax - AU_BOUNDS.latMin)
  return [-12 + tx * 24, -8 + tz * 16]
}

function continentShape() {
  const s = new THREE.Shape()
  COAST_POINTS_GEO.forEach(([lat, lng], i) => {
    const [x, y] = geoToShape(lat, lng)
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  })
  return s
}

function pseudoElevation(x, z) {
  const east     = Math.exp(-Math.pow((x - 10) / 2.2, 2)) * Math.exp(-Math.pow((z - 1) / 5, 2)) * 0.55
  const centre   = Math.exp(-Math.pow((x - 0.5) / 3, 2)) * Math.exp(-Math.pow((z + 0.5) / 2, 2)) * 0.35
  const kimberley = Math.exp(-Math.pow((x + 6) / 1.8, 2)) * Math.exp(-Math.pow((z + 5) / 1.5, 2)) * 0.4
  const pilbara  = Math.exp(-Math.pow((x + 9) / 1.6, 2)) * Math.exp(-Math.pow((z + 3) / 1.8, 2)) * 0.3
  const flinders = Math.exp(-Math.pow((x + 0.5) / 1.2, 2)) * Math.exp(-Math.pow((z - 4.5) / 1.2, 2)) * 0.25
  const fine = (Math.sin(x * 1.7) * Math.cos(z * 1.3) + Math.sin(x * 3.1 + 0.4) * Math.cos(z * 2.7)) * 0.06
  return east + centre + kimberley + pilbara + flinders + fine
}

// Base continent — sand-toned PBR with displacement.
function ContinentBase() {
  const [sandDiff, sandNorm, sandRough] = useTexture([SAND_DIFF, SAND_NORM, SAND_ROUGH])
  ;[sandDiff, sandNorm, sandRough].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(5, 4)
    t.anisotropy = 16
  })
  sandDiff.colorSpace = THREE.SRGBColorSpace

  const geo = useMemo(() => {
    const shape = continentShape()
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSize: 0.18,
      bevelThickness: 0.12,
      bevelSegments: 4,
      curveSegments: 32,
      steps: 1
    })
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      if (y > 0.05) {
        const x = pos.getX(i)
        const z = pos.getZ(i)
        pos.setY(i, y + pseudoElevation(x, z))
      }
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial
        map={sandDiff}
        normalMap={sandNorm}
        normalScale={[0.7, 0.7]}
        roughnessMap={sandRough}
        roughness={0.95}
        metalness={0.02}
        color="#d8b186"
      />
    </mesh>
  )
}

// Red Centre overlay — terracotta tint over the central outback.
function OutbackOverlay() {
  return (
    <mesh position={[0.5, 0.9, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.4, 64]} />
      <meshStandardMaterial
        color="#a64228"
        roughness={1}
        metalness={0}
        transparent
        opacity={0.7}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  )
}

// Inner Red Centre — deeper terracotta core.
function OutbackInnerOverlay() {
  return (
    <mesh position={[0.5, 0.92, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.6, 48]} />
      <meshStandardMaterial
        color="#7a2e18"
        roughness={1}
        transparent
        opacity={0.55}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  )
}

// Coastal vegetation fringe — eucalyptus green tint near the coast.
function CoastalOverlay() {
  const [grassDiff, grassNorm, grassRough] = useTexture([GRASS_DIFF, GRASS_NORM, GRASS_ROUGH])
  ;[grassDiff, grassNorm, grassRough].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(8, 5)
    t.anisotropy = 16
  })
  grassDiff.colorSpace = THREE.SRGBColorSpace

  const geo = useMemo(() => {
    const shape = continentShape()
    const g = new THREE.ShapeGeometry(shape)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0.88, 0)
    return g
  }, [])

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        map={grassDiff}
        normalMap={grassNorm}
        normalScale={[0.4, 0.4]}
        roughnessMap={grassRough}
        roughness={0.85}
        transparent
        opacity={0.35}
        polygonOffset
        polygonOffsetFactor={-3}
        color="#5d8a55"
      />
    </mesh>
  )
}

export default function PocketContinent() {
  return (
    <group>
      <ContinentBase />
      <CoastalOverlay />
      <OutbackOverlay />
      <OutbackInnerOverlay />
    </group>
  )
}
