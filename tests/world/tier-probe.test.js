import { describe, it, expect } from 'vitest'
import { classifyTier } from '../../src/world/tier-probe.js'

function mockEnv(overrides = {}) {
  return {
    webgl2: true,
    reducedMotion: false,
    deviceMemoryGB: 8,
    connectionEffectiveType: '4g',
    hardwareConcurrency: 8,
    ...overrides
  }
}

describe('classifyTier', () => {
  it('returns 0 (full) for a high-spec environment', () => {
    expect(classifyTier(mockEnv())).toBe(0)
  })

  it('returns 2 (static) when webgl2 unsupported', () => {
    expect(classifyTier(mockEnv({ webgl2: false }))).toBe(2)
  })

  it('returns 2 (static) when reduced motion is requested', () => {
    expect(classifyTier(mockEnv({ reducedMotion: true }))).toBe(2)
  })

  it('returns 2 (static) on slow-2g connection', () => {
    expect(classifyTier(mockEnv({ connectionEffectiveType: 'slow-2g' }))).toBe(2)
  })

  it('returns 1 (lite) when device memory is low', () => {
    expect(classifyTier(mockEnv({ deviceMemoryGB: 2 }))).toBe(1)
  })

  it('returns 1 (lite) when CPU is weak', () => {
    expect(classifyTier(mockEnv({ hardwareConcurrency: 2 }))).toBe(1)
  })

  it('handles missing memory/connection gracefully (treats as unknown = pass)', () => {
    expect(classifyTier(mockEnv({ deviceMemoryGB: null, connectionEffectiveType: null }))).toBe(0)
  })
})
