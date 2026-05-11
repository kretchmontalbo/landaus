import { Environment, Stars, MeshReflectorMaterial } from '@react-three/drei'
import { useWorldStore } from './store.js'
import { HDRI_SUNSET } from './data/texture-urls.js'

function GlassOcean() {
  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <MeshReflectorMaterial
        blur={[400, 200]}
        resolution={1024}
        mixBlur={1.0}
        mixStrength={1.3}
        roughness={0.35}
        metalness={0.2}
        depthScale={0.5}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#3a6884"
        mirror={0.5}
      />
    </mesh>
  )
}

export default function WorldStage() {
  const tier = useWorldStore((s) => s.tier)
  return (
    <>
      <Environment files={HDRI_SUNSET} background blur={0} />
      <hemisphereLight args={['#ffd9a8', '#1a2030', 0.6]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={2.2}
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
      <directionalLight position={[-8, 6, -4]} intensity={0.25} color="#a6c4d2" />
      <ambientLight intensity={0.12} color="#fff6e6" />
      <fog attach="fog" args={['#e8a87c', 32, 100]} />
      {tier !== 1 && (
        <Stars radius={140} depth={50} count={tier === 0 ? 1400 : 500} factor={3} saturation={0.25} fade speed={0.25} />
      )}
      <GlassOcean />
    </>
  )
}
