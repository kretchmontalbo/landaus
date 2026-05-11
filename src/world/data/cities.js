// City + landmark data for the world. Photo URLs are Unsplash hot-link
// URLs (the same pattern the existing site already uses for hero +
// suburb-showcase imagery).

const UNSPLASH = (id, w = 900, q = 80) => `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format`

export const CITIES = [
  { slug: 'sydney',    name: 'Sydney',    state: 'NSW', lat: -33.8688, lng: 151.2093, photo: UNSPLASH('1506905925346-21bda4d32df4', 900) },
  { slug: 'melbourne', name: 'Melbourne', state: 'VIC', lat: -37.8136, lng: 144.9631, photo: UNSPLASH('1523482580672-f109ba8cb9be', 900) },
  { slug: 'brisbane',  name: 'Brisbane',  state: 'QLD', lat: -27.4698, lng: 153.0251, photo: UNSPLASH('1500917293891-ef795e70e1f6', 900) },
  { slug: 'perth',     name: 'Perth',     state: 'WA',  lat: -31.9523, lng: 115.8613, photo: UNSPLASH('1493238792000-8113da705763', 900) },
  { slug: 'adelaide',  name: 'Adelaide',  state: 'SA',  lat: -34.9285, lng: 138.6007, photo: UNSPLASH('1466442929976-97f336a657be', 900) },
  { slug: 'canberra',  name: 'Canberra',  state: 'ACT', lat: -35.2809, lng: 149.1300, photo: UNSPLASH('1556610961-2fecc5927173', 900) },
  { slug: 'darwin',    name: 'Darwin',    state: 'NT',  lat: -12.4634, lng: 130.8456, photo: UNSPLASH('1551434678-e076c223a692', 900) },
  { slug: 'hobart',    name: 'Hobart',    state: 'TAS', lat: -42.8821, lng: 147.3272, photo: UNSPLASH('1523428096881-5bd79d043006', 900) }
]

export const LANDMARKS = [
  { slug: 'sydney-icon',    name: 'Sydney Harbour', lat: -33.8568, lng: 151.2153, photo: UNSPLASH('1523482580672-f109ba8cb9be', 1200), tall: true },
  { slug: 'red-centre',     name: 'Red Centre',     lat: -25.3444, lng: 131.0369, photo: UNSPLASH('1564013799919-ab600027ffc6', 1200), tall: false },
  { slug: 'great-ocean',    name: 'Great Ocean',    lat: -38.6655, lng: 143.1043, photo: UNSPLASH('1551434678-e076c223a692', 1200), tall: false },
  { slug: 'east-coast',     name: 'East Coast',     lat: -28.6361, lng: 153.6361, photo: UNSPLASH('1500917293891-ef795e70e1f6', 1200), tall: true }
]
