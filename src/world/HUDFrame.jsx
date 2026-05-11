import { Volume2, VolumeX, X } from 'lucide-react'
import { useWorldStore } from './store.js'
import { setWorldEnabled } from './feature-flag.js'

function exitWorld() {
  setWorldEnabled(false)
  window.location.search = ''
}

export default function HUDFrame() {
  const audioEnabled = useWorldStore((s) => s.audioEnabled)
  const toggleAudio = useWorldStore((s) => s.toggleAudio)
  const tier = useWorldStore((s) => s.tier)
  return (
    <div className="hud-frame" role="region" aria-label="3D world controls">
      <div className="hud-frame__mark">
        LandAus · 3D
        <span className="hud-frame__tier" aria-label={`Tier ${tier}`}>T{tier ?? '?'}</span>
      </div>
      <div className="hud-frame__actions">
        <button type="button" className="hud-frame__btn" onClick={toggleAudio} aria-pressed={audioEnabled} aria-label="Toggle audio">
          {audioEnabled ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
        </button>
        <button type="button" className="hud-frame__btn hud-frame__btn--exit" onClick={exitWorld} aria-label="Switch to classic site">
          <X size={16} aria-hidden /> Classic
        </button>
      </div>
    </div>
  )
}
