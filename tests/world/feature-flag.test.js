import { describe, it, expect, beforeEach } from 'vitest'
import { isWorldEnabled, persistFlagFromUrl } from '../../src/world/feature-flag.js'

function setUrl(search) {
  window.history.replaceState({}, '', '/' + (search ? `?${search}` : ''))
}

describe('feature-flag', () => {
  beforeEach(() => {
    localStorage.clear()
    setUrl('')
  })

  it('returns false by default', () => {
    expect(isWorldEnabled()).toBe(false)
  })

  it('returns true when ?3d=1 in URL', () => {
    setUrl('3d=1')
    expect(isWorldEnabled()).toBe(true)
  })

  it('returns true when localStorage flag is set', () => {
    localStorage.setItem('landaus.3d.on', '1')
    expect(isWorldEnabled()).toBe(true)
  })

  it('returns false when ?3d=0 in URL (overrides storage)', () => {
    localStorage.setItem('landaus.3d.on', '1')
    setUrl('3d=0')
    expect(isWorldEnabled()).toBe(false)
  })

  it('persistFlagFromUrl writes storage on ?3d=1', () => {
    setUrl('3d=1')
    persistFlagFromUrl()
    expect(localStorage.getItem('landaus.3d.on')).toBe('1')
  })

  it('persistFlagFromUrl clears storage on ?3d=0', () => {
    localStorage.setItem('landaus.3d.on', '1')
    setUrl('3d=0')
    persistFlagFromUrl()
    expect(localStorage.getItem('landaus.3d.on')).toBeNull()
  })
})
