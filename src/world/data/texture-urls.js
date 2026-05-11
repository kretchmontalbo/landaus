// External texture URLs (CDN-hosted, no API key required).

// NASA Visible Earth "Blue Marble Next Generation" — equirectangular
// 5400×2700, public domain. Used cropped to the Australia bounds.
export const NASA_EARTH_5400 = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73776/world.topo.bathy.200408.3x5400x2700.jpg'

// Polyhaven CC0 aerial PBR maps — used for surface detail / normal maps.
const PH = (set, kind) => `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/${set}/${set}_${kind}_2k.jpg`
export const SAND_DIFF  = PH('aerial_sand', 'diff')
export const SAND_NORM  = PH('aerial_sand', 'nor_gl')
export const SAND_ROUGH = PH('aerial_sand', 'rough')
export const ROCK_DIFF  = PH('aerial_rocks_02', 'diff')
export const ROCK_NORM  = PH('aerial_rocks_02', 'nor_gl')

// Polyhaven HDRI environment for the world sky.
export const HDRI_SUNSET = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/industrial_sunset_puresky_2k.hdr'

// Australia bounds in lat/lng, used to compute UV crop on the equirectangular
// Earth texture so the continent mesh shows the real satellite imagery.
import { AU_BOUNDS } from '../coords.js'
export function australiaUVCrop() {
  // Equirectangular: u = (lng + 180) / 360 ; v = (90 - lat) / 180
  const uMin = (AU_BOUNDS.lngMin + 180) / 360
  const uMax = (AU_BOUNDS.lngMax + 180) / 360
  const vMin = (90 - AU_BOUNDS.latMax) / 180
  const vMax = (90 - AU_BOUNDS.latMin) / 180
  return { uMin, uMax, vMin, vMax }
}
