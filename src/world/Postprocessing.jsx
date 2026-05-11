import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useWorldStore } from './store.js'

export default function Postprocessing() {
  const tier = useWorldStore((s) => s.tier)
  if (tier !== 0) return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.35} luminanceThreshold={0.72} luminanceSmoothing={0.18} mipmapBlur radius={0.7} />
      <Vignette offset={0.30} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
