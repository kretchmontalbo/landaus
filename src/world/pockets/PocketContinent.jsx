import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { AU_BOUNDS } from '../coords.js'
import {
  NASA_EARTH_5400,
  SAND_NORM,
  SAND_ROUGH,
  ROCK_NORM,
  australiaUVCrop
} from '../data/texture-urls.js'

// Coastline traced from real lat/lng anchors — more points = smoother coast.
const COAST_POINTS_GEO = [
  [-10.9, 142.5],  // Cape York
  [-11.3, 142.0],
  [-12.5, 130.8],  // Darwin
  [-13.5, 126.5],
  [-15.0, 124.0],  // Kimberley
  [-17.5, 122.2],
  [-20.0, 119.0],  // Pilbara
  [-22.5, 114.2],
  [-24.5, 113.5],  // Carnarvon
  [-27.5, 114.0],
  [-29.0, 114.5],  // Geraldton
  [-31.95, 115.86],// Perth
  [-33.6, 115.0],
  [-34.5, 117.5],  // Albany
  [-33.7, 121.8],
  [-32.5, 127.0],  // Nullarbor
  [-33.5, 132.5],
  [-34.0, 135.0],  // Eyre
  [-34.93, 138.6], // Adelaide
  [-37.0, 140.5],
  [-38.4, 142.0],  // SW Vic
  [-38.5, 143.8],
  [-37.81, 144.96],// Melbourne
  [-37.5, 149.0],  // Vic SE corner
  [-37.0, 150.2],
  [-35.0, 150.5],  // Eden NSW
  [-33.87, 151.21],// Sydney
  [-32.3, 152.5],
  [-30.0, 153.0],  // Coffs
  [-28.5, 153.6],
  [-27.0, 153.5],  // Gold Coast
  [-25.0, 153.0],
  [-22.5, 150.0],  // Mackay
  [-19.0, 147.0],  // Townsville
  [-17.0, 146.0],
  [-15.0, 145.0],  // Cooktown
  [-12.5, 143.0],
  [-10.9, 142.5]
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

// Procedural pseudo-elevation: ranges roughly aligned with the real continent
// (Great Dividing Range east coast, Kimberley NW, MacDonnells centre, etc.)
function pseudoElevation(x, z) {
  // Great Dividing Range (east coast)
  const east = Math.exp(-Math.pow((x - 10) / 2.2, 2)) * Math.exp(-Math.pow((z - 1) / 5, 2)) * 0.55
  // MacDonnell / centre
  const centre = Math.exp(-Math.pow((x - 0.5) / 3, 2)) * Math.exp(-Math.pow((z + 0.5) / 2, 2)) * 0.35
  // Kimberley
  const kimberley = Math.exp(-Math.pow((x + 6) / 1.8, 2)) * Math.exp(-Math.pow((z + 5) / 1.5, 2)) * 0.4
  // Pilbara
  const pilbara = Math.exp(-Math.pow((x + 9) / 1.6, 2)) * Math.exp(-Math.pow((z + 3) / 1.8, 2)) * 0.3
  // Flinders Ranges (south)
  const flinders = Math.exp(-Math.pow((x + 0.5) / 1.2, 2)) * Math.exp(-Math.pow((z - 4.5) / 1.2, 2)) * 0.25
  // Tropical noise
  const fine = (Math.sin(x * 1.7) * Math.cos(z * 1.3) + Math.sin(x * 3.1 + 0.4) * Math.cos(z * 2.7)) * 0.06
  return east + centre + kimberley + pilbara + flinders + fine
}

function ContinentMesh() {
  // Load the textures. useTexture suspends until ready.
  const [earth, sandNorm, sandRough, rockNorm] = useTexture([
    NASA_EARTH_5400,
    SAND_NORM,
    SAND_ROUGH,
    ROCK_NORM
  ])

  // Configure the Earth texture so it shows only the Australia portion.
  const { uMin, uMax, vMin, vMax } = australiaUVCrop()
  earth.colorSpace = THREE.SRGBColorSpace
  earth.wrapS = THREE.ClampToEdgeWrapping
  earth.wrapT = THREE.ClampToEdgeWrapping
  earth.repeat.set(uMax - uMin, vMax - vMin)
  earth.offset.set(uMin, 1 - vMax)
  earth.anisotropy = 16
  earth.needsUpdate = true

  // Detail maps tile across the surface in their own UV channel.
  ;[sandNorm, sandRough, rockNorm].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(6, 4)
    t.anisotropy = 16
  })

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

    // The Earth texture is sampled by world-space XZ (matches the shape's
    // original XY before rotation). The ExtrudeGeometry's built-in UVs only
    // map the front/back faces correctly, so we override them.
    const pos = g.attributes.position
    const uv = g.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      // Normalised AU position in [0..1] across the world rect.
      const u = (x + 12) / 24
      const v = (z + 8) / 16
      uv.setXY(i, u, v)
    }
    uv.needsUpdate = true

    // Vertex displacement only on the top face (positive y vertices after rotation).
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      if (y > 0.05) {
        const elev = pseudoElevation(x, z)
        pos.setY(i, y + elev)
      }
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial
        map={earth}
        normalMap={sandNorm}
        normalScale={[0.55, 0.55]}
        roughnessMap={sandRough}
        roughness={0.92}
        metalness={0.02}
      />
    </mesh>
  )
}

export default function PocketContinent() {
  return (
    <group>
      <ContinentMesh />
    </group>
  )
}
