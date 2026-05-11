import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useWorldStore } from './store.js'
import { ROUTE_SHOTS } from './data/route-cameras.js'

const PITCH_MIN = 0.12
const PITCH_MAX = 1.2
const ROT_LERP = 0.06
const SHOT_LERP = 0.035
const IDLE_DRIFT = 0.04 // gentle yaw drift when user isn't dragging

export default function DroneRig() {
  const cameraRef = useRef()
  const { gl } = useThree()
  const pocket = useWorldStore((s) => s.pocket)

  // Current and target shot params (radius/height/yaw/pitch baselines)
  const shotRadius = useRef(22)
  const shotHeight = useRef(4.5)
  const targetShotRadius = useRef(22)
  const targetShotHeight = useRef(4.5)

  const yaw = useRef(0.5)
  const pitch = useRef(0.62)
  const targetYaw = useRef(0.5)
  const targetPitch = useRef(0.62)

  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const lastInteraction = useRef(0)

  // Apply new shot whenever pocket changes
  useEffect(() => {
    const shot = ROUTE_SHOTS[pocket] || ROUTE_SHOTS.default
    targetYaw.current = shot.yaw
    targetPitch.current = shot.pitch
    targetShotRadius.current = shot.radius
    targetShotHeight.current = shot.height
    lastInteraction.current = performance.now()
  }, [pocket])

  useEffect(() => {
    const el = gl.domElement

    function onDown(e) {
      dragging.current = true
      const p = 'touches' in e ? e.touches[0] : e
      lastX.current = p.clientX
      lastY.current = p.clientY
      lastInteraction.current = performance.now()
    }
    function onMove(e) {
      if (!dragging.current) return
      const p = 'touches' in e ? e.touches[0] : e
      const dx = p.clientX - lastX.current
      const dy = p.clientY - lastY.current
      lastX.current = p.clientX
      lastY.current = p.clientY
      targetYaw.current -= dx * 0.005
      targetPitch.current = THREE.MathUtils.clamp(targetPitch.current - dy * 0.005, PITCH_MIN, PITCH_MAX)
      lastInteraction.current = performance.now()
    }
    function onUp() { dragging.current = false }
    function onWheel(e) {
      targetShotRadius.current = THREE.MathUtils.clamp(targetShotRadius.current + e.deltaY * 0.02, 8, 38)
      lastInteraction.current = performance.now()
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  useFrame((_, delta) => {
    // Idle drift: small yaw movement when no interaction for >4s
    const idleSec = (performance.now() - lastInteraction.current) / 1000
    if (idleSec > 4) {
      targetYaw.current += delta * IDLE_DRIFT * Math.sin(performance.now() * 0.00015)
    }

    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, ROT_LERP)
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, ROT_LERP)
    shotRadius.current = THREE.MathUtils.lerp(shotRadius.current, targetShotRadius.current, SHOT_LERP)
    shotHeight.current = THREE.MathUtils.lerp(shotHeight.current, targetShotHeight.current, SHOT_LERP)

    const r = shotRadius.current
    const x = r * Math.cos(pitch.current) * Math.sin(yaw.current)
    const y = r * Math.sin(pitch.current) + shotHeight.current
    const z = r * Math.cos(pitch.current) * Math.cos(yaw.current)
    if (cameraRef.current) {
      cameraRef.current.position.set(x, y, z)
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={42} near={0.1} far={300} position={[0, 14, 22]} />
}
