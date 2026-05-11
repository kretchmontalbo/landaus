import { useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'

function CardFront({ photo, w, h }) {
  const tex = useTexture(photo)
  if (tex) {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 16
  }
  return (
    <mesh position={[0, 0, 0.041]}>
      <planeGeometry args={[w - 0.06, h - 0.06]} />
      <meshPhysicalMaterial
        map={tex}
        roughness={0.35}
        metalness={0.0}
        clearcoat={0.6}
        clearcoatRoughness={0.18}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

function CardFrame({ w, h }) {
  return (
    <RoundedBox args={[w, h, 0.08]} radius={0.05} smoothness={5} castShadow>
      <meshPhysicalMaterial
        color="#fff6e6"
        roughness={0.22}
        metalness={0.05}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        transmission={0.04}
        ior={1.45}
      />
    </RoundedBox>
  )
}

export default function PhotoCard({
  position,
  rotationY = 0,
  width = 1.6,
  height = 1.05,
  photo,
  label,
  sublabel,
  onClick,
  hoverScale = 1.04,
  tilt = -0.08,
  emissive = false
}) {
  const ref = useRef()
  const hovered = useRef(false)
  const scale = useRef(1)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const target = hovered.current ? hoverScale : 1
    scale.current = THREE.MathUtils.lerp(scale.current, target, 0.12)
    ref.current.scale.setScalar(scale.current)
    // Subtle float
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.04
  })

  return (
    <group
      ref={ref}
      position={position}
      rotation={[tilt, rotationY, 0]}
      onPointerOver={(e) => { e.stopPropagation(); hovered.current = true; document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { hovered.current = false; document.body.style.cursor = 'auto' }}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
    >
      <CardFrame w={width} h={height} />
      <Suspense fallback={null}>
        <CardFront photo={photo} w={width} h={height} />
      </Suspense>
      {emissive && (
        <pointLight position={[0, 0, 0.5]} intensity={0.45} distance={2.4} color="#ffe6c8" />
      )}
      <Html position={[0, -height / 2 - 0.22, 0]} center distanceFactor={6} occlude={false} zIndexRange={[1, 0]}>
        <div className="photo-card-label" aria-hidden="true">
          <div className="photo-card-label__title">{label}</div>
          {sublabel && <div className="photo-card-label__sub">{sublabel}</div>}
        </div>
      </Html>
    </group>
  )
}
