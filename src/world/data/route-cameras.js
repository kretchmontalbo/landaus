// Camera "shot" per route. Map is now the hero — keep camera high and tilted
// down so the continent fills the frame. Pitch closer to top-down for the
// search/affordability/map routes; lower angles for content pages.
export const ROUTE_SHOTS = {
  home:           { yaw: 0.25, pitch: 0.85, radius: 24, height: 6 },
  search:         { yaw: 0.20, pitch: 1.05, radius: 26, height: 9 },
  about:          { yaw: 0.45, pitch: 0.65, radius: 22, height: 4 },
  'for-tenants':  { yaw: -0.2, pitch: 0.55, radius: 20, height: 3 },
  'for-landlords':{ yaw: 0.9,  pitch: 0.55, radius: 20, height: 3 },
  suburbs:        { yaw: 0.35, pitch: 0.85, radius: 24, height: 6 },
  suburb:         { yaw: 0.30, pitch: 0.55, radius: 16, height: 2.4 },
  property:       { yaw: 0.25, pitch: 0.50, radius: 14, height: 1.8 },
  dashboard:      { yaw: 1.4,  pitch: 0.75, radius: 24, height: 5 },
  account:        { yaw: 1.4,  pitch: 0.75, radius: 24, height: 5 },
  admin:          { yaw: 1.4,  pitch: 0.75, radius: 24, height: 5 },
  login:          { yaw: 1.9,  pitch: 0.42, radius: 18, height: 2.0 },
  signup:         { yaw: 2.1,  pitch: 0.42, radius: 18, height: 2.0 },
  affordability:  { yaw: 0.20, pitch: 1.15, radius: 28, height: 11 },
  map:            { yaw: 0.20, pitch: 1.10, radius: 28, height: 10 },
  pricing:        { yaw: 0.9,  pitch: 0.55, radius: 20, height: 3 },
  advertise:      { yaw: 0.9,  pitch: 0.55, radius: 20, height: 3 },
  contact:        { yaw: 0.9,  pitch: 0.55, radius: 20, height: 3 },
  default:        { yaw: 0.25, pitch: 0.85, radius: 24, height: 6 }
}
