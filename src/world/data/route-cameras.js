// One camera "shot" per route. The DroneRig lerps toward these targets
// on route change. (yaw, pitch, radius, height-offset).
export const ROUTE_SHOTS = {
  home:           { yaw: 0.5,  pitch: 0.62, radius: 22, height: 4.5 },
  search:         { yaw: 0.35, pitch: 0.78, radius: 26, height: 7 },
  about:          { yaw: 0.85, pitch: 0.50, radius: 18, height: 3.0 },
  'for-tenants':  { yaw: -0.4, pitch: 0.45, radius: 16, height: 2.5 },
  'for-landlords':{ yaw: 1.2,  pitch: 0.45, radius: 16, height: 2.5 },
  suburbs:        { yaw: 0.6,  pitch: 0.68, radius: 20, height: 4 },
  suburb:         { yaw: 0.6,  pitch: 0.35, radius: 12, height: 1.6 },
  property:       { yaw: 0.5,  pitch: 0.30, radius: 9,  height: 1.2 },
  dashboard:      { yaw: 1.5,  pitch: 0.55, radius: 22, height: 5 },
  account:        { yaw: 1.5,  pitch: 0.55, radius: 22, height: 5 },
  admin:          { yaw: 1.5,  pitch: 0.55, radius: 22, height: 5 },
  login:          { yaw: 1.9,  pitch: 0.32, radius: 16, height: 1.4 },
  signup:         { yaw: 2.1,  pitch: 0.32, radius: 16, height: 1.4 },
  affordability:  { yaw: 0.3,  pitch: 0.85, radius: 30, height: 8 },
  map:            { yaw: 0.4,  pitch: 0.80, radius: 28, height: 7 },
  pricing:        { yaw: 1.2,  pitch: 0.45, radius: 16, height: 2.5 },
  advertise:      { yaw: 1.2,  pitch: 0.45, radius: 16, height: 2.5 },
  contact:        { yaw: 1.2,  pitch: 0.45, radius: 16, height: 2.5 },
  default:        { yaw: 0.5,  pitch: 0.62, radius: 22, height: 4.5 }
}
