export const AU_BOUNDS = {
  latMin: -43.7,
  latMax: -10.7,
  lngMin: 112.9,
  lngMax: 153.7
}

const WORLD = {
  xMin: -12,
  xMax: 12,
  zMin: -8,
  zMax: 8
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

export function geoToWorld(lat, lng) {
  const tx = (lng - AU_BOUNDS.lngMin) / (AU_BOUNDS.lngMax - AU_BOUNDS.lngMin)
  const tz = (AU_BOUNDS.latMax - lat) / (AU_BOUNDS.latMax - AU_BOUNDS.latMin)
  return [lerp(WORLD.xMin, WORLD.xMax, tx), lerp(WORLD.zMin, WORLD.zMax, tz)]
}
