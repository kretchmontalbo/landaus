import { EffectComposer, Bloom, Vignette, DepthOfField, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useWorldStore } from './store.js'

export default function Postprocessing() {
  const tier = useWorldStore((s) => s.tier)
  if (tier !== 0) return null
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField focusDistance={0.012} focalLength={0.05} bokehScale={2.2} height={480} />
      <Bloom intensity={0.45} luminanceThreshold={0.6} luminanceSmoothing={0.18} mipmapBlur radius={0.8} />
      <ChromaticAberration offset={[0.0005, 0.0007]} radialModulation={false} modulationOffset={0} />
      <Vignette offset={0.28} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
