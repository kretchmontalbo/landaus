# LandAus 3D World — Design

**Status:** Approved 2026-05-11
**Author:** Claude (with kretchmontalbo as product owner)
**Repo:** `landaus/` (React + Vite + Supabase + R3F)

## 1. One-paragraph summary

LandAus becomes a single playable Australia. A persistent WebGL canvas renders a stylized continent in golden-hour light. Users pilot a free-fly drone camera. Every existing page becomes a "pocket scene" anchored in the world (a Federation study for the landlord page, a sandstone lighthouse for About, a house interior when viewing a listing). 2D content — search filters, forms, dashboards — overlays the world as glass-panel HUD. The 3D never unmounts during navigation; the camera animates between pocket scenes while React Router cross-fades the HUD. On weak devices and for users with `prefers-reduced-motion`, the canvas is replaced by an animated CSS gradient matching the current pocket's mood — content and conversion paths stay identical.

## 2. Why this exists

The current site looks like every other Australian rentals platform. Two prior attempts at 3D were pulled for looking too "cartoon" (commits `bd07dde`, `c94623c`, reverted in `5e63ce7`). The product owner explicitly wants the site to feel "like a game, interactive, fun, cool" and references Apple's marketing surfaces (`apple.com/vision-pro`, `apple.com/airpods-max`) and Bruno Simon's `bruno-simon.com`. We are committing to a hybrid: Apple-cinematic polish + actually-playable interaction.

## 3. Non-negotiables (constraints that bind every decision)

- **No cartoon.** Light, materials, shadow do the heavy lifting; we do not rely on character art or saturated flat colors.
- **No kitsch.** Banned vocabulary: hopping kangaroos, Vegemite, cork hats, Aussie flag décor, "G'day," koalas, boomerangs.
- **Content lives in the DOM, not the canvas.** Forms, listings, copy, hCaptcha, autofill, screen readers, copy-paste, SEO all continue to function as today.
- **Conversion funnel must not regress.** Search → Property Detail → Signup → Contact Landlord stays fast. If the 3D ever slows it, we drop tier.
- **One persistent canvas.** Navigating between routes never unmounts the WebGL context. This is the Apple trick — you are never "out of" the world.
- **Auto-degrade is honest.** Tier 2 (no canvas) is a first-class experience, not a sad fallback. The site is fully usable on it.

## 4. Visual & interaction language

### 4.1 Avatar / player vehicle
**Drone / free-fly camera.** Smooth gimbal with mass and spring. Mouse drag rotates yaw + pitch; scroll dives forward; W/A/S/D translates on capable inputs; touch drag rotates and pinch zooms on mobile. Default mode is "on-rails" — the camera follows a curated path for each pocket scene; a "Take controls" affordance unlocks free-fly for power users.

### 4.2 Aussie aesthetic — the "no-cartoon" rules
Australia is conveyed primarily through **light and materials**, secondarily through landscape, sparingly through landmarks.

- **Light:** golden-hour low-angle sun, harsh shadows, dusty haze, subtle volumetric god-rays.
- **Materials:** sandstone (warm beige), gum-leaf silver-green, terracotta tile, weathered timber, harbor blue. (Tokens already exist in `globals.css` from commit `55137b1`.)
- **Landscape:** eucalyptus forests, red outback, white beaches, blue-mountains haze, coastal mangroves.
- **Architecture:** Federation terraces, Queenslanders, beach shacks, modernist coastal, 70s suburban ranch.
- **Landmark anchors** (used once each, in their literal geographic place): Opera House silhouette (Sydney), Uluru (Red Centre), Twelve Apostles (Vic coast), a solitary sandstone lighthouse (About scene only). No other named landmarks in v1.

### 4.3 Audio
- Ambient bed per pocket (wind, cicadas, ocean lull), -24dB default.
- UI sounds: panel open (soft chime), camera transition (faint whoosh), CTA hover (click-tick).
- Default OFF. User toggle in HUD frame; preference persisted to localStorage. Browser autoplay rules require user gesture anyway.

## 5. Architecture

### 5.1 Persistent canvas pattern

```
<App>
  <BrowserRouter>
    <WorldRoot>                  // persistent, never unmounts
      <Canvas>                   // R3F canvas
        <WorldStage />           // sky, ground, atmosphere
        <DroneRig />             // camera + controls
        <PocketSlot />           // current pocket scene (animates on route change)
        <DeviceTierGate />       // startup probe (writes to zustand)
      </Canvas>
    </WorldRoot>

    <HUDRoot>                    // persistent, never unmounts
      <HUDFrame />               // top + bottom edge UI, audio toggle, compass
      <Routes>                   // standard React Router
        <Route path="/" element={<HUDHome />} />
        <Route path="/about" element={<HUDAbout />} />
        ...all existing pages, repurposed as HUD content
      </Routes>
    </HUDRoot>
  </BrowserRouter>
</App>
```

`PocketSlot` subscribes to `useLocation()` and animates the camera + swaps pocket scene contents via theatre.js timelines on route change. The canvas tree mounts once and never unmounts.

### 5.2 Tech stack

| Concern | Lib | Why |
|---|---|---|
| Renderer | three.js (existing) | Already installed |
| React bridge | @react-three/fiber (existing) | Declarative R3F |
| Helpers | @react-three/drei (existing) | Cameras, environments, loaders |
| Post-fx | **@react-three/postprocessing** (new) | Bloom, DoF, vignette — the Apple-cinematic gloss |
| Sequencing | **@theatre/core + @theatre/studio** (new) | Keyframed camera/scene animation; cinematic transitions |
| Smooth scroll | **@studio-freight/lenis** (new) | Foundation for scroll-driven dives |
| World state | **zustand** (new) | Camera target, pocket, device tier, audio toggle |
| Existing | react 18, vite 5, supabase, lucide, hCaptcha, leaflet (used on search map page), react-router 6 | Keep all |

### 5.3 Device tier auto-degrade

```
Tier 0 — Full     | bloom + DoF + soft shadows + post-fx, full LOD     | M1 Mac / iPhone 13+ / good Android
Tier 1 — Lite     | no DoF, baked lighting, reduced LODs, no post-fx   | 2020+ laptops & phones
Tier 2 — Static   | NO canvas. Animated CSS gradient matching pocket   | Reduced-motion, low-end, WebGL-unavailable
```

**Probe sequence on first paint:**
1. WebGL2 support? If no → Tier 2.
2. `prefers-reduced-motion: reduce`? If yes → Tier 2.
3. `navigator.deviceMemory < 4`? If yes → Tier 1 floor.
4. `navigator.connection.effectiveType === '2g' | 'slow-2g'`? If yes → Tier 2.
5. Render an invisible probe scene for 1 second; if sustained fps < 45 → drop one tier; < 25 → Tier 2.
6. Write final tier to zustand; world subscribes and configures itself.

User can manually override tier from HUD settings (escape hatch). Choice persisted.

### 5.4 Route → pocket map

| Route | Pocket scene | Notes |
|---|---|---|
| `/` | Continent | Orbital golden-hour view, listing glow markers |
| `/about` | Lighthouse | Sandstone cliff lighthouse, story panels orbit |
| `/for-tenants` | Arrival Camp | Swag + fire under stars, belief cards as slates |
| `/for-landlords` | Federation Study | Brass lamp, ledger desk, pricing as drawer pulls |
| `/suburb-guides` | Sandstone Library | Ocean terrace, each guide a stained-glass plinth |
| `/suburb/:slug` | Suburb (typology) | Camera dives from continent; arch matches typology |
| `/search` | Continent (search mode) | Markers cluster + glow; left filter HUD; camera flies to picks |
| `/property/:id` | House Interior | Listing photos as framed pictures on virtual walls |
| `/dashboard`, `/account-settings`, `/admin` | Hangar / Cockpit | Pilot HQ console; listings as instruments |
| `/login`, `/signup`, `/email-confirmed`, `/forgot-password`, `/reset-password` | Beach Arrival | Golden-hour landing, form on glass slate on sand |
| `/list-property`, `/edit-property`, `/pricing`, `/advertise`, `/get-verified`, `/contact` | Federation Study (reused) | Form is the ledger |
| `/affordability` | Continent (heatmap) | Recolors by affordability |
| `/newcomer-map` | Continent (overlay) | Newcomer-friendly suburbs glow brighter |
| `/privacy`, `/terms` | HUD-only | No new pocket — panel fades over current scene |

### 5.5 Asset budget for v1

| Asset | Count | Source |
|---|---|---|
| Stylized continent base | 1 | Hand-modeled in Blender, ~5k tris, baked AO |
| City silhouette plates | 8 | Alpha-cut skyline cards (Sydney, Melb, Bris, Perth, Adel, Canb, Darwin, Hobart) |
| Suburb typology templates | 5 | Federation terrace, Queenslander, beach shack, modernist coastal, 70s ranch — palette + trim varied per suburb |
| House interior template | 1 | Stylized neutral interior with photo-plate frames for real listing photos |
| Hero landmarks | 4 | Opera House silhouette, Uluru, Twelve Apostles, lighthouse |
| HDRI sky + atmospheric shader | 1 | Golden-hour HDRI + time-of-day scatter shader |

**Total v1 unique 3D assets: ~20.** Expandable: new suburbs reuse typology templates with palette and trim swaps. New listings cost zero art — they appear procedurally as glow markers.

### 5.6 World ↔ data sync

- On canvas mount: query Supabase for active listings, project `lat/lng → world coords` via simple Mercator-ish transform.
- Each active listing → a glow marker on the continent, position cached in zustand.
- Filter changes (suburb, state, type, price) → marker visibility animates; camera target updates if user is in search mode.
- Click marker / listing card → router pushes `/property/:id`; camera flies to that world position; PocketHouseInterior fades in over the marker.
- Supabase realtime channel on `properties` table → new listing inserts spawn a pop-in marker with a soft chime and glow burst.

### 5.7 Error handling

| Failure | Behavior |
|---|---|
| Canvas init throws | Catch in error boundary → set tier to 2 → CSS world. |
| WebGL context lost | Show "world dimmed — tap to reload" overlay; attempt `restoreContext()` once before reload prompt. |
| Listing fetch fails | HUD toast; world stays alive; user can retry from any pocket. |
| Asset load fails | Pocket falls through to its CSS-gradient analogue while HUD remains functional. |
| Reduced motion preference | Tier 2 forced regardless of device. |
| Print stylesheet | Canvas `display:none`; pure 2D layout. |

### 5.8 SEO & accessibility floor

- SPA (existing). We do not change to SSR in this work — out of scope.
- All HUD panels keyboard-navigable; visible focus rings; ARIA labels on canvas-only affordances.
- `<canvas>` element has `role="img"` and a descriptive `aria-label` per pocket scene.
- Skip-to-content link at top of every page.
- `prefers-reduced-motion: reduce` honored: forces Tier 2 + disables panel transitions.
- Meta tags continue to populate per-route via existing `<SEO>` component.

### 5.9 Onboarding

- **First visit:** 2-second cinematic "arrival" — camera through clouds into continent view. Subtle text vignette: "Welcome to Australia, playable." A 4-second hint card: "Drag to look. Scroll to dive. Click any glow to land." Skip button always visible.
- **Return visit:** localStorage flag suppresses tutorial; instead a 1-second arrival with "Welcome back, [name]" if signed in.
- **No tutorial on Tier 2:** Static mode skips the camera-arrival narrative.

## 6. What we're NOT building (YAGNI)

- No multiplayer / other users' avatars.
- No VR / AR — `<canvas>` only.
- No photoreal rendering — stylized cinematic, full stop.
- No Newtonian physics — drone is a smooth-spring camera, no collision.
- No mini-games (e.g., furnish your rental) — deferred.
- No procedural-generation of full suburbs in v1 — typology templates with curated variants only.
- No swap from SPA to SSR — separate concern; current SEO setup is preserved.

## 7. Testing & verification

- **Visual regression:** Playwright snapshots of each pocket scene at 3 resolutions (1440x900, 768x1024, 390x844).
- **Unit tests:** world ↔ geo coordinate transform; device tier probe; pocket route map; localStorage onboarding flag.
- **Manual smoke matrix per release:** M1 Mac (Safari, Chrome), iPhone 12 (Safari), Pixel 5 (Chrome), low-end Windows laptop (Edge), reduced-motion forced, slow-3G throttle.
- **Conversion regression:** before/after measure of homepage → signup completion rate; if it drops, we revert or fix.

## 8. Shipping plan (phased, behind feature flag)

This work happens on a `3d-world` branch with `?3d=1` URL flag gating activation in production. Existing site stays live and untouched until we flip the flag globally.

| Phase | Scope | Est. |
|---|---|---|
| 0 | Scaffold: install deps, zustand store, WorldRoot/HUDRoot split, tier probe, feature flag | ~1 day |
| 1 | WorldStage + DroneRig + continent base mesh + golden-hour lighting + HDRI | ~2 days |
| 2 | Home pocket (Continent) + HUDFrame + tier auto-degrade Tier 2 CSS fallback | ~2 days |
| 3 | Pocket router + theatre.js sequencing + 3 more pockets (About, Search, Property) | ~3 days |
| 4 | Remaining pockets (Suburb, Suburb Guides, Tenants, Landlords, Hangar, Beach Arrival) | ~2 days |
| 5 | Audio, onboarding, polish, perf pass, post-fx tuning | ~2 days |
| 6 | Visual regression suite, Vercel preview deploy, smoke matrix | ~1 day |

**Tonight target:** Phases 0 and 1 live on a Vercel preview URL accessible behind `?3d=1`. Existing landaus.com.au remains unchanged.

## 9. Open questions deferred to implementation plan

- Exact Supabase realtime subscription strategy (single channel or per-state filter).
- Whether to use Theatre Studio for keyframe authoring or build a thin custom sequencer.
- Specific HDRI source (paid stock vs procedural sky shader).
- Whether the "Take controls" free-fly affordance ships in v1 or in a follow-up.

These are implementation choices, not design choices, and will be settled in the plan that follows this spec.
