import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const RADIUS = 22
const PITCH_MIN = 0.15
const PITCH_MAX = 1.15
const ROT_LERP = 0.06

export default function DroneRig() {
  const cameraRef = useRef()
  const { gl } = useThree()
  const yaw = useRef(0.5)
  const pitch = useRef(0.6)
  const targetYaw = useRef(0.5)
  const targetPitch = useRef(0.6)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)

  useEffect(() => {
    const el = gl.domElement

    function onDown(e) {
      dragging.current = true
      const p = 'touches' in e ? e.touches[0] : e
      lastX.current = p.clientX
      lastY.current = p.clientY
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
    }
    function onUp() { dragging.current = false }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [gl])

  useFrame(() => {
    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, ROT_LERP)
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, ROT_LERP)
    const x = RADIUS * Math.cos(pitch.current) * Math.sin(yaw.current)
    const y = RADIUS * Math.sin(pitch.current) + 4
    const z = RADIUS * Math.cos(pitch.current) * Math.cos(yaw.current)
    if (cameraRef.current) {
      cameraRef.current.position.set(x, y, z)
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={42} near={0.1} far={200} position={[0, 14, RADIUS]} />
}
