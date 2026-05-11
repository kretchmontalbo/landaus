import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useWorldStore } from './store.js'

export default function Postprocessing() {
  const tier = useWorldStore((s) => s.tier)
  if (tier !== 0) return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.18} mipmapBlur radius={0.75} />
      <ChromaticAberration offset={[0.0006, 0.0008]} radialModulation={false} modulationOffset={0} />
      <Vignette offset={0.25} darkness={0.65} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
