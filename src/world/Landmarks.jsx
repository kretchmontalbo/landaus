import { useMemo } from 'react'
import * as THREE from 'three'
import { geoToWorld } from './coords.js'
import { LANDMARKS } from './data/cities.js'

const SAIL_COLOR = '#fff6e6'
const ULURU_COLOR = '#9a4226'
const APOSTLE_COLOR = '#b8946a'
const LIGHTHOUSE_BODY = '#fff6e6'
const LIGHTHOUSE_BAND = '#a53a2a'

function operaSailGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.quadraticCurveTo(0.4, 0.9, 1.1, 1.05)
  s.lineTo(1.05, 0)
  s.lineTo(0, 0)
  return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 })
}

function OperaHouse({ position }) {
  const geo = useMemo(operaSailGeometry, [])
  return (
    <group position={position} rotation={[0, 0.4, 0]} scale={0.18}>
      {[
        { x: 0,    y: 0, z: 0,    s: 1.0, ry: 0     },
        { x: -0.7, y: 0, z: 0.05, s: 0.85, ry: 0.18 },
        { x: 0.7,  y: 0, z: 0.05, s: 0.85, ry: -0.18 },
        { x: 0,    y: 0, z: 1.0,  s: 0.7, ry: Math.PI - 0.2 },
        { x: -0.5, y: 0, z: 1.05, s: 0.55, ry: Math.PI + 0.05 },
        { x: 0.5,  y: 0, z: 1.05, s: 0.55, ry: Math.PI - 0.05 }
      ].map((s, i) => (
        <mesh key={i} geometry={geo} position={[s.x, s.y, s.z]} rotation={[0, s.ry, 0]} scale={s.s}>
          <meshStandardMaterial color={SAIL_COLOR} roughness={0.45} metalness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, -0.15, 0.5]}>
        <boxGeometry args={[3.4, 0.18, 1.6]} />
        <meshStandardMaterial color="#cdb38b" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Uluru({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
        <meshStandardMaterial color={ULURU_COLOR} roughness={1} metalness={0} flatShading />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 24]} />
        <meshStandardMaterial color="#3f5c32" roughness={1} opacity={0.5} transparent />
      </mesh>
    </group>
  )
}

function TwelveApostles({ position }) {
  const stacks = [
    { x: 0,    y: 0.55, h: 1.1, s: 0.2 },
    { x: 0.5,  y: 0.45, h: 0.9, s: 0.18 },
    { x: -0.4, y: 0.50, h: 1.0, s: 0.16 },
    { x: 0.9,  y: 0.40, h: 0.8, s: 0.15 },
    { x: -0.85, y: 0.42, h: 0.85, s: 0.17 }
  ]
  return (
    <group position={position}>
      {stacks.map((st, i) => (
        <mesh key={i} position={[st.x, st.y, 0]}>
          <cylinderGeometry args={[st.s * 0.85, st.s, st.h, 8]} />
          <meshStandardMaterial color={APOSTLE_COLOR} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function Lighthouse({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.4, 16]} />
        <meshStandardMaterial color={LIGHTHOUSE_BODY} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.18, 16]} />
        <meshStandardMaterial color={LIGHTHOUSE_BAND} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <coneGeometry args={[0.22, 0.3, 16]} />
        <meshStandardMaterial color="#5c7280" roughness={0.4} metalness={0.4} />
      </mesh>
      <pointLight position={[0, 1.3, 0]} intensity={2.2} distance={6} color="#ffe6c8" />
    </group>
  )
}

const RENDERERS = {
  'opera-house': OperaHouse,
  uluru: Uluru,
  'twelve-apostles': TwelveApostles,
  'byron-lighthouse': Lighthouse
}

export default function Landmarks() {
  return (
    <group>
      {LANDMARKS.map((lm) => {
        const Component = RENDERERS[lm.slug]
        if (!Component) return null
        const [x, z] = geoToWorld(lm.lat, lm.lng)
        const y = lm.slug === 'twelve-apostles' ? -0.1 : 0.62
        return <Component key={lm.slug} position={[x, y, z]} />
      })}
    </group>
  )
}
