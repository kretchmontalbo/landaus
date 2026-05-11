import { Sky } from '@react-three/drei'

export default function WorldStage() {
  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[2, 0.6, 1]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={6}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.85}
      />
      <hemisphereLight args={['#ffd9a8', '#3f5c32', 0.6]} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.4}
        color="#ffb570"
        castShadow={false}
      />
      <ambientLight intensity={0.2} color="#fff6e6" />
      <fog attach="fog" args={['#f4d8a8', 22, 60]} />
    </>
  )
}
