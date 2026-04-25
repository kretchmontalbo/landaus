import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Scroll-driven low-poly Sydney flythrough hero.
 * 5 stages: Harbor → Beach → Terraces → Federation → Front door.
 *
 * Camera position + lookAt are lerped between stage keyframes by scroll progress.
 * Materials are pure colour MeshStandardMaterial for a stylised, no-texture feel.
 */

// ---------- Aussie palette (mirrors --sandstone, --eucalyptus tokens) ----------
const PALETTE = {
  sandstone: '#E5C9A5',
  sandstoneDeep: '#B89968',
  eucalyptus: '#6B8F5E',
  eucalyptusDeep: '#3F5C32',
  goldenHour: '#FFB570',
  terracotta: '#C66E4A',
  harborBlue: '#4A90A4',
  cream: '#FFF6E6',
  white: '#F8F4ED',
  bridgeSteel: '#5C7280',
  beachSand: '#E8D7B0',
  pastelBlue: '#A6C4D2',
  pastelCream: '#F4E6C7',
  red: '#A53A2A',
  doorWood: '#8B5A3C'
}

const STAGES = [
  // Stage 1: Sydney Harbor at sunrise
  { camera: [0, 4, 14], lookAt: [0, 2, 0] },
  // Stage 2: Tilt toward beach
  { camera: [4, 3, 8], lookAt: [4, 1, -4] },
  // Stage 3: Inner-Sydney terraces
  { camera: [10, 2.4, 4], lookAt: [12, 1.5, 0] },
  // Stage 4: Federation suburb
  { camera: [18, 2.2, 6], lookAt: [20, 1.2, 0] },
  // Stage 5: Front door arrival
  { camera: [26, 1.6, 5], lookAt: [26, 1.6, 0] }
]

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerpV(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// ---------- Scroll-driven camera ----------
function ScrollCamera({ progressRef }) {
  const { camera } = useThree()
  useFrame(() => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1)
    const segCount = STAGES.length - 1
    const segF = p * segCount
    const segIdx = Math.min(Math.floor(segF), segCount - 1)
    const segT = easeInOutCubic(segF - segIdx)
    const pos = lerpV(STAGES[segIdx].camera, STAGES[segIdx + 1].camera, segT)
    const look = lerpV(STAGES[segIdx].lookAt, STAGES[segIdx + 1].lookAt, segT)
    camera.position.set(pos[0], pos[1], pos[2])
    camera.lookAt(look[0], look[1], look[2])
  })
  return null
}

// ---------- Water plane with subtle wave shader ----------
function Water() {
  const matRef = useRef()
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.userData.uTime = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -2]} receiveShadow>
      <planeGeometry args={[60, 30, 32, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color={PALETTE.harborBlue}
        metalness={0.3}
        roughness={0.6}
      />
    </mesh>
  )
}

// ---------- Stage 1: Opera House + Harbor Bridge ----------
function OperaHouse() {
  // Three white "sail" triangles using cone geometry sliced
  return (
    <group position={[-3, 0, -2]}>
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.9, 2.2, 3]} />
        <meshStandardMaterial color={PALETTE.white} roughness={0.7} />
      </mesh>
      <mesh position={[1.0, 1.0, 0.3]} rotation={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.7, 1.8, 3]} />
        <meshStandardMaterial color={PALETTE.white} roughness={0.7} />
      </mesh>
      <mesh position={[-0.9, 0.9, 0.4]} rotation={[0, -0.5, 0]} castShadow>
        <coneGeometry args={[0.6, 1.5, 3]} />
        <meshStandardMaterial color={PALETTE.white} roughness={0.7} />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.2, 1.6]} />
        <meshStandardMaterial color={PALETTE.sandstoneDeep} roughness={0.8} />
      </mesh>
    </group>
  )
}

function HarborBridge() {
  return (
    <group position={[3, 0, -3]}>
      {/* Arch — torus partial (visually reads as bridge) */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.4, 0.06, 8, 24, Math.PI]} />
        <meshStandardMaterial color={PALETTE.bridgeSteel} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Pylons */}
      <mesh position={[-1.4, 0.6, 0]}><boxGeometry args={[0.2, 1.2, 0.3]} /><meshStandardMaterial color={PALETTE.sandstoneDeep} /></mesh>
      <mesh position={[1.4, 0.6, 0]}><boxGeometry args={[0.2, 1.2, 0.3]} /><meshStandardMaterial color={PALETTE.sandstoneDeep} /></mesh>
      {/* Deck */}
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[3.2, 0.1, 0.3]} /><meshStandardMaterial color={PALETTE.bridgeSteel} /></mesh>
    </group>
  )
}

// ---------- Stage 2: Beach houses + palms ----------
function BeachScene() {
  return (
    <group position={[6, 0, -4]}>
      {/* Sand plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={PALETTE.beachSand} roughness={0.95} />
      </mesh>
      {/* Three pastel beach houses */}
      <BeachHouse position={[-2.4, 0, 0]} color={PALETTE.pastelCream} />
      <BeachHouse position={[0, 0, -0.3]} color={PALETTE.pastelBlue} />
      <BeachHouse position={[2.4, 0, 0]} color={PALETTE.sandstone} />
      {/* Palms */}
      <Palm position={[-3.5, 0, 1.6]} />
      <Palm position={[3.5, 0, 1.6]} />
    </group>
  )
}

function BeachHouse({ position, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[1.4, 1, 1.2]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
      {/* Pitched roof */}
      <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.05, 0.6, 4]} />
        <meshStandardMaterial color={PALETTE.terracotta} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Palm({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.07, 0.1, 1.4, 8]} /><meshStandardMaterial color={PALETTE.sandstoneDeep} /></mesh>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[Math.cos(i * 1.25) * 0.4, 1.5, Math.sin(i * 1.25) * 0.4]}>
          <sphereGeometry args={[0.35, 6, 6]} />
          <meshStandardMaterial color={PALETTE.eucalyptus} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Stage 3: Newtown terraces ----------
function Terraces() {
  const colors = [PALETTE.terracotta, PALETTE.pastelCream, PALETTE.sandstone, PALETTE.eucalyptus, PALETTE.cream]
  return (
    <group position={[12, 0, -1]}>
      {colors.map((c, i) => (
        <Terrace key={i} position={[i * 1.4 - 2.8, 0, 0]} color={c} />
      ))}
    </group>
  )
}

function Terrace({ position, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.2, 2.4, 1]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Iron lace balcony — thin frame */}
      <mesh position={[0, 1.6, 0.55]}>
        <boxGeometry args={[1.25, 0.05, 0.04]} />
        <meshStandardMaterial color={PALETTE.bridgeSteel} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.4, 0.55]}>
        <boxGeometry args={[1.25, 0.05, 0.04]} />
        <meshStandardMaterial color={PALETTE.bridgeSteel} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Small windows */}
      <mesh position={[0, 1.8, 0.51]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color={PALETTE.goldenHour} emissive={PALETTE.goldenHour} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function StreetLamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.04, 0.04, 2.4, 6]} /><meshStandardMaterial color={PALETTE.bridgeSteel} /></mesh>
      <mesh position={[0, 2.5, 0]}><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color={PALETTE.goldenHour} emissive={PALETTE.goldenHour} emissiveIntensity={1.5} /></mesh>
    </group>
  )
}

// ---------- Stage 4: Federation suburb ----------
function FederationHouse() {
  return (
    <group position={[20, 0, -1]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[2.4, 1.6, 2]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.85} />
      </mesh>
      {/* Pitched red tile roof */}
      <mesh position={[0, 2.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.8, 1.2, 4]} />
        <meshStandardMaterial color={PALETTE.red} roughness={0.7} />
      </mesh>
      {/* Picket fence */}
      {[-1, -0.5, 0, 0.5, 1].map(x => (
        <mesh key={x} position={[x, 0.3, 1.4]}>
          <boxGeometry args={[0.08, 0.45, 0.05]} />
          <meshStandardMaterial color={PALETTE.white} />
        </mesh>
      ))}
      {/* Eucalyptus tree */}
      <group position={[-2.5, 0, 0.5]}>
        <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.1, 0.15, 2, 8]} /><meshStandardMaterial color={PALETTE.sandstoneDeep} /></mesh>
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[Math.cos(i * 1.5) * 0.3, 2.1 + i * 0.15, Math.sin(i * 1.5) * 0.3]}>
            <sphereGeometry args={[0.45, 8, 8]} />
            <meshStandardMaterial color={PALETTE.eucalyptus} roughness={0.85} />
          </mesh>
        ))}
      </group>
      {/* Hills hoist clothesline (simple wireframe cross) */}
      <group position={[2.2, 0, 0.8]}>
        <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.04, 0.04, 2, 6]} /><meshStandardMaterial color={PALETTE.bridgeSteel} /></mesh>
        <mesh position={[0, 1.9, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 1.2, 6]} /><meshStandardMaterial color={PALETTE.bridgeSteel} /></mesh>
        <mesh position={[0, 1.9, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 1.2, 6]} /><meshStandardMaterial color={PALETTE.bridgeSteel} /></mesh>
      </group>
    </group>
  )
}

// ---------- Stage 5: Front door arrival ----------
function FrontDoor({ scrollRef }) {
  const doorRef = useRef()
  useFrame(() => {
    const p = scrollRef.current
    const open = THREE.MathUtils.clamp((p - 0.85) / 0.15, 0, 1)
    if (doorRef.current) doorRef.current.rotation.y = -open * Math.PI / 2.2
  })
  return (
    <group position={[26, 0, 0]}>
      {/* Door frame */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.4, 2.4, 0.18]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.85} />
      </mesh>
      {/* Door (hinged on left) */}
      <group position={[-0.5, 1.1, 0.1]}>
        <mesh ref={doorRef} position={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[1.0, 2.0, 0.06]} />
          <meshStandardMaterial color={PALETTE.doorWood} roughness={0.8} />
        </mesh>
      </group>
      {/* Welcome mat */}
      <mesh position={[0, 0.05, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color={PALETTE.eucalyptusDeep} />
      </mesh>
      {/* Warm interior light glow */}
      <pointLight position={[0, 1.2, -0.5]} color={PALETTE.goldenHour} intensity={2} distance={6} />
    </group>
  )
}

// ---------- Lighting ----------
function Sun() {
  return (
    <>
      <ambientLight color={PALETTE.cream} intensity={0.5} />
      <hemisphereLight color="#A6C4D2" groundColor={PALETTE.beachSand} intensity={0.4} />
      <directionalLight
        color={PALETTE.goldenHour}
        intensity={1.2}
        position={[8, 12, 6]}
        castShadow
      />
    </>
  )
}

// ---------- Sky gradient ----------
function SkyGradient() {
  return (
    <mesh position={[0, 0, -25]}>
      <planeGeometry args={[120, 60]} />
      <shaderMaterial
        uniforms={{
          colorTop: { value: new THREE.Color(PALETTE.harborBlue) },
          colorMid: { value: new THREE.Color('#FFB7A8') },
          colorBottom: { value: new THREE.Color(PALETTE.goldenHour) }
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
        fragmentShader={`
          uniform vec3 colorTop; uniform vec3 colorMid; uniform vec3 colorBottom;
          varying vec2 vUv;
          void main() {
            vec3 c = vUv.y > 0.5
              ? mix(colorMid, colorTop, (vUv.y - 0.5) * 2.0)
              : mix(colorBottom, colorMid, vUv.y * 2.0);
            gl_FragColor = vec4(c, 1.0);
          }
        `}
      />
    </mesh>
  )
}

// ---------- Caption that appears at the end ----------
function EndCaption({ scrollRef }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(scrollRef.current > 0.88)
    }, 200)
    return () => clearInterval(id)
  }, [scrollRef])
  return (
    <div
      className="sf-caption"
      style={{ opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : 12}px)` }}
    >
      <div className="sf-caption-eyebrow">Welcome home.</div>
      <div className="sf-caption-text">Your next chapter starts here.</div>
    </div>
  )
}

export default function SydneyFlythrough() {
  const sectionRef = useRef(null)
  const progressRef = useRef(0)
  const [dpr, setDpr] = useState([1, 2])
  const invalidateRef = useRef(null)

  useEffect(() => {
    function onScroll() {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const h = el.offsetHeight - window.innerHeight
      // 0 when section top hits viewport top, 1 when section bottom hits viewport bottom
      const scrolled = -rect.top
      progressRef.current = THREE.MathUtils.clamp(scrolled / Math.max(h, 1), 0, 1)
      if (invalidateRef.current) invalidateRef.current()
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} className="sf-section">
      <div className="sf-sticky">
        <Canvas
          shadows
          dpr={dpr}
          frameloop="always"
          camera={{ position: [0, 4, 14], fov: 55, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr([1, 1])}
            onIncline={() => setDpr([1, 2])}
          />
          <color attach="background" args={[PALETTE.cream]} />
          <SkyGradient />
          <Sun />
          <ScrollCamera progressRef={progressRef} />
          <Suspense fallback={null}>
            <Water />
            <OperaHouse />
            <HarborBridge />
            <BeachScene />
            <Terraces />
            <StreetLamp position={[10, 0, 1]} />
            <StreetLamp position={[14, 0, 1]} />
            <FederationHouse />
            <FrontDoor scrollRef={progressRef} />
          </Suspense>
        </Canvas>
        <EndCaption scrollRef={progressRef} />
        <div className="sf-scroll-hint" aria-hidden="true">
          <span>Scroll to fly through Sydney</span>
          <span className="sf-arrow">↓</span>
        </div>
      </div>
    </section>
  )
}
