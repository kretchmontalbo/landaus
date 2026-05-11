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
  return (
    <div className="hud-frame" role="region" aria-label="3D world controls">
      <button
        type="button"
        className="hud-frame__btn"
        onClick={toggleAudio}
        aria-pressed={audioEnabled}
        aria-label="Toggle audio"
        title={audioEnabled ? 'Mute' : 'Unmute'}
      >
        {audioEnabled ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}
      </button>
      <button
        type="button"
        className="hud-frame__btn hud-frame__btn--exit"
        onClick={exitWorld}
        aria-label="Switch to classic site"
        title="Switch to classic site"
      >
        <X size={15} aria-hidden /> Classic
      </button>
    </div>
  )
}
