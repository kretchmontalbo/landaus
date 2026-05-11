// Camera "shot" per route. Pitch is the angle above the horizon
// (0 = pointing at horizon, 1 = pointing nearly straight down).
// We want the HDRI sunset sky to fill ~40-60% of frame on most routes
// so the world feels real, not a top-down map.
export const ROUTE_SHOTS = {
  home:           { yaw: 0.35, pitch: 0.38, radius: 22, height: 2.2 },
  search:         { yaw: 0.25, pitch: 0.68, radius: 24, height: 5.5 },
  about:          { yaw: 0.80, pitch: 0.28, radius: 18, height: 1.6 },
  'for-tenants':  { yaw: -0.4, pitch: 0.28, radius: 16, height: 1.4 },
  'for-landlords':{ yaw: 1.1,  pitch: 0.28, radius: 16, height: 1.4 },
  suburbs:        { yaw: 0.40, pitch: 0.42, radius: 20, height: 2.6 },
  suburb:         { yaw: 0.40, pitch: 0.32, radius: 14, height: 1.4 },
  property:       { yaw: 0.35, pitch: 0.32, radius: 12, height: 1.2 },
  dashboard:      { yaw: 1.5,  pitch: 0.42, radius: 20, height: 2.6 },
  account:        { yaw: 1.5,  pitch: 0.42, radius: 20, height: 2.6 },
  admin:          { yaw: 1.5,  pitch: 0.42, radius: 20, height: 2.6 },
  login:          { yaw: 2.0,  pitch: 0.24, radius: 16, height: 1.2 },
  signup:         { yaw: 2.2,  pitch: 0.24, radius: 16, height: 1.2 },
  affordability:  { yaw: 0.20, pitch: 0.80, radius: 26, height: 7 },
  map:            { yaw: 0.22, pitch: 0.78, radius: 26, height: 7 },
  pricing:        { yaw: 1.1,  pitch: 0.30, radius: 16, height: 1.6 },
  advertise:      { yaw: 1.1,  pitch: 0.30, radius: 16, height: 1.6 },
  contact:        { yaw: 1.1,  pitch: 0.30, radius: 16, height: 1.6 },
  default:        { yaw: 0.35, pitch: 0.38, radius: 22, height: 2.2 }
}
