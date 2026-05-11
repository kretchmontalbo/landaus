import { useMemo } from 'react'
import * as THREE from 'three'

const SANDSTONE = '#E5C9A5'
const EUCALYPTUS = '#6B8F5E'
const OUTBACK = '#C66E4A'
const OCEAN = '#4A90A4'

function ContinentMesh() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-10, -6)
    s.bezierCurveTo(-11, -4, -11, 0, -10, 4)
    s.bezierCurveTo(-8, 6.5, -4, 7, 0, 6.8)
    s.bezierCurveTo(4, 7, 8, 6, 10, 4)
    s.bezierCurveTo(11.5, 1, 11, -3, 9, -5)
    s.bezierCurveTo(6, -7, 2, -7.2, -2, -6.8)
    s.bezierCurveTo(-6, -7, -9, -7, -10, -6)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.1, bevelSegments: 2 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={SANDSTONE} roughness={0.95} metalness={0} />
    </mesh>
  )
}

function OutbackPatch() {
  return (
    <mesh position={[0.5, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.4, 32]} />
      <meshStandardMaterial color={OUTBACK} roughness={1} metalness={0} />
    </mesh>
  )
}

function CoastalFringe() {
  return (
    <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[7.5, 11.5, 64]} />
      <meshStandardMaterial color={EUCALYPTUS} roughness={1} metalness={0} transparent opacity={0.55} />
    </mesh>
  )
}

function Ocean() {
  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color={OCEAN} roughness={0.7} metalness={0.1} />
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
    </group>
  )
}
