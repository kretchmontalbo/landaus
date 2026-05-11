// Approximate centers for placing markers when only state is known.
// (Real suburb-level geocoding is a Phase 4+ concern.)
export const STATE_CENTERS = {
  NSW: { lat: -33.8688, lng: 151.2093 },
  VIC: { lat: -37.8136, lng: 144.9631 },
  QLD: { lat: -27.4698, lng: 153.0251 },
  WA:  { lat: -31.9523, lng: 115.8613 },
  SA:  { lat: -34.9285, lng: 138.6007 },
  ACT: { lat: -35.2809, lng: 149.1300 },
  NT:  { lat: -12.4634, lng: 130.8456 },
  TAS: { lat: -42.8821, lng: 147.3272 }
}

// Hash a string to a small deterministic offset so listings in the same
// state spread around their capital instead of stacking at one point.
export function jitterFromString(s, seed = 0) {
  let h = 2166136261 + seed
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const r1 = ((h >>> 0) % 1000) / 1000
  const r2 = ((h >>> 8) % 1000) / 1000
  return [(r1 - 0.5) * 1.6, (r2 - 0.5) * 1.6]
}
