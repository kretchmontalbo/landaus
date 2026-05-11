import { Environment, Stars, Cloud, Clouds } from '@react-three/drei'
import { useWorldStore } from './store.js'

export default function WorldStage() {
  const tier = useWorldStore((s) => s.tier)
  return (
    <>
      <Environment preset="sunset" background={false} />
      <hemisphereLight args={['#ffd9a8', '#3f5c32', 0.55]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.6}
        color="#ffb570"
      />
      <directionalLight
        position={[-8, 6, -4]}
        intensity={0.35}
        color="#a6c4d2"
      />
      <ambientLight intensity={0.18} color="#fff6e6" />
      <color attach="background" args={['#3a2a3f']} />
      <fog attach="fog" args={['#d8a878', 26, 80]} />
      {tier !== 1 && (
        <Stars radius={120} depth={50} count={tier === 0 ? 2000 : 800} factor={3.2} saturation={0.4} fade speed={0.4} />
      )}
      {tier === 0 && (
        <Clouds material={undefined} limit={20}>
          <Cloud seed={1} segments={20} bounds={[14, 1.2, 4]} volume={5} color="#fff6e6" position={[-6, 8, -10]} opacity={0.55} />
          <Cloud seed={2} segments={16} bounds={[12, 1.0, 3]} volume={4} color="#ffe6c8" position={[9, 9, -14]} opacity={0.4} />
          <Cloud seed={3} segments={12} bounds={[10, 0.8, 2.5]} volume={3} color="#fff6e6" position={[3, 11, 14]} opacity={0.3} />
        </Clouds>
      )}
    </>
  )
}
