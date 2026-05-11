import { describe, it, expect } from 'vitest'
import { geoToWorld, AU_BOUNDS } from '../../src/world/coords.js'

describe('geoToWorld', () => {
  it('maps Sydney (-33.87, 151.21) to the east side of the continent', () => {
    const [x] = geoToWorld(-33.87, 151.21)
    expect(x).toBeGreaterThan(8)
    expect(x).toBeLessThan(12)
  })

  it('maps Perth (-31.95, 115.86) to the west side', () => {
    const [x] = geoToWorld(-31.95, 115.86)
    expect(x).toBeLessThan(-8)
    expect(x).toBeGreaterThan(-12)
  })

  it('maps Darwin (-12.46, 130.84) to the north', () => {
    const [, z] = geoToWorld(-12.46, 130.84)
    expect(z).toBeLessThan(-6)
  })

  it('maps Hobart (-42.88, 147.32) to the south', () => {
    const [, z] = geoToWorld(-42.88, 147.32)
    expect(z).toBeGreaterThan(6)
  })

  it('returns a tuple of two finite numbers for valid input', () => {
    const [x, z] = geoToWorld(-25, 135)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('exports AU_BOUNDS with lat/lng extents', () => {
    expect(AU_BOUNDS.latMin).toBeLessThan(AU_BOUNDS.latMax)
    expect(AU_BOUNDS.lngMin).toBeLessThan(AU_BOUNDS.lngMax)
  })
})
