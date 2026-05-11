// Camera "shot" per route. yaw=0 puts the camera due south of the
// continent so the map orientation is natural (north up, east right,
// west left, south at the bottom). Pitch is the angle above horizon.
export const ROUTE_SHOTS = {
  home:           { yaw: 0, pitch: 0.38, radius: 22, height: 2.2 },
  search:         { yaw: 0, pitch: 0.68, radius: 24, height: 5.5 },
  about:          { yaw: 0.45, pitch: 0.28, radius: 18, height: 1.6 },
  'for-tenants':  { yaw: -0.4, pitch: 0.28, radius: 16, height: 1.4 },
  'for-landlords':{ yaw: 0.4,  pitch: 0.28, radius: 16, height: 1.4 },
  suburbs:        { yaw: 0, pitch: 0.42, radius: 20, height: 2.6 },
  suburb:         { yaw: 0, pitch: 0.32, radius: 14, height: 1.4 },
  property:       { yaw: 0, pitch: 0.32, radius: 12, height: 1.2 },
  dashboard:      { yaw: 1.0, pitch: 0.42, radius: 20, height: 2.6 },
  account:        { yaw: 1.0, pitch: 0.42, radius: 20, height: 2.6 },
  admin:          { yaw: 1.0, pitch: 0.42, radius: 20, height: 2.6 },
  login:          { yaw: 0.3, pitch: 0.24, radius: 18, height: 1.2 },
  signup:         { yaw: 0.3, pitch: 0.24, radius: 18, height: 1.2 },
  affordability:  { yaw: 0, pitch: 0.80, radius: 26, height: 7 },
  map:            { yaw: 0, pitch: 0.78, radius: 26, height: 7 },
  pricing:        { yaw: 0.4, pitch: 0.30, radius: 16, height: 1.6 },
  advertise:      { yaw: 0.4, pitch: 0.30, radius: 16, height: 1.6 },
  contact:        { yaw: 0.4, pitch: 0.30, radius: 16, height: 1.6 },
  default:        { yaw: 0, pitch: 0.38, radius: 22, height: 2.2 }
}
