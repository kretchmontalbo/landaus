// External texture URLs. All sources verified to send
// `Access-Control-Allow-Origin: *` so they work with three.js's
// TextureLoader (which sets crossOrigin = "anonymous" by default).

const PH = (set, kind) => `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/${set}/${set}_${kind}_2k.jpg`

// Polyhaven CC0 aerial PBR sets — these are the surface material.
export const SAND_DIFF  = PH('aerial_sand', 'diff')
export const SAND_NORM  = PH('aerial_sand', 'nor_gl')
export const SAND_ROUGH = PH('aerial_sand', 'rough')
export const GRASS_DIFF = PH('aerial_grass_rock', 'diff')
export const GRASS_NORM = PH('aerial_grass_rock', 'nor_gl')
export const GRASS_ROUGH = PH('aerial_grass_rock', 'rough')
export const ROCK_DIFF  = PH('aerial_rocks_02', 'diff')
export const ROCK_NORM  = PH('aerial_rocks_02', 'nor_gl')

// Polyhaven HDRI environment for the world sky.
// "the_sky_is_on_fire" is a dramatic warm sunset — much more cinematic
// than the muted industrial_sunset alternative.
export const HDRI_SUNSET = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/the_sky_is_on_fire_2k.hdr'
