import { Environment, Stars, MeshReflectorMaterial, useTexture } from '@react-three/drei'
import { useWorldStore } from './store.js'

const HDRI_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/industrial_sunset_puresky_2k.hdr'

function GlassOcean() {
  return (
    <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <MeshReflectorMaterial
        blur={[480, 240]}
        resolution={1024}
        mixBlur={1.2}
        mixStrength={1.4}
        roughness={0.55}
        metalness={0.15}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#1d3744"
        mirror={0.4}
      />
    </mesh>
  )
}

export default function WorldStage() {
  const tier = useWorldStore((s) => s.tier)
  return (
    <>
      <Environment files={HDRI_URL} background blur={0.32} />
      <hemisphereLight args={['#ffd9a8', '#1a2030', 0.35]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.4}
        color="#ffb878"
        castShadow={tier === 0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.2} color="#a6c4d2" />
      <ambientLight intensity={0.08} color="#fff6e6" />
      <fog attach="fog" args={['#2a2438', 30, 90]} />
      {tier !== 1 && (
        <Stars radius={120} depth={50} count={tier === 0 ? 1800 : 600} factor={3.2} saturation={0.3} fade speed={0.3} />
      )}
      <GlassOcean />
    </>
  )
}
