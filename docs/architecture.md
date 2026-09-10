# Architecture and state

## Independent coordinate worlds

Never place human meters and cosmic meters in one Three.js coordinate system. The authorized `earth-sun` / `solar-system` exception shares one normalized Solar System world and the mounted Canvas; its two IDs are camera presets, not separate physical models. Scientific data retains physical units, while each scene selects `metersPerSceneUnit` so typical render coordinates remain roughly order 1–1,000:

```ts
sceneUnits = physicalMeters / metersPerSceneUnit;
```

`referenceLengthMeters` is the characteristic length used by the ladder and bridges. `defaultViewportExtentMeters` is the comfortable initial field of view and is usually larger. They are intentionally independent.

Each scene records an origin/reference-frame description. Astronomical frames must be explicit (for example heliocentric, galactocentric, Local Group barycentric, or comoving) and never mixed silently.

## Registry and contracts

The scene registry is the source of truth for IDs, hierarchy links, lateral siblings, provisional reference metadata, primary unit, lazy component, and camera configuration. The main order excludes `galactic-center-neighborhood`.

```ts
type SceneScale = {
  referenceLengthMeters: number;
  metersPerSceneUnit: number;
  defaultViewportExtentMeters: number;
  originDescriptionKey: TranslationKey;
};

type ScaleSceneProps = {
  active: boolean;
  locale: Locale;
  metadata: SceneMetadata;
  onReady?: () => void;
  referenceBarVisible?: boolean;
  entryBarKind?: "reference" | "comparison";
};

type RepresentationMode =
  | { type: "physical" }
  | { type: "marker" }
  | { type: "exaggerated"; factor: number }
  | { type: "density-proxy"; objectsPerMarker: number };
```

Scene modules should separate metadata, scientific data, rendering, and bilingual content rather than growing into one file.

## State boundaries

A small React context/store is sufficient until shared state proves more complex. It owns:

- current scene or bridge origin/target and navigation actions (`appState`);
- the current discrete comparison index and animation lock (`ScaleBridge`);
- transient bar snapshots and the cross-scene transition lock (`App`);
- local hidden/arrival/departure bar state (`SceneView`);
- locale and URL/local preference synchronization;
- per-scene camera snapshots for the current session;
- shared camera key for the two neighborhood views;
- reset signals and future optional selection state.

Do not add a general state-management library preemptively.

## Common scene host

All 3D scenes use one host responsible for full-size canvas layout, bounded DPR, perspective/orthographic camera configuration, OrbitControls integration, loading state, WebGL/error fallback, background, camera save/restore/reset, and hooks for future selection.

Orthographic projection is preferred where equal lengths must project equally regardless of depth: Earth–Sun, Solar System, both neighborhood views, Milky Way maps, Local Group, and Virgo. Perspective is reasonable for Human, Earth, Sun, some BAO presentations, and the conceptual Observable Universe. A later toggle is allowed only when useful.

The current bars are physical 3D segments, not target-plane screen rulers. `SceneReferenceBar` projects their endpoints for transfer snapshots, while its Three.js line and text sprite use depth testing. Only stroke thickness and label size are screen-space styling. If a separate dynamic screen-space ruler is added later, label its reference plane in perspective views.

`CameraConfig.fitToViewport` optionally fits the default perspective camera to the horizontal `defaultViewportExtentMeters`; Earth and Moon uses it. The host retains per-scene orbit/pan/zoom snapshots, and drains residual OrbitControls damping before restoring an exact reset.

## Data flow

Keep these boundaries explicit:

```text
scientific data
→ coordinate transform
→ scene model
→ render representation
```

This allows source updates, alternate models, renderer changes, labels, and transform tests without coupling datasets to Three.js objects.

## Loading and static deployment

Lazy-load scene modules and heavy assets. Ordinary use must not depend on runtime external APIs. Store small licensed/preprocessed datasets in the repository; for large inputs keep a documented preprocessing script, a small generated artifact, and source/license attribution.

The architecture should admit later same-scale siblings, overlays, camera projection choices, scientific conventions, data layers, screenshot/share, and iframe embedding without implementing those speculative features now.

## Repository shape

Shared code belongs under `src/app`, `src/components`, `src/bridges`, `src/physics`, `src/data`, `src/i18n`, and `src/scenes/shared`. Create scene directories and other files only as implementation needs them; do not manufacture empty structure.

## Physical-bar transition integration

`SceneReferenceBar` accepts a physical base, optional direction (default +Y), metadata-derived length, and a `reference` or `comparison` identity. `BarVisibilityContext` gates all such bars and labels for scene-local hiding, departure filtering, and arrival sequencing. Hidden bars continue updating projected endpoints, allowing camera movement while hidden and a correct subsequent transfer.

`ReferenceBarOverlay` owns invisible SVG endpoint carriers and a temporary fixed DOM bar. SVG is not the visible scene bar. `barTransition.ts` captures viewport endpoints before unmount and matches bridge bars by SI length. Wait for both the lazy scene's `onReady` and actual endpoint projection; keep the destination canvas and new bars hidden until resizing completes.

The current direct transfer graph is intentionally explicit in `App`: Human ↔ bridge ↔ Earth uses the 1.7 m / ~65.1 km connecting lengths; Earth ↔ Earth and Moon uses the Earth diameter. Only these implemented scenes mount the projection overlay. Sun and the two Solar System presets now also mount the projection overlay. Earth–Sun ↔ Solar System instead uses the host camera animation handle and a stable `solar-world` view key. Other future scenes must extend this routing, the selected bar identities, and the scene-overlay inclusion rather than assuming that a registry entry automatically creates physical-bar transfers. Generic bridge planning and direct-edge bypass already cover the full hierarchy. See the [handoff](implementation-status.md) for the continuation checklist.

## Continuous solar camera exception

`solarScale.ts` centralizes the two preset extents (3/105 AU), 100 AU adopted comparison, manual zoom bounds (4,000 km–160 AU on the viewport's shorter side), logarithmic interpolation and annotation opacity rules. Both registry entries use `EarthSunScene` and AU/10 meters per render unit. `SceneView.zoomToScene` restores bars, calls `SceneHost.animateTo`, and preserves the mounted world. On completion `App` changes the hierarchy ID and URL; the target camera snapshot prevents a reset on that metadata change. Cursor-targeted OrbitControls zoom is enabled in the shared host. Reduced motion and cancellation release animation locks.

`SolarCameraRig` adjusts the local pivot depth at drag start and fits camera depth to the complete orbit/ruler bounds without altering orthographic scale. Primary solar rulers remain world-fixed. `SceneReferenceBar.screenBottom` supports the additional close-inspection solar-diameter ruler on the camera-target plane; it updates GPU line endpoints and invisible projected carriers together. An auxiliary ruler can remain visible without owning a reference/comparison carrier. Zoom-dependent opacity never overrides an explicit departure-bar restoration. `BodyAnnotation` uses actual body positions and screen-space leaders only.
