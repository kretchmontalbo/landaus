# src/world — 3D World Layer

## What this is
A persistent WebGL canvas + HUD overlay that wraps the entire LandAus app.
Activated by URL `?3d=1` or localStorage `landaus.3d.on=1`. When inactive,
this layer is a transparent pass-through and the existing site renders
exactly as before.

See `docs/superpowers/specs/2026-05-11-landaus-3d-world-design.md` for full
spec, the route → pocket map, and the asset budget.

## Files
- `feature-flag.js` — `?3d=1` URL + localStorage flag
- `tier-probe.js` — sync device classification (webgl2, reduced-motion, mem, cpu, net)
- `store.js` — zustand store (tier, audio, current pocket, camera target)
- `coords.js` — lat/lng → world (x, z) transform
- `WorldRoot.jsx` — top-level mount. Decides flag state. Runs fps probe. Lazy-loads HUDRoot.
- `HUDRoot.jsx` — canvas mount + HUD slot wrapping route children.
- `HUDFrame.jsx` — persistent top glass strip (tier label, audio, exit).
- `WorldStage.jsx` — sky, lighting, fog.
- `DroneRig.jsx` — orbital spring camera, mouse + touch drag.
- `PocketSlot.jsx` — picks pocket from current route.
- `pockets/PocketContinent.jsx` — stylized Australia.
- `css-fallback/PocketContinentCSS.jsx` — Tier-2 gradient backdrop.

## Bundle strategy
`WorldRoot` lazy-imports `HUDRoot` via `React.lazy`. Result: three.js,
drei, R3F, the canvas, and all pocket scenes ship as a separate chunk that
only loads when the feature flag is on. Non-3D users pay zero bytes.

## Tier model
- 0 Full — bloom + DoF + post-fx (Phase 5 will add these)
- 1 Lite — antialias off, lower DPR, no post-fx
- 2 Static — canvas not mounted; CSS gradient backdrop. Reduced-motion forced here.

## Adding a new pocket
1. Create `pockets/PocketX.jsx` exporting a default `<group>`.
2. Map a route in `PocketSlot.jsx`'s `routeToPocket()`.
3. (Optional) Add a CSS fallback in `css-fallback/PocketXCSS.jsx`.

## Testing
- Pure-JS modules have vitest specs under `tests/world/`. Run `npm run test:run`.
- 3D rendering is visually verified by running `npm run dev` and opening
  `?3d=1`. Visual regression suite lives in `tests/visual/` (planned, Phase 6).
