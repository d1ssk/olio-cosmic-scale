# Architecture and state

## Independent coordinate worlds

Never place human meters and cosmic meters in one Three.js coordinate system. Scientific data retains physical units, while each scene selects `metersPerSceneUnit` so typical render coordinates remain roughly order 1–1,000:

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

- current scene or bridge frame and navigation actions;
- locale and URL/local preference synchronization;
- per-scene camera snapshots for the current session;
- shared camera key for the two neighborhood views;
- reset signals and future optional selection state.

Do not add a general state-management library preemptively.

## Common scene host

All 3D scenes use one host responsible for full-size canvas layout, bounded DPR, perspective/orthographic camera configuration, OrbitControls integration, loading state, WebGL/error fallback, background, camera save/restore/reset, and hooks for future selection.

Orthographic projection is preferred where equal lengths must project equally regardless of depth: Earth–Sun, Solar System, both neighborhood views, Milky Way maps, Local Group, and Virgo. Perspective is reasonable for Human, Earth, Sun, some BAO presentations, and the conceptual Observable Universe. A later toggle is allowed only when useful.

In a perspective view, any dynamic screen-space scale bar must be labeled as applying at the camera target plane. Orthographic views may show an exact view-scale bar.

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
