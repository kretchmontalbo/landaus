// Camera "shot" per route. Lerped on route change. The world is now a
// photographic gallery floating over water, so radii are wider and we
// keep pitch a touch higher to keep cards in frame.
export const ROUTE_SHOTS = {
  home:           { yaw: 0.6,  pitch: 0.42, radius: 26, height: 3.2 },
  search:         { yaw: 0.45, pitch: 0.52, radius: 30, height: 5.5 },
  about:          { yaw: 1.0,  pitch: 0.38, radius: 24, height: 2.6 },
  'for-tenants':  { yaw: -0.3, pitch: 0.35, radius: 22, height: 2.2 },
  'for-landlords':{ yaw: 1.3,  pitch: 0.35, radius: 22, height: 2.2 },
  suburbs:        { yaw: 0.7,  pitch: 0.45, radius: 26, height: 3.4 },
  suburb:         { yaw: 0.65, pitch: 0.30, radius: 18, height: 1.6 },
  property:       { yaw: 0.55, pitch: 0.28, radius: 14, height: 1.4 },
  dashboard:      { yaw: 1.6,  pitch: 0.42, radius: 28, height: 4.0 },
  account:        { yaw: 1.6,  pitch: 0.42, radius: 28, height: 4.0 },
  admin:          { yaw: 1.6,  pitch: 0.42, radius: 28, height: 4.0 },
  login:          { yaw: 2.0,  pitch: 0.28, radius: 22, height: 1.6 },
  signup:         { yaw: 2.2,  pitch: 0.28, radius: 22, height: 1.6 },
  affordability:  { yaw: 0.35, pitch: 0.60, radius: 34, height: 7.0 },
  map:            { yaw: 0.45, pitch: 0.55, radius: 32, height: 6.0 },
  pricing:        { yaw: 1.3,  pitch: 0.35, radius: 22, height: 2.2 },
  advertise:      { yaw: 1.3,  pitch: 0.35, radius: 22, height: 2.2 },
  contact:        { yaw: 1.3,  pitch: 0.35, radius: 22, height: 2.2 },
  default:        { yaw: 0.6,  pitch: 0.42, radius: 26, height: 3.2 }
}
