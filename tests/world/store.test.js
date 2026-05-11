import { describe, it, expect, beforeEach } from 'vitest'
import { useWorldStore } from '../../src/world/store.js'

describe('world store', () => {
  beforeEach(() => {
    useWorldStore.setState({
      tier: null,
      audioEnabled: false,
      pocket: 'home',
      cameraTarget: null
    })
  })

  it('initialises with tier=null, audio off, pocket=home', () => {
    const s = useWorldStore.getState()
    expect(s.tier).toBeNull()
    expect(s.audioEnabled).toBe(false)
    expect(s.pocket).toBe('home')
    expect(s.cameraTarget).toBeNull()
  })

  it('setTier updates tier', () => {
    useWorldStore.getState().setTier(1)
    expect(useWorldStore.getState().tier).toBe(1)
  })

  it('toggleAudio flips audioEnabled', () => {
    useWorldStore.getState().toggleAudio()
    expect(useWorldStore.getState().audioEnabled).toBe(true)
    useWorldStore.getState().toggleAudio()
    expect(useWorldStore.getState().audioEnabled).toBe(false)
  })

  it('setPocket updates pocket id', () => {
    useWorldStore.getState().setPocket('about')
    expect(useWorldStore.getState().pocket).toBe('about')
  })

  it('setCameraTarget updates target', () => {
    useWorldStore.getState().setCameraTarget([1, 2, 3])
    expect(useWorldStore.getState().cameraTarget).toEqual([1, 2, 3])
  })
})
