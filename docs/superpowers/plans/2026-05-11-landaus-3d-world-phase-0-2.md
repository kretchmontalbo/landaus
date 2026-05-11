# LandAus 3D World — Phase 0–2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a feature-flagged 3D world to a Vercel preview URL tonight — scaffold + WorldStage + DroneRig + Home pocket (continent) + HUD frame + Tier-2 CSS fallback. Production site remains untouched until the flag is flipped.

**Architecture:** One persistent `<Canvas>` mounted at app root. Existing site keeps working unchanged when the feature flag is off. Routes that opt in (default: only `/` for now) render a continent pocket scene with HUD content layered as DOM panels. Device tier auto-degrades to a CSS gradient world on weak hardware and reduced-motion.

**Tech Stack:** React 18 + Vite 5, @react-three/fiber + @react-three/drei (already installed), @react-three/postprocessing (new), zustand (new), vitest (new, dev), three (already installed).

**Branch:** `3d-world`. Spec: `docs/superpowers/specs/2026-05-11-landaus-3d-world-design.md` (commit `e602c6e`).

---

## File map

### Create
| Path | Responsibility |
|---|---|
| `src/world/feature-flag.js` | Detect whether 3D world should mount (URL `?3d=1` + localStorage opt-in/out). Pure module. |
| `src/world/store.js` | Zustand store: device tier, audio enabled, current pocket id, drone target. |
| `src/world/coords.js` | Lat/Lng ↔ world-space transform for the stylized continent. Pure module. |
| `src/world/tier-probe.js` | Synchronous tier classification (WebGL2, reduced-motion, deviceMemory, connection); async fps probe lives in WorldRoot. |
| `src/world/WorldRoot.jsx` | Top-level wrapper. Decides: render 3D world or pass-through children. Mounts the Canvas. |
| `src/world/HUDRoot.jsx` | Sits above the canvas; renders existing `<Layout/Routes>` as overlay when 3D is active. |
| `src/world/HUDFrame.jsx` | Persistent edge HUD: glass top strip with audio toggle + 3D-off button. |
| `src/world/WorldStage.jsx` | Sky, environment lighting, fog, ground horizon. No interactive geometry. |
| `src/world/DroneRig.jsx` | PerspectiveCamera + smooth spring rotation; mouse/touch drag yaw+pitch; reads target from store. |
| `src/world/PocketSlot.jsx` | Selects current pocket child based on route; fades between via opacity tween. |
| `src/world/pockets/PocketContinent.jsx` | Stylized low-poly Australia mesh + golden-hour rim light. |
| `src/world/css-fallback/PocketContinentCSS.jsx` | Tier-2 animated gradient mood backdrop for home/continent route. |
| `src/world/css-fallback/styles.module.css` | CSS gradient + keyframes for Tier 2. |
| `tests/world/feature-flag.test.js` | Unit tests for flag resolution. |
| `tests/world/coords.test.js` | Unit tests for geo transform. |
| `tests/world/tier-probe.test.js` | Unit tests for tier classification. |
| `tests/world/store.test.js` | Unit tests for store actions. |
| `vitest.config.js` | Test runner config (jsdom env). |
| `tests/setup.js` | Test setup file (jest-dom, etc.). |

### Modify
| Path | Change |
|---|---|
| `package.json` | Add deps: `@react-three/postprocessing`, `zustand`. Dev deps: `vitest`, `jsdom`, `@testing-library/jest-dom`. Add scripts: `test`, `test:run`. |
| `src/App.jsx` | Wrap `<Routes>` content with `<WorldRoot>` so flag-gated mounting happens. |
| `src/main.jsx` | No change (BrowserRouter already in place). |
| `src/styles/globals.css` | Append HUD frame styles. |

---

## Conventions for every task

- All file paths are relative to `landaus/` (the Vite project root, which is the git repo).
- Run all commands from inside `landaus/`.
- After each task that touches code, run the build to make sure nothing exploded: `npm run build` should succeed (existing warning about chunk size is acceptable).
- Each task ends with a commit. Commit message format: `3d: <one-line summary>`.
- Tests are TDD where the code is pure JS (feature-flag, coords, tier-probe, store). Rendering code (R3F components) is verified manually by running `npm run dev` and visiting `http://localhost:5173/?3d=1` — explicit "smoke check" steps appear in those tasks.

---

## Phase 0 — Scaffold

### Task 0.1: Install dependencies and add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `tests/setup.js`

- [ ] **Step 1: Install runtime deps**

Run from `landaus/`:
```bash
npm install @react-three/postprocessing@^2.16.0 zustand@^4.5.0
```
Expected: dependencies added to `package.json`, lockfile updated, no errors.

- [ ] **Step 2: Install dev deps**

```bash
npm install --save-dev vitest@^1.6.0 jsdom@^24.0.0 @testing-library/jest-dom@^6.4.0
```
Expected: devDependencies added.

- [ ] **Step 3: Add test scripts to `package.json`**

In `package.json`, replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 4: Create `vitest.config.js`**

Create file at `vitest.config.js` (project root):
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    include: ['tests/**/*.test.{js,jsx}']
  }
})
```

- [ ] **Step 5: Create `tests/setup.js`**

```js
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Verify Vitest boots**

Run:
```bash
npm run test:run
```
Expected: "No test files found" or similar — runner starts without import errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js tests/setup.js
git commit -m "3d: install postprocessing, zustand, vitest"
```

---

### Task 0.2: Feature-flag module (TDD)

**Files:**
- Create: `src/world/feature-flag.js`
- Create: `tests/world/feature-flag.test.js`

The flag resolves to `true` if any of:
1. URL has `?3d=1`
2. localStorage `landaus.3d.on === '1'`
3. (For future) opt-out via `?3d=0` clears the localStorage key

It resolves to `false` if:
1. URL has `?3d=0` (also clears storage)
2. Otherwise default `false` (so existing prod site is unchanged)

- [ ] **Step 1: Write the failing tests**

Create `tests/world/feature-flag.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { isWorldEnabled, persistFlagFromUrl } from '../../src/world/feature-flag.js'

function setUrl(search) {
  window.history.replaceState({}, '', '/' + (search ? `?${search}` : ''))
}

describe('feature-flag', () => {
  beforeEach(() => {
    localStorage.clear()
    setUrl('')
  })

  it('returns false by default', () => {
    expect(isWorldEnabled()).toBe(false)
  })

  it('returns true when ?3d=1 in URL', () => {
    setUrl('3d=1')
    expect(isWorldEnabled()).toBe(true)
  })

  it('returns true when localStorage flag is set', () => {
    localStorage.setItem('landaus.3d.on', '1')
    expect(isWorldEnabled()).toBe(true)
  })

  it('returns false when ?3d=0 in URL (overrides storage)', () => {
    localStorage.setItem('landaus.3d.on', '1')
    setUrl('3d=0')
    expect(isWorldEnabled()).toBe(false)
  })

  it('persistFlagFromUrl writes storage on ?3d=1', () => {
    setUrl('3d=1')
    persistFlagFromUrl()
    expect(localStorage.getItem('landaus.3d.on')).toBe('1')
  })

  it('persistFlagFromUrl clears storage on ?3d=0', () => {
    localStorage.setItem('landaus.3d.on', '1')
    setUrl('3d=0')
    persistFlagFromUrl()
    expect(localStorage.getItem('landaus.3d.on')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
npm run test:run -- tests/world/feature-flag.test.js
```
Expected: FAIL with module-not-found error for `../../src/world/feature-flag.js`.

- [ ] **Step 3: Implement `src/world/feature-flag.js`**

```js
const STORAGE_KEY = 'landaus.3d.on'

function urlParam(name) {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}

export function isWorldEnabled() {
  const url = urlParam('3d')
  if (url === '0') return false
  if (url === '1') return true
  if (typeof window === 'undefined') return false
  return window.localStorage?.getItem(STORAGE_KEY) === '1'
}

export function persistFlagFromUrl() {
  if (typeof window === 'undefined') return
  const url = urlParam('3d')
  if (url === '1') window.localStorage.setItem(STORAGE_KEY, '1')
  if (url === '0') window.localStorage.removeItem(STORAGE_KEY)
}

export function setWorldEnabled(value) {
  if (typeof window === 'undefined') return
  if (value) window.localStorage.setItem(STORAGE_KEY, '1')
  else window.localStorage.removeItem(STORAGE_KEY)
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
npm run test:run -- tests/world/feature-flag.test.js
```
Expected: All 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/world/feature-flag.js tests/world/feature-flag.test.js
git commit -m "3d: feature-flag module with ?3d=1 + localStorage opt-in"
```

---

### Task 0.3: Geo → world coords transform (TDD)

**Files:**
- Create: `src/world/coords.js`
- Create: `tests/world/coords.test.js`

Australia bounds: lat `[-43.7, -10.7]`, lng `[112.9, 153.7]`. Our world continent occupies x `[-12, 12]`, z `[-8, 8]` (z is south↔north in three.js right-handed with up=Y). Linear projection — accuracy not needed, visual placement only.

- [ ] **Step 1: Write the failing tests**

Create `tests/world/coords.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { geoToWorld, AU_BOUNDS } from '../../src/world/coords.js'

describe('geoToWorld', () => {
  it('maps Sydney (-33.87, 151.21) to the east side of the continent', () => {
    const [x, z] = geoToWorld(-33.87, 151.21)
    expect(x).toBeGreaterThan(8)
    expect(x).toBeLessThan(12)
  })

  it('maps Perth (-31.95, 115.86) to the west side', () => {
    const [x, z] = geoToWorld(-31.95, 115.86)
    expect(x).toBeLessThan(-8)
    expect(x).toBeGreaterThan(-12)
  })

  it('maps Darwin (-12.46, 130.84) to the north', () => {
    const [, z] = geoToWorld(-12.46, 130.84)
    expect(z).toBeLessThan(-6)
  })

  it('maps Hobart (-42.88, 147.32) to the south', () => {
    const [, z] = geoToWorld(-42.88, 147.32)
    expect(z).toBeGreaterThan(6)
  })

  it('returns a tuple of two finite numbers for valid input', () => {
    const [x, z] = geoToWorld(-25, 135)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })

  it('exports AU_BOUNDS with lat/lng extents', () => {
    expect(AU_BOUNDS.latMin).toBeLessThan(AU_BOUNDS.latMax)
    expect(AU_BOUNDS.lngMin).toBeLessThan(AU_BOUNDS.lngMax)
  })
})
```

- [ ] **Step 2: Run, verify failure**

```bash
npm run test:run -- tests/world/coords.test.js
```
Expected: module-not-found.

- [ ] **Step 3: Implement `src/world/coords.js`**

```js
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
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:run -- tests/world/coords.test.js
```
Expected: All 6 pass.

- [ ] **Step 5: Commit**

```bash
git add src/world/coords.js tests/world/coords.test.js
git commit -m "3d: geo→world coord transform (linear bounds projection)"
```

---

### Task 0.4: Device tier-probe module (TDD)

**Files:**
- Create: `src/world/tier-probe.js`
- Create: `tests/world/tier-probe.test.js`

This module does the synchronous classification only. The fps probe (async) lives in `WorldRoot` later. Tiers: `0` (full), `1` (lite), `2` (static fallback).

- [ ] **Step 1: Write failing tests**

Create `tests/world/tier-probe.test.js`:
```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { classifyTier } from '../../src/world/tier-probe.js'

function mockEnv(overrides = {}) {
  return {
    webgl2: true,
    reducedMotion: false,
    deviceMemoryGB: 8,
    connectionEffectiveType: '4g',
    hardwareConcurrency: 8,
    ...overrides
  }
}

describe('classifyTier', () => {
  it('returns 0 (full) for a high-spec environment', () => {
    expect(classifyTier(mockEnv())).toBe(0)
  })

  it('returns 2 (static) when webgl2 unsupported', () => {
    expect(classifyTier(mockEnv({ webgl2: false }))).toBe(2)
  })

  it('returns 2 (static) when reduced motion is requested', () => {
    expect(classifyTier(mockEnv({ reducedMotion: true }))).toBe(2)
  })

  it('returns 2 (static) on slow-2g connection', () => {
    expect(classifyTier(mockEnv({ connectionEffectiveType: 'slow-2g' }))).toBe(2)
  })

  it('returns 1 (lite) when device memory is low', () => {
    expect(classifyTier(mockEnv({ deviceMemoryGB: 2 }))).toBe(1)
  })

  it('returns 1 (lite) when CPU is weak', () => {
    expect(classifyTier(mockEnv({ hardwareConcurrency: 2 }))).toBe(1)
  })

  it('handles missing memory/connection gracefully (treats as unknown = pass)', () => {
    expect(classifyTier(mockEnv({ deviceMemoryGB: null, connectionEffectiveType: null }))).toBe(0)
  })
})
```

- [ ] **Step 2: Run, verify failure**

```bash
npm run test:run -- tests/world/tier-probe.test.js
```

- [ ] **Step 3: Implement `src/world/tier-probe.js`**

```js
export function classifyTier(env) {
  if (!env.webgl2) return 2
  if (env.reducedMotion) return 2
  if (env.connectionEffectiveType === '2g' || env.connectionEffectiveType === 'slow-2g') return 2
  if (typeof env.deviceMemoryGB === 'number' && env.deviceMemoryGB < 4) return 1
  if (typeof env.hardwareConcurrency === 'number' && env.hardwareConcurrency < 4) return 1
  return 0
}

export function detectEnv() {
  if (typeof window === 'undefined') {
    return { webgl2: false, reducedMotion: false, deviceMemoryGB: null, connectionEffectiveType: null, hardwareConcurrency: null }
  }
  let webgl2 = false
  try {
    const c = document.createElement('canvas')
    webgl2 = !!c.getContext('webgl2')
  } catch (_) {
    webgl2 = false
  }
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const deviceMemoryGB = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null
  const connectionEffectiveType = navigator.connection?.effectiveType ?? null
  const hardwareConcurrency = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null
  return { webgl2, reducedMotion, deviceMemoryGB, connectionEffectiveType, hardwareConcurrency }
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:run -- tests/world/tier-probe.test.js
```
Expected: 7 pass.

- [ ] **Step 5: Commit**

```bash
git add src/world/tier-probe.js tests/world/tier-probe.test.js
git commit -m "3d: device tier classifier (webgl2/reduced-motion/memory/cpu/network)"
```

---

### Task 0.5: Zustand world store (TDD)

**Files:**
- Create: `src/world/store.js`
- Create: `tests/world/store.test.js`

Store responsibilities: tier (0|1|2), audio enabled, current pocket id (string), camera target (`[x,y,z]` or null).

- [ ] **Step 1: Write failing tests**

Create `tests/world/store.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useWorldStore } from '../../src/world/store.js'

describe('world store', () => {
  beforeEach(() => {
    useWorldStore.setState({
      tier: null,
      audioEnabled: false,
      pocket: 'home',
      cameraTarget: null
    })
  })

  it('initialises with tier=null, audio off, pocket=home', () => {
    const s = useWorldStore.getState()
    expect(s.tier).toBeNull()
    expect(s.audioEnabled).toBe(false)
    expect(s.pocket).toBe('home')
    expect(s.cameraTarget).toBeNull()
  })

  it('setTier updates tier', () => {
    useWorldStore.getState().setTier(1)
    expect(useWorldStore.getState().tier).toBe(1)
  })

  it('toggleAudio flips audioEnabled', () => {
    useWorldStore.getState().toggleAudio()
    expect(useWorldStore.getState().audioEnabled).toBe(true)
    useWorldStore.getState().toggleAudio()
    expect(useWorldStore.getState().audioEnabled).toBe(false)
  })

  it('setPocket updates pocket id', () => {
    useWorldStore.getState().setPocket('about')
    expect(useWorldStore.getState().pocket).toBe('about')
  })

  it('setCameraTarget updates target', () => {
    useWorldStore.getState().setCameraTarget([1, 2, 3])
    expect(useWorldStore.getState().cameraTarget).toEqual([1, 2, 3])
  })
})
```

- [ ] **Step 2: Run, verify failure**

- [ ] **Step 3: Implement `src/world/store.js`**

```js
import { create } from 'zustand'

const initialState = {
  tier: null,
  audioEnabled: false,
  pocket: 'home',
  cameraTarget: null
}

export const useWorldStore = create((set, get) => ({
  ...initialState,
  setTier: (tier) => set({ tier }),
  toggleAudio: () => set({ audioEnabled: !get().audioEnabled }),
  setPocket: (pocket) => set({ pocket }),
  setCameraTarget: (cameraTarget) => set({ cameraTarget })
}))
```

- [ ] **Step 4: Run, verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/world/store.js tests/world/store.test.js
git commit -m "3d: zustand world store (tier, audio, pocket, camera target)"
```

---

### Task 0.6: WorldRoot + HUDRoot wrappers

**Files:**
- Create: `src/world/WorldRoot.jsx`
- Create: `src/world/HUDRoot.jsx`

WorldRoot decides: if the flag is off, just `{children}` (i.e. existing site). If on, render the canvas behind, run the fps probe to finalize tier, and render `<HUDRoot>{children}</HUDRoot>` on top.

- [ ] **Step 1: Create `src/world/WorldRoot.jsx`**

```jsx
import { useEffect, useState, Suspense } from 'react'
import { isWorldEnabled, persistFlagFromUrl } from './feature-flag.js'
import { detectEnv, classifyTier } from './tier-probe.js'
import { useWorldStore } from './store.js'
import HUDRoot from './HUDRoot.jsx'

export default function WorldRoot({ children }) {
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const setTier = useWorldStore((s) => s.setTier)

  useEffect(() => {
    persistFlagFromUrl()
    const on = isWorldEnabled()
    setEnabled(on)
    if (on) {
      const env = detectEnv()
      const tier = classifyTier(env)
      setTier(tier)
    }
    setReady(true)
  }, [setTier])

  if (!ready) return children
  if (!enabled) return children
  return <HUDRoot>{children}</HUDRoot>
}
```

- [ ] **Step 2: Create `src/world/HUDRoot.jsx` (skeleton — canvas wired in next phase)**

```jsx
import { useWorldStore } from './store.js'

export default function HUDRoot({ children }) {
  const tier = useWorldStore((s) => s.tier)
  return (
    <div className="world-root" data-tier={tier ?? 'init'}>
      <div className="world-canvas-slot" aria-hidden="true">
        {/* canvas wired in Task 1.4 */}
      </div>
      <div className="world-hud-slot">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Append base styles to `src/styles/globals.css`**

Append at end of `src/styles/globals.css`:
```css

/* === 3D World layer === */
.world-root {
  position: relative;
  min-height: 100vh;
}
.world-canvas-slot {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.world-hud-slot {
  position: relative;
  z-index: 1;
}
.world-root[data-tier="2"] .world-canvas-slot {
  display: none;
}
```

- [ ] **Step 4: Run build to verify no syntax errors**

```bash
npm run build
```
Expected: success (one pre-existing chunk-size warning is OK).

- [ ] **Step 5: Commit**

```bash
git add src/world/WorldRoot.jsx src/world/HUDRoot.jsx src/styles/globals.css
git commit -m "3d: WorldRoot + HUDRoot skeleton, flag-gated mount"
```

---

### Task 0.7: Wire WorldRoot into App.jsx (no-op when flag is off)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Edit `src/App.jsx`**

Replace the existing import block above `import { AuthProvider, ... }` so the file's top reads:
```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import WorldRoot from './world/WorldRoot.jsx'
import Layout from './components/Layout.jsx'
```

Then change the `export default function App()` body to wrap the `<AuthProvider>` with `<WorldRoot>`:
```jsx
export default function App() {
  return (
    <WorldRoot>
      <AuthProvider>
        <Routes>
          {/* ...all existing routes unchanged... */}
        </Routes>
      </AuthProvider>
    </WorldRoot>
  )
}
```
(All route children remain as-is. Do not edit them.)

- [ ] **Step 2: Verify flag-off renders existing site unchanged**

Run:
```bash
npm run dev
```
Open `http://localhost:5173/` — site should look identical to before (no canvas, no HUD layer wrapping anything visible).

Open `http://localhost:5173/?3d=1` — site should look identical *visually* but inspecting the DOM should show `<div class="world-root" data-tier="0">` wrapping the content. (Canvas slot is empty until Phase 1.)

Stop dev server.

- [ ] **Step 3: Build to confirm production OK**

```bash
npm run build
```
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "3d: mount WorldRoot at app root (no-op when flag off)"
```

---

## Phase 1 — World Visuals

### Task 1.1: WorldStage (sky + lighting)

**Files:**
- Create: `src/world/WorldStage.jsx`

Skybox is a stylized gradient (cheap), one directional sun + low ambient + warm hemisphere. No environment HDRI for v1 (saves bytes and load time).

- [ ] **Step 1: Create `src/world/WorldStage.jsx`**

```jsx
import { Sky } from '@react-three/drei'

export default function WorldStage() {
  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[2, 0.6, 1]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={6}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.85}
      />
      <hemisphereLight args={['#ffd9a8', '#3f5c32', 0.6]} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.4}
        color="#ffb570"
        castShadow={false}
      />
      <ambientLight intensity={0.2} color="#fff6e6" />
      <fog attach="fog" args={['#f4d8a8', 22, 60]} />
    </>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/world/WorldStage.jsx
git commit -m "3d: WorldStage — golden-hour sky, hemisphere + directional sun, dusty fog"
```

---

### Task 1.2: DroneRig (camera + smooth gimbal)

**Files:**
- Create: `src/world/DroneRig.jsx`

A smooth spring camera: stores current yaw/pitch in refs, lerps toward target each frame. Mouse drag adjusts target yaw/pitch. Touch drag does the same. No WASD in v1 (Phase 5 polish).

- [ ] **Step 1: Create `src/world/DroneRig.jsx`**

```jsx
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const RADIUS = 22
const PITCH_MIN = 0.15
const PITCH_MAX = 1.15
const ROT_LERP = 0.06

export default function DroneRig() {
  const cameraRef = useRef()
  const { gl } = useThree()
  const yaw = useRef(0.5)
  const pitch = useRef(0.6)
  const targetYaw = useRef(0.5)
  const targetPitch = useRef(0.6)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)

  useEffect(() => {
    const el = gl.domElement

    function onDown(e) {
      dragging.current = true
      const p = 'touches' in e ? e.touches[0] : e
      lastX.current = p.clientX
      lastY.current = p.clientY
    }
    function onMove(e) {
      if (!dragging.current) return
      const p = 'touches' in e ? e.touches[0] : e
      const dx = p.clientX - lastX.current
      const dy = p.clientY - lastY.current
      lastX.current = p.clientX
      lastY.current = p.clientY
      targetYaw.current -= dx * 0.005
      targetPitch.current = THREE.MathUtils.clamp(targetPitch.current - dy * 0.005, PITCH_MIN, PITCH_MAX)
    }
    function onUp() { dragging.current = false }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [gl])

  useFrame(() => {
    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, ROT_LERP)
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, ROT_LERP)
    const x = RADIUS * Math.cos(pitch.current) * Math.sin(yaw.current)
    const y = RADIUS * Math.sin(pitch.current) + 4
    const z = RADIUS * Math.cos(pitch.current) * Math.cos(yaw.current)
    if (cameraRef.current) {
      cameraRef.current.position.set(x, y, z)
      cameraRef.current.lookAt(0, 0, 0)
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={42} near={0.1} far={200} position={[0, 14, RADIUS]} />
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/world/DroneRig.jsx
git commit -m "3d: DroneRig — orbital spring camera, mouse + touch drag"
```

---

### Task 1.3: PocketContinent (stylized Australia mesh)

**Files:**
- Create: `src/world/pockets/PocketContinent.jsx`

For v1, the continent is a hand-shaped flat plate — a rounded rectangle approximation of Australia, with a slightly raised "outback" zone in the middle, made from primitive geometry. This is the placeholder until a Blender-modeled mesh exists.

- [ ] **Step 1: Create `src/world/pockets/PocketContinent.jsx`**

```jsx
import { useMemo } from 'react'
import * as THREE from 'three'

const SANDSTONE = '#E5C9A5'
const SANDSTONE_DEEP = '#B89968'
const EUCALYPTUS = '#6B8F5E'
const OUTBACK = '#C66E4A'
const OCEAN = '#4A90A4'

function ContinentMesh() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    // Approximate Australia silhouette in world XZ plane
    s.moveTo(-10, -6)
    s.bezierCurveTo(-11, -4, -11, 0, -10, 4)
    s.bezierCurveTo(-8, 6.5, -4, 7, 0, 6.8)
    s.bezierCurveTo(4, 7, 8, 6, 10, 4)
    s.bezierCurveTo(11.5, 1, 11, -3, 9, -5)
    s.bezierCurveTo(6, -7, 2, -7.2, -2, -6.8)
    s.bezierCurveTo(-6, -7, -9, -7, -10, -6)
    return s
  }, [])
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.1, bevelSegments: 2 })
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, 0)
    return g
  }, [shape])
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={SANDSTONE} roughness={0.95} metalness={0} />
    </mesh>
  )
}

function OutbackPatch() {
  return (
    <mesh position={[0.5, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.4, 32]} />
      <meshStandardMaterial color={OUTBACK} roughness={1} metalness={0} />
    </mesh>
  )
}

function CoastalFringe() {
  return (
    <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[7.5, 11.5, 64]} />
      <meshStandardMaterial color={EUCALYPTUS} roughness={1} metalness={0} transparent opacity={0.55} />
    </mesh>
  )
}

function Ocean() {
  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color={OCEAN} roughness={0.7} metalness={0.1} />
    </mesh>
  )
}

export default function PocketContinent() {
  return (
    <group>
      <Ocean />
      <ContinentMesh />
      <CoastalFringe />
      <OutbackPatch />
    </group>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/world/pockets/PocketContinent.jsx
git commit -m "3d: PocketContinent — stylized Australia + outback patch + ocean plane"
```

---

### Task 1.4: PocketSlot + wire canvas into HUDRoot

**Files:**
- Create: `src/world/PocketSlot.jsx`
- Modify: `src/world/HUDRoot.jsx`

PocketSlot reads route, decides which pocket to show, fades children via group opacity. For Phase 0–2, only `/` (home) maps to a pocket; everything else gets the same continent backdrop (we'll diversify in Phase 3).

- [ ] **Step 1: Create `src/world/PocketSlot.jsx`**

```jsx
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useWorldStore } from './store.js'
import PocketContinent from './pockets/PocketContinent.jsx'

function routeToPocket(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/search')) return 'search'
  if (pathname === '/about') return 'about'
  return 'continent'
}

export default function PocketSlot() {
  const location = useLocation()
  const setPocket = useWorldStore((s) => s.setPocket)
  useEffect(() => {
    setPocket(routeToPocket(location.pathname))
  }, [location.pathname, setPocket])
  // Phase 0-2: all routes share the continent. Diversification comes in Phase 3.
  return <PocketContinent />
}
```

- [ ] **Step 2: Update `src/world/HUDRoot.jsx` to mount the canvas**

Replace the whole file with:
```jsx
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useWorldStore } from './store.js'
import WorldStage from './WorldStage.jsx'
import DroneRig from './DroneRig.jsx'
import PocketSlot from './PocketSlot.jsx'
import PocketContinentCSS from './css-fallback/PocketContinentCSS.jsx'

export default function HUDRoot({ children }) {
  const tier = useWorldStore((s) => s.tier)
  const isStatic = tier === 2

  return (
    <div className="world-root" data-tier={tier ?? 'init'}>
      <div className="world-canvas-slot" aria-hidden="true">
        {isStatic ? (
          <PocketContinentCSS />
        ) : (
          <Canvas
            dpr={tier === 1 ? [1, 1.5] : [1, 2]}
            gl={{ antialias: tier !== 1, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <WorldStage />
              <DroneRig />
              <PocketSlot />
            </Suspense>
          </Canvas>
        )}
      </div>
      <div className="world-hud-slot">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```
Expected: success.

- [ ] **Step 4: Smoke-check in browser**

```bash
npm run dev
```
- Open `http://localhost:5173/?3d=1`. Expect: behind the existing site, you should see a stylized Australia under a golden sky. Drag the page (mouse) — the camera orbits. (If the existing site's content is opaque and covers the canvas, that's OK — we layer it intentionally in the next task.)
- Open `http://localhost:5173/`. Expect: no canvas, site looks identical to production.
- Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add src/world/PocketSlot.jsx src/world/HUDRoot.jsx
git commit -m "3d: PocketSlot + Canvas mount; continent visible behind site at /?3d=1"
```

---

## Phase 2 — Home Pocket + HUD Frame + Tier-2 Fallback

### Task 2.1: PocketContinentCSS (Tier-2 fallback)

**Files:**
- Create: `src/world/css-fallback/PocketContinentCSS.jsx`
- Create: `src/world/css-fallback/styles.module.css`

A pure CSS gradient + soft animation mimicking the continent pocket's golden-hour mood. Used when tier=2 (reduced-motion, low-end, no WebGL).

- [ ] **Step 1: Create `src/world/css-fallback/styles.module.css`**

```css
.fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 50% 70%, rgba(229, 201, 165, 0.85) 0%, rgba(229, 201, 165, 0) 60%),
    radial-gradient(ellipse 40% 28% at 50% 78%, rgba(198, 110, 74, 0.55) 0%, rgba(198, 110, 74, 0) 70%),
    linear-gradient(180deg, #ffd9a8 0%, #ffb570 38%, #c66e4a 78%, #5c7280 100%);
  overflow: hidden;
}
.fallback::before {
  content: "";
  position: absolute;
  inset: -10%;
  background: radial-gradient(circle at 78% 20%, rgba(255, 246, 230, 0.55), rgba(255, 246, 230, 0) 50%);
  animation: drift 24s ease-in-out infinite alternate;
}
@keyframes drift {
  from { transform: translate3d(-2%, 0, 0); }
  to   { transform: translate3d(2%, -1%, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .fallback::before { animation: none; }
}
```

- [ ] **Step 2: Create `src/world/css-fallback/PocketContinentCSS.jsx`**

```jsx
import styles from './styles.module.css'

export default function PocketContinentCSS() {
  return <div className={styles.fallback} aria-hidden="true" />
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Smoke check (force tier 2)**

Temporarily edit `src/world/WorldRoot.jsx` line `setTier(tier)` to `setTier(2)`. Run `npm run dev`. Visit `http://localhost:5173/?3d=1` — you should see the gradient. Revert the change and stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/world/css-fallback/PocketContinentCSS.jsx src/world/css-fallback/styles.module.css
git commit -m "3d: Tier-2 CSS gradient fallback for continent pocket"
```

---

### Task 2.2: HUDFrame (top edge with tier + audio + exit-3D)

**Files:**
- Create: `src/world/HUDFrame.jsx`
- Modify: `src/world/HUDRoot.jsx`
- Modify: `src/styles/globals.css`

Top edge: glass strip with a small "LandAus · 3D" wordmark, audio toggle (silent in Phase 0-2 but the toggle is wired), and a "Switch to classic" button that calls `setWorldEnabled(false)` and reloads.

- [ ] **Step 1: Create `src/world/HUDFrame.jsx`**

```jsx
import { Volume2, VolumeX, X } from 'lucide-react'
import { useWorldStore } from './store.js'
import { setWorldEnabled } from './feature-flag.js'

function exitWorld() {
  setWorldEnabled(false)
  window.location.search = ''
}

export default function HUDFrame() {
  const audioEnabled = useWorldStore((s) => s.audioEnabled)
  const toggleAudio = useWorldStore((s) => s.toggleAudio)
  const tier = useWorldStore((s) => s.tier)
  return (
    <div className="hud-frame" role="region" aria-label="3D world controls">
      <div className="hud-frame__mark">LandAus · 3D <span className="hud-frame__tier" aria-label={`Tier ${tier}`}>T{tier ?? '?'}</span></div>
      <div className="hud-frame__actions">
        <button type="button" className="hud-frame__btn" onClick={toggleAudio} aria-pressed={audioEnabled} aria-label="Toggle audio">
          {audioEnabled ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
        </button>
        <button type="button" className="hud-frame__btn hud-frame__btn--exit" onClick={exitWorld} aria-label="Switch to classic site">
          <X size={16} aria-hidden /> Classic
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Append HUD frame styles to `src/styles/globals.css`**

```css

/* === HUD Frame === */
.hud-frame {
  position: fixed;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  border-radius: 14px;
  background: rgba(20, 14, 10, 0.42);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 246, 230, 0.18);
  color: #fff6e6;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  letter-spacing: 0.02em;
  pointer-events: auto;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.28);
}
.hud-frame__mark {
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.hud-frame__tier {
  font-size: 10px;
  opacity: 0.55;
  letter-spacing: 0.1em;
}
.hud-frame__actions {
  display: flex;
  gap: 8px;
}
.hud-frame__btn {
  background: rgba(255, 246, 230, 0.08);
  color: inherit;
  border: 1px solid rgba(255, 246, 230, 0.18);
  border-radius: 999px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font: inherit;
  transition: background 120ms ease, transform 120ms ease;
}
.hud-frame__btn:hover { background: rgba(255, 246, 230, 0.18); }
.hud-frame__btn:active { transform: scale(0.97); }
.hud-frame__btn--exit { font-weight: 500; }

@media (max-width: 600px) {
  .hud-frame { font-size: 12px; padding: 6px 10px; }
}
```

- [ ] **Step 3: Mount HUDFrame inside HUDRoot**

Update `src/world/HUDRoot.jsx` — add the import and the component just inside `.world-root`:

```jsx
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useWorldStore } from './store.js'
import WorldStage from './WorldStage.jsx'
import DroneRig from './DroneRig.jsx'
import PocketSlot from './PocketSlot.jsx'
import PocketContinentCSS from './css-fallback/PocketContinentCSS.jsx'
import HUDFrame from './HUDFrame.jsx'

export default function HUDRoot({ children }) {
  const tier = useWorldStore((s) => s.tier)
  const isStatic = tier === 2

  return (
    <div className="world-root" data-tier={tier ?? 'init'}>
      <div className="world-canvas-slot" aria-hidden="true">
        {isStatic ? (
          <PocketContinentCSS />
        ) : (
          <Canvas
            dpr={tier === 1 ? [1, 1.5] : [1, 2]}
            gl={{ antialias: tier !== 1, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <WorldStage />
              <DroneRig />
              <PocketSlot />
            </Suspense>
          </Canvas>
        )}
      </div>
      <HUDFrame />
      <div className="world-hud-slot">{children}</div>
    </div>
  )
}
```

- [ ] **Step 4: Build + smoke check**

```bash
npm run build && npm run dev
```
Visit `http://localhost:5173/?3d=1`. Expect: glass HUD strip at top with "LandAus · 3D T0", audio toggle, Classic button. Click Classic — page reloads with the original site (no `?3d`, localStorage cleared). Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/world/HUDFrame.jsx src/world/HUDRoot.jsx src/styles/globals.css
git commit -m "3d: HUDFrame — glass top strip with tier label, audio toggle, exit button"
```

---

### Task 2.3: Make existing Home content readable over the world

**Files:**
- Modify: `src/styles/globals.css`

The existing HomePage has its own hero background (Unsplash photo via `StaticHeroFallback`). When 3D is on, we want to *replace* that hero with a transparent overlay so the world shows through, but keep the rest of the page intact. Lowest-touch way: scope a CSS override under `.world-root` for the home hero classes.

- [ ] **Step 1: Confirm existing home hero classes**

```bash
grep -nE "class(Name)?=\"[^\"]*hero" src/pages/HomePage.jsx src/components/StaticHeroFallback.jsx | head -20
```
Note the top-level hero class name(s) used (likely `.hero` or `.static-hero`). Use those names in the override below.

- [ ] **Step 2: Append override styles to `src/styles/globals.css`**

```css

/* === 3D world: transparent hero over canvas === */
.world-root[data-tier="0"] .static-hero,
.world-root[data-tier="1"] .static-hero,
.world-root[data-tier="0"] .hero,
.world-root[data-tier="1"] .hero {
  background: transparent !important;
  background-image: none !important;
}
.world-root[data-tier="0"] .static-hero::before,
.world-root[data-tier="1"] .static-hero::before {
  background: linear-gradient(180deg, rgba(20, 14, 10, 0.0) 0%, rgba(20, 14, 10, 0.35) 100%) !important;
}
.world-root[data-tier="0"] .static-hero,
.world-root[data-tier="1"] .static-hero {
  color: #fff6e6;
}
.world-root[data-tier="0"] .static-hero h1,
.world-root[data-tier="1"] .static-hero h1 {
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.55);
}
```
*(If the home hero class names differ from `.static-hero` / `.hero`, replace with the actual class names found in Step 1.)*

- [ ] **Step 3: Smoke check**

```bash
npm run dev
```
Visit `/?3d=1` — the home hero's background photo should be gone; you see the 3D continent through it, with the headline still readable thanks to the gradient + text-shadow. Visit `/` (no flag) — site looks identical to before. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "3d: transparent home hero when 3D world is active"
```

---

### Task 2.4: Async fps probe for tier downgrade

**Files:**
- Modify: `src/world/WorldRoot.jsx`

After the canvas mounts, sample fps for 1 second. If avg < 25 → downgrade to tier 2 (kills canvas, shows CSS). If avg < 45 and we're tier 0 → downgrade to tier 1.

- [ ] **Step 1: Replace `src/world/WorldRoot.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { isWorldEnabled, persistFlagFromUrl } from './feature-flag.js'
import { detectEnv, classifyTier } from './tier-probe.js'
import { useWorldStore } from './store.js'
import HUDRoot from './HUDRoot.jsx'

function startFpsProbe(durationMs, onDone) {
  let frames = 0
  let start = performance.now()
  let raf = 0
  function tick(t) {
    frames += 1
    if (t - start >= durationMs) {
      const fps = (frames * 1000) / (t - start)
      onDone(fps)
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export default function WorldRoot({ children }) {
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const setTier = useWorldStore((s) => s.setTier)

  useEffect(() => {
    persistFlagFromUrl()
    const on = isWorldEnabled()
    setEnabled(on)
    if (on) {
      const env = detectEnv()
      const initialTier = classifyTier(env)
      setTier(initialTier)
    }
    setReady(true)
  }, [setTier])

  useEffect(() => {
    if (!enabled) return
    const currentTier = useWorldStore.getState().tier
    if (currentTier === 2) return
    const cancel = startFpsProbe(1000, (fps) => {
      if (fps < 25) setTier(2)
      else if (fps < 45 && currentTier === 0) setTier(1)
    })
    return cancel
  }, [enabled, setTier])

  if (!ready) return children
  if (!enabled) return children
  return <HUDRoot>{children}</HUDRoot>
}
```

- [ ] **Step 2: Build + smoke check**

```bash
npm run build && npm run dev
```
Visit `/?3d=1`. Open devtools → Performance → CPU throttle 6x. Reload. The tier label in HUD should drop from T0 → T1 (or T2). With throttling off, T0 stays. Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/world/WorldRoot.jsx
git commit -m "3d: async fps probe — auto-downgrade tier on slow frames"
```

---

### Task 2.5: README for the world module

**Files:**
- Create: `src/world/README.md`

Document what's there so future maintainers (and future Claude sessions) understand the structure.

- [ ] **Step 1: Create `src/world/README.md`**

```markdown
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
- `WorldRoot.jsx` — top-level mount. Decides flag state. Runs fps probe.
- `HUDRoot.jsx` — canvas mount + HUD slot wrapping route children.
- `HUDFrame.jsx` — persistent top glass strip (tier label, audio, exit).
- `WorldStage.jsx` — sky, lighting, fog.
- `DroneRig.jsx` — orbital spring camera.
- `PocketSlot.jsx` — picks pocket from current route.
- `pockets/PocketContinent.jsx` — stylized Australia.
- `css-fallback/PocketContinentCSS.jsx` — Tier-2 gradient backdrop.

## Tier model
- 0 Full — bloom + DoF + post-fx (Phase 5 will add these)
- 1 Lite — antialias off, lower DPR, no post-fx
- 2 Static — canvas not mounted; CSS gradient backdrop. Reduced-motion forced here.

## Adding a new pocket
1. Create `pockets/PocketX.jsx` exporting a default `<group>`.
2. Map a route in `PocketSlot.jsx`'s `routeToPocket()`.
3. (Optional) Add a CSS fallback in `css-fallback/PocketXCSS.jsx`.

## Testing
- Pure-JS modules have vitest specs under `tests/world/`.
- 3D rendering is visually verified by running `npm run dev` and opening
  `?3d=1`. Visual regression suite lives in `tests/visual/` (planned, Phase 6).
```

- [ ] **Step 2: Commit**

```bash
git add src/world/README.md
git commit -m "3d: world module README"
```

---

### Task 2.6: Run full test suite + production build

**Files:** (none — verification only)

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```
Expected: all tests in `tests/world/` pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```
Expected: success. Note the bundle output — the world module should be a separate chunk thanks to Vite's code-splitting (Canvas component is dynamically imported by React via Suspense, but we'll confirm in step 3).

- [ ] **Step 3: Confirm classic mode is still byte-light**

The world module adds R3F + drei + zustand to the bundle when 3D is on. When `?3d=1` is *off*, we want the world chunk to lazy-load (or at least to not run). Verify:

```bash
ls -lh dist/assets/*.js | head -10
```
Expected: an `index-*.js` (main) and several chunks. Three.js/drei should be in their own chunk(s). If the world module is bundled into the main chunk and that chunk grew significantly (>50KB gz over baseline ~239KB gz), we'll address with a lazy import in a follow-up task.

- [ ] **Step 4: Commit (no changes; just a checkpoint commit allowed-empty)**

```bash
git commit --allow-empty -m "3d: Phase 0–2 complete — scaffold + continent + HUD + tier-2 ready"
```

---

### Task 2.7: Deploy to Vercel preview

**Files:** (none — git push only)

- [ ] **Step 1: Verify branch is clean and ahead of main**

```bash
git status -s
git log --oneline main..HEAD
```
Expected: no uncommitted changes; multiple commits ahead of main.

- [ ] **Step 2: Push branch to GitHub**

```bash
git push -u origin 3d-world
```
Expected: branch pushed, Vercel auto-deploys a preview URL.

- [ ] **Step 3: Wait for Vercel deploy and capture the preview URL**

Either visit Vercel dashboard or run:
```bash
gh api repos/:owner/:repo/commits/3d-world/check-runs 2>/dev/null | head -40
```
or simply visit `https://vercel.com/<your-team>/landaus/deployments` and copy the preview URL once the deploy is green.

Visit `<preview-url>/?3d=1` — confirm the world appears with HUD frame at the top, continent visible, camera orbits on drag. Visit `<preview-url>/` — confirm the original site is unchanged.

- [ ] **Step 4: Report URL back to product owner**

Print the preview URL clearly and note: the production site (`landaus.com.au` / `landaus.vercel.app` main) is untouched. To view the 3D world, append `?3d=1` to any URL on the preview deployment.

---

## Out of scope for this plan (deferred to next plan)

- Phase 3 pockets: About, Search, Property Detail, Suburb Detail, Tenants, Landlords, Hangar, Beach Arrival
- Theatre.js sequencing for cinematic page transitions
- @studio-freight/lenis smooth scroll
- @react-three/postprocessing (bloom, DoF, vignette)
- HDRI environment
- Audio bed + UI sounds (toggle is wired; no sounds yet)
- Real listings as glow markers (data sync)
- Hand-modeled continent mesh (replace placeholder extrude geometry)
- Visual regression suite (Playwright)
- Onboarding cinematic on first visit
