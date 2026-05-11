import { describe, it, expect, beforeEach } from 'vitest'
import { isWorldEnabled, persistFlagFromUrl, setWorldEnabled } from '../../src/world/feature-flag.js'

function setUrl(search) {
  window.history.replaceState({}, '', '/' + (search ? `?${search}` : ''))
}

describe('feature-flag', () => {
  beforeEach(() => {
    localStorage.clear()
    setUrl('')
  })

  it('returns true by default (3D on by default)', () => {
    expect(isWorldEnabled()).toBe(true)
  })

  it('returns false when ?3d=0 in URL (opt out)', () => {
    setUrl('3d=0')
    expect(isWorldEnabled()).toBe(false)
  })

  it('returns true when ?3d=1 in URL (opt back in)', () => {
    localStorage.setItem('landaus.3d.off', '1')
    setUrl('3d=1')
    expect(isWorldEnabled()).toBe(true)
  })

  it('returns false when opt-out flag is in localStorage', () => {
    localStorage.setItem('landaus.3d.off', '1')
    expect(isWorldEnabled()).toBe(false)
  })

  it('persistFlagFromUrl sets opt-out flag on ?3d=0', () => {
    setUrl('3d=0')
    persistFlagFromUrl()
    expect(localStorage.getItem('landaus.3d.off')).toBe('1')
  })

  it('persistFlagFromUrl clears opt-out flag on ?3d=1', () => {
    localStorage.setItem('landaus.3d.off', '1')
    setUrl('3d=1')
    persistFlagFromUrl()
    expect(localStorage.getItem('landaus.3d.off')).toBeNull()
  })

  it('setWorldEnabled(false) writes opt-out flag', () => {
    setWorldEnabled(false)
    expect(localStorage.getItem('landaus.3d.off')).toBe('1')
  })

  it('setWorldEnabled(true) clears opt-out flag', () => {
    localStorage.setItem('landaus.3d.off', '1')
    setWorldEnabled(true)
    expect(localStorage.getItem('landaus.3d.off')).toBeNull()
  })
})
