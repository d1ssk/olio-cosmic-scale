# AGENTS.md — Cosmic Scale Explorer

## 0. Purpose of this file

This file is the authoritative design and implementation guide for this repository.

The project will be developed incrementally with Codex/agent assistance. An agent working in this repository should read this file before making changes and should preserve the principles below unless the user explicitly changes them in a later instruction.

The repository may initially contain only this file. In that case, the first task is to create the common application infrastructure and an initial commit that makes later scene-by-scene development straightforward.

The goal is **not** to implement all astronomical scales at once. Build the shared framework first, then implement the hierarchy from smaller to larger scales in separate, reviewable steps.

---

# 1. Project concept

## 1.1 What this visualization is trying to teach

The project is an interactive visualization for building an intuitive but reasonably accurate sense of physical and astronomical length scales.

The central problem it addresses is that familiar "powers of ten" visualizations often use one continuous zoom. They are visually impressive, but they can make it difficult to retain a concrete sense of:

- how large each physical hierarchy actually is,
- how much larger one hierarchy is than the previous one,
- what units are natural at each hierarchy,
- how meters, AU, light-years, parsecs, kpc, Mpc, and Gpc relate numerically,
- and how real astronomical objects are positioned relative to one another at a fixed scale.

This project intentionally takes a different approach.

Each hierarchy is a **self-contained scale scene**. Moving from one scale to another is an explicit discrete action. When two adjacent scales differ too much to compare directly, the transition passes through one or more **scale bridges** that show only length bars and numbers.

The intended experience is:

> understand one scale as a world of its own → explicitly compare it with the previous scale → enter the next world.

This is **not** a continuous zoom through the universe.

---

# 2. Main hierarchy

The primary vertical hierarchy is:

1. **Human**
2. **Earth**
3. **Sun**
4. **Earth–Sun system (1 AU)**
5. **Solar System**
6. **Solar neighborhood**
7. **Milky Way**
8. **Local Group**
9. **Nearby galaxy cluster (Virgo)**
10. **BAO scale**
11. **Observable Universe**

The main navigation is linear through these eleven levels.

A single lateral comparison branch exists at level 6:

```text
                         Galactic-center neighborhood
                                   ↕ / compare
Human → Earth → Sun → Earth–Sun → Solar System → Solar neighborhood → Milky Way → ...
```

More precisely, the Solar neighborhood and Galactic-center neighborhood are **same-scale sibling views**, not two different levels in the hierarchy.

The Galactic-center neighborhood must use the same physical viewport scale, camera conventions, and stellar-density visualization rules as the Solar neighborhood so that the density contrast can be experienced directly.

Do not insert the Galactic-center neighborhood into the main vertical scale sequence.

---

# 3. Core interaction model

There are three conceptually distinct UI modes.

## 3.1 Scene mode

A **scene** is an interactive 3D visualization of one physical hierarchy.

Except where a particular scientific representation strongly suggests otherwise, scene mode should allow:

- orbit/rotation,
- pan,
- zoom,
- object selection or focus where useful,
- reset view,
- annotations/labels,
- responsive mouse, trackpad, touch, and keyboard interaction.

A scene is allowed to have its own bounded zoom range.

However:

**Never allow scrolling/zooming to automatically cross into the previous or next hierarchy.**

Crossing hierarchy boundaries must always be an explicit navigation action.

This separation is fundamental to the project.

---

## 3.2 Scale bridge mode

A **scale bridge** exists only to make the size ratio between adjacent hierarchy levels understandable.

It is not an astronomical scene.

It must contain only scale-comparison elements such as:

- horizontal or vertical length bars,
- numerical labels,
- unit conversions,
- ratio labels,
- a short bilingual explanatory caption if necessary,
- previous/next navigation.

It must **not** contain:

- people,
- buildings,
- mountains,
- planets,
- stars,
- galaxies,
- decorative astronomical objects,
- a 3D scene,
- arbitrary illustrative objects used as size analogies.

The bridge should compare lengths directly, not through familiar objects.

A bridge may use subtle animation between discrete steps, but it must not become a continuous powers-of-ten zoom.

Use DOM/SVG/CSS for bridges rather than Three.js unless there is a compelling implementation reason otherwise. Exact screen-space bar lengths are more important than 3D effects here.

---

## 3.3 Shared HUD

All scenes should use a common visual language for:

- scene title,
- main reference length,
- unit conversions,
- dynamic/current scale indicator where meaningful,
- previous-scale reference,
- previous/next navigation,
- language switch,
- reset view,
- optional scene-specific controls.

The HUD should remain visually quiet. The astronomy/physics visualization is the primary content.

---

# 4. Reference length versus viewport

Every hierarchy has at least two distinct concepts:

```ts
referenceLength
viewportExtent
```

Do not conflate them.

## 4.1 `referenceLength`

`referenceLength` is the characteristic physical length used to represent the hierarchy in scale comparisons.

Examples:

- Human: representative human height
- Earth: Earth diameter
- Sun: solar diameter
- Earth–Sun system: 1 AU
- Solar System: a chosen Solar-System reference span
- Solar neighborhood: a chosen local stellar-neighborhood span
- Milky Way: representative stellar-disk diameter
- Local Group: representative group extent
- Virgo: Local Group–Virgo distance or another explicitly defined reference
- BAO: the BAO characteristic scale
- Observable Universe: observable-universe diameter

This value drives the scale bridge.

## 4.2 `viewportExtent`

`viewportExtent` defines the comfortable initial field of view for the scene.

For example, an Earth scene with Earth diameter as its reference length should usually show somewhat more than one Earth diameter so the sphere has breathing room.

The viewport may also depend on camera orientation.

The initial implementation should therefore never assume:

```ts
viewportExtent === referenceLength
```

---

# 5. Provisional scale definitions

The following values are **provisional design defaults**, suitable for scaffolding and early bridge development.

They are not a license to hard-code unsourced values throughout the codebase. Scientific values must eventually live in centralized data modules with provenance.

| ID | Scene | Provisional reference length | Main unit |
|---|---|---:|---|
| `human` | Human | 1.7 m | m |
| `earth` | Earth | 12,742 km | km / Mm |
| `sun` | Sun | 1.3927 million km | km / Gm |
| `earth-sun` | Earth–Sun system | 1 AU | AU |
| `solar-system` | Solar System | 100 AU (provisional; may be revised) | AU |
| `solar-neighborhood` | Solar neighborhood | 10 pc (provisional full span) | pc |
| `milky-way` | Milky Way | 30 kpc | kpc |
| `local-group` | Local Group | 3 Mpc | Mpc |
| `virgo` | Nearby galaxy cluster (Virgo) | 16.5 Mpc | Mpc |
| `bao` | BAO scale | 147 Mpc class | Mpc |
| `observable-universe` | Observable Universe | 28.5 Gpc class diameter | Gpc |

The exact definitions of Solar System, Solar neighborhood, Local Group extent, BAO convention, and observable-universe distance convention should be revisited when those scenes are implemented.

Do not silently change a reference-length definition. A change in definition changes the pedagogical meaning of the scale ladder and the generated bridge steps.

---

# 6. Scale bridge design

## 6.1 Every hierarchy transition should communicate the ratio

The transition between adjacent hierarchy levels should always make the previous characteristic scale visible in relation to the new characteristic scale.

For a modest ratio, a single bridge frame may be sufficient.

For a very large ratio, insert intermediate scale-only frames.

Example concept:

```text
Human
1.7 m
──────────────

Next

170 m frame
human height:
▏

current reference:
──────────────

Next

17 km frame
previous:
▏

current reference:
──────────────

...

Earth
12,742 km
```

The exact intermediate values should be tuned for legibility and pedagogy.

---

## 6.2 Intermediate scales are not hierarchy levels

Intermediate bridge frames:

- do not appear in the main hierarchy list,
- do not get astronomical names,
- do not contain 3D content,
- do not count as "scenes",
- should be reversible,
- should use the same sequence in reverse when navigating backward.

Generate or define each bridge transition once, then reverse it for backward navigation.

Do not independently regenerate backward steps.

---

## 6.3 Bridge-legibility rule

Do not rely only on a hard-coded ratio threshold.

The actual criterion is visual:

> Is the previous length bar still large enough on screen to be perceived as a meaningful bar?

A useful default target is approximately 8–12 physical CSS pixels minimum for the smaller bar, but this should be a design token and should respond to viewport size.

Suggested configuration:

```ts
type BridgeConfig = {
  mainBarFraction: number;       // e.g. 0.60 of available width
  minSmallBarPx: number;         // e.g. 10 px
  preferredStepRatios: number[]; // e.g. [10, 20, 50, 100]
}
```

The bridge planner should be responsive rather than assuming a fixed 1000 px display.

---

## 6.4 Prefer pedagogically meaningful intermediate numbers

Automatic bridge generation should prefer "nice" numbers, for example the 1–2–5 series across powers of ten:

```text
1, 2, 5, 10, 20, 50, 100, ...
```

However, bridge sequences may be overridden when crossing an important unit boundary is pedagogically valuable.

Examples:

```text
100 AU → 10,000 AU → 1 pc → 10 pc
```

or

```text
10 pc → 1 kpc → 30 kpc
```

These are preferable to mathematically smooth but meaningless intermediate values.

The bridge system should therefore support:

```ts
autoBridge: true
```

and optional per-transition overrides:

```ts
bridgeMilestones: Length[]
```

---

## 6.5 Avoid a continuous zoom illusion

Bridge transitions should feel discrete.

Good:

- fade between two comparison frames,
- short bar resize,
- crossfade numbers,
- step button,
- brief easing.

Avoid:

- flying continuously through many orders of magnitude,
- camera motion through a fake universal coordinate system,
- background objects rushing past,
- cinematic "powers of ten" travel.

---

# 7. Units and numerical intuition

Unit literacy is a major goal of the project.

Every scene should show:

1. one **main natural unit** prominently,
2. secondary equivalent values in other relevant unit systems.

The project should make the following families easy to compare:

- meter family: `m`, `km`, `Mm`, `Gm`, `Tm`, `Pm`, `Em`, `Zm`, `Ym` where sensible,
- astronomical unit: `AU`,
- light-year family: `ly`, `kly`, `Mly`, `Gly`,
- parsec family: `pc`, `kpc`, `Mpc`, `Gpc`.

Do not force unusual prefixes merely because they are technically legal. Prefer astronomical conventions and readable scientific notation when a prefixed unit would be unfamiliar.

Example:

```text
10 pc
32.6 ly · 2.06×10^6 AU · 3.09×10^17 m
```

The exact secondary layout may be compact on mobile and expanded on desktop.

---

## 7.1 Canonical storage unit

Store physical lengths canonically in SI meters in scientific data structures.

Example:

```ts
type Length = {
  meters: number;
}
```

Formatting into AU / ly / pc families belongs in the presentation layer.

Do not store one copy of the same physical quantity separately in meters, AU, and parsecs.

---

## 7.2 Constants

Centralize constants such as:

- AU in meters,
- parsec in meters,
- light-year in meters,
- relevant adopted astronomical distances/radii.

Use a dedicated module such as:

```text
src/physics/constants.ts
```

or

```text
src/data/constants.ts
```

Do not scatter conversion constants throughout components.

Document the convention and provenance of values that are not exact definitions.

---

## 7.3 Formatting

Create a reusable length formatter capable of producing:

```ts
formatLength(length, {
  primaryUnit: "pc",
  secondaryUnits: ["ly", "AU", "m"],
  locale: "ja"
})
```

Use locale-aware digit grouping where appropriate.

Avoid excessive precision. Display precision should reflect the scientific precision and pedagogical purpose, not JavaScript floating-point output.

---

# 8. 3D architecture and numerical scaling

## 8.1 Do not create one universal Three.js coordinate system

Never put human-scale meters and observable-universe meters into a single continuous Three.js world.

That would be both conceptually contrary to the project and numerically fragile.

Each scene is an independent coordinate world.

Physical data can remain in meters, parsecs, etc., but render coordinates must be normalized per scene.

Example:

```ts
sceneUnits = physicalMeters / metersPerSceneUnit
```

Each scene should keep typical render coordinates in a numerically comfortable range, roughly order unity to order thousands rather than `1e26`.

---

## 8.2 Scene coordinate metadata

Each scene should define something like:

```ts
type SceneScale = {
  referenceLengthMeters: number;
  metersPerSceneUnit: number;
  defaultViewportExtentMeters: number;
  originDescription: TranslationKey;
}
```

Astronomical coordinate scenes should additionally document the reference frame:

- heliocentric,
- galactocentric,
- Local Group barycentric or another explicit convention,
- comoving coordinates,
- etc.

Never mix coordinate frames silently.

---

## 8.3 Camera choice

A "3D scene" does not require a perspective camera.

For scale-sensitive spatial maps, an **orthographic camera may be preferable** because equal physical lengths project equally independent of depth.

Consider orthographic default cameras for:

- Earth–Sun spatial layout,
- Solar System,
- Solar neighborhood,
- Galactic-center neighborhood,
- Milky Way map,
- Local Group,
- nearby-universe/Virgo map.

Perspective may be preferable for:

- Human,
- Earth,
- Sun,
- some BAO representations,
- Observable Universe conceptual scene.

Per-scene camera choice is allowed.

A later optional perspective/orthographic toggle is acceptable where useful, but scientific scale readability takes precedence over cinematic perspective.

---

## 8.4 Dynamic scale bars in perspective views

A screen-space scale bar is not globally meaningful in a perspective scene because projected physical size depends on depth.

If a perspective scene shows a dynamic scale bar, clearly define it as the scale **at the camera focus/target plane**.

Do not imply that the same screen-space scale applies to all depths.

Orthographic scenes may use an exact view-scale bar.

---

# 9. Shared 3D interaction conventions

Aim for consistent controls across scenes.

Default expectations:

- left drag / one-finger drag: orbit,
- secondary drag or modified drag: pan,
- wheel / pinch: zoom,
- click/tap: select or focus where supported,
- reset button: restore scene default camera,
- Esc: clear selection where appropriate.

Do not make controls conflict with page scrolling on touch devices more than necessary.

All scene camera limits should be defined per scene.

Again:

**zooming within a scene must never automatically trigger hierarchy navigation.**

---

# 10. Solar neighborhood lateral comparison

This is a special feature and should be designed deliberately.

## 10.1 Purpose

At the Solar-neighborhood hierarchy level, allow a lateral move to a same-scale view of the stellar environment near the Galactic center.

The purpose is not to introduce a new size scale.

The purpose is:

> to compare stellar number density at exactly the same physical spatial scale.

---

## 10.2 Invariants between the two sibling views

When moving between:

```text
Solar neighborhood
↔
Galactic-center neighborhood
```

preserve as much as possible:

- physical viewport extent,
- camera projection type,
- camera zoom,
- camera orientation,
- visual point-size rules,
- density sampling convention,
- label style,
- reference scale bar.

Do **not** insert a scale bridge.

The transition should make it obvious that the scale has not changed.

A short lateral slide/crossfade is acceptable.

---

## 10.3 Stellar rendering and density honesty

Actual stellar radii cannot be shown at the same scale as interstellar separations.

Stars must therefore be markers.

The visualization must explicitly state that stellar marker radii are not physical sizes.

For the Solar neighborhood, use actual catalog positions where practical.

For the Galactic-center neighborhood, the true number of stars within an equal spatial volume may be too large to render literally.

If subsampling or a density model is used:

- preserve the relative density meaning,
- use deterministic seeded sampling,
- document what one rendered marker represents,
- never imply "one point = one star" unless that is actually true,
- use the same representation convention on both sibling views whenever possible.

A valid strategy is:

```text
1 rendered point = N physical stars
```

with the same `N` in both comparison views.

If actual named nearby stars are overlaid in the Solar neighborhood, keep the density-representation layer visually distinct from the named-star layer.

---

# 11. Scene-specific scientific intent

These are implementation targets, not rigid final designs.

## 11.1 Human

Purpose:

- establish the starting scale,
- represent a typical human height,
- create the first physical reference bar.

The exact artistic representation can be simple.

Do not spend disproportionate effort on a photorealistic human model.

Reference length: representative human height.

---

## 11.2 Earth

Purpose:

- show Earth as a 3D body,
- establish Earth diameter as the next concrete scale,
- allow orbiting the globe.

Possible later refinements:

- oblate spheroid rather than perfect sphere,
- atmosphere as a subtle layer,
- equatorial/polar radius annotations.

Do not exaggerate atmosphere thickness without labeling the exaggeration.

---

## 11.3 Sun

Purpose:

- show the solar diameter at the correct scale,
- compare Earth and Sun scales through the bridge rather than by placing a decorative Earth nearby unless there is a clear scientific reason.

The Sun scene can be visually simple at first.

---

## 11.4 Earth–Sun system

Purpose:

- show 1 AU as a real spatial separation,
- position Earth and Sun at the same spatial scale,
- communicate that the Sun is visible at true size while Earth may be subpixel or nearly so.

Use real geometric scale.

If Earth needs a marker for visibility, distinguish the marker from its physical radius.

An orbit guide may be shown.

---

## 11.5 Solar System

Purpose:

- show planetary orbital positions/distances on one linear spatial scale,
- preserve actual relative orbital distances,
- avoid the common misleading practice of enlarging planets without explanation.

Planet options:

- render small planets as points,
- omit physical disks if subpixel,
- use labels/leader lines,
- optionally support a clearly labeled "exaggerate planet sizes" toggle later.

Orbital geometry may begin as simplified circular/planar orbits if clearly documented, then be improved later.

The scene's exact reference span must be decided when implemented.

---

## 11.6 Solar neighborhood

Purpose:

- show nearby stars in their actual 3D positions around the Sun,
- let users experience parsec-scale stellar separation,
- provide the lateral Galactic-center comparison.

Use a catalog-derived dataset where practical.

Potential named objects include nearby stars/systems such as Alpha Centauri, Barnard's Star, Sirius, etc., but the actual included set should be chosen from a documented dataset rather than a hand-written decorative list.

---

## 11.7 Milky Way

Purpose:

- show the Sun's location in the Galactic disk,
- show the relation between disk diameter, disk thickness, bulge/bar, and the Galactic center,
- communicate which structures are directly constrained and which are model-dependent.

Do not present spiral-arm geometry as exact if using an illustrative model.

Possible visual convention:

- high-confidence geometry: stronger,
- model-dependent structure: lighter/translucent,
- labels explaining uncertainty.

---

## 11.8 Local Group

Purpose:

- show Milky Way, Andromeda, M33, and major satellites/groups at the same spatial scale,
- make the Milky Way–Andromeda separation intuitive,
- show galaxy physical extent where meaningful.

Galaxy centers should use real relative positions where known.

Galaxy visible/stellar sizes can be shown approximately to scale if supported by data.

Small galaxies may require markers and labels.

---

## 11.9 Nearby galaxy cluster (Virgo)

Purpose:

- extend from the Local Group to the nearby large-scale galaxy environment,
- show the spatial relation from us/the Local Group to the Virgo Cluster,
- show the cluster's own spatial extent at the same scale where useful.

The main reference length is provisionally the Local Group–Virgo distance.

This scene may include selected nearby groups or galaxies only if they improve spatial understanding.

Avoid filling it with decorative points that are not tied to a documented dataset.

---

## 11.10 BAO scale

Purpose:

- introduce a characteristic statistical scale rather than the size of one object,
- make the approximately 150 Mpc-class separation intuitive.

Do not depict BAO as a literal visible shell around every individual galaxy.

A useful representation may show:

- a 3D galaxy-density sample or schematic point field,
- a selected reference location,
- a spherical radius at the BAO scale,
- explanation that the feature appears statistically in the two-point correlation function / clustering pattern.

The representation must clearly distinguish "statistical preferred scale" from "physical object boundary."

---

## 11.11 Observable Universe

Purpose:

- provide the final cosmic scale,
- communicate observable radius/diameter using an explicit cosmological distance convention,
- distinguish present-day comoving distance from light-travel time.

Potential elements:

- observer at center,
- radial structure,
- CMB last-scattering surface,
- observable boundary,
- optional conceptual light-cone information.

Do not pretend we have a literal 3D catalog of all matter out to the observable boundary.

---

# 12. Scientific accuracy and provenance

## 12.1 General rule

Whenever object positions, physical sizes, densities, or cosmological scales are known from data, prefer real values over arbitrary placement.

However, visually simplified or model-based representations are allowed when required for performance or clarity.

The visualization must distinguish:

- measured / catalog-derived values,
- conventional adopted values,
- model-dependent values,
- schematic representation.

---

## 12.2 Data source organization

Do not embed scientific numbers directly inside rendering components.

Prefer modules such as:

```text
src/data/
  sources.ts
  solarSystem.ts
  nearbyStars.ts
  milkyWay.ts
  localGroup.ts
  virgo.ts
  cosmology.ts
```

Each nontrivial dataset should include provenance metadata.

Example:

```ts
type SourceInfo = {
  id: string;
  title: string;
  organization?: string;
  url?: string;
  citation?: string;
  accessed?: string;
  notes?: string;
}
```

Scientific object data can reference a source ID.

---

## 12.3 Runtime network access

Prefer a static application.

Do not require live external APIs for ordinary use unless a later user request explicitly calls for them.

Small curated/preprocessed datasets should be included in the repository when licenses permit.

For larger catalog inputs, keep:

- a documented preprocessing script,
- a small generated artifact used by the app,
- source/license attribution.

---

# 13. Internationalization

The interface must support Japanese and English from the beginning.

Do not implement Japanese first and retrofit English later.

## 13.1 No hard-coded user-visible prose

Visible text should use translation keys.

Suggested structure:

```text
src/i18n/
  index.ts
  ja.ts
  en.ts
```

or use a lightweight established i18n library if it provides clear value.

Avoid adding a large dependency only for trivial translation needs.

---

## 13.2 Language state

Support:

```text
ja
en
```

Preferred resolution order:

1. explicit URL parameter if present,
2. saved user preference,
3. browser language,
4. Japanese default.

A reasonable URL format is:

```text
?lang=ja
?lang=en
```

Persist manual switching locally.

---

## 13.3 Number formatting

Use locale-aware formatting where helpful, but scientific unit notation should remain scientifically standard.

Avoid translating unit symbols such as:

```text
m
AU
ly
pc
kpc
Mpc
Gpc
```

Translate explanatory labels, not mathematical symbols.

---

# 14. Navigation state model

Represent navigation explicitly as a graph rather than scattering "next scene" logic across components.

Conceptually:

```ts
type SceneId =
  | "human"
  | "earth"
  | "sun"
  | "earth-sun"
  | "solar-system"
  | "solar-neighborhood"
  | "galactic-center-neighborhood"
  | "milky-way"
  | "local-group"
  | "virgo"
  | "bao"
  | "observable-universe";
```

The main vertical sequence excludes `galactic-center-neighborhood`.

A navigation registry should define:

```ts
type SceneDefinition = {
  id: SceneId;
  kind: "scene";
  titleKey: string;
  referenceLengthMeters: number;
  preferredPrimaryUnit: UnitId;
  component: React.LazyExoticComponent<...>;
  previous?: SceneId;
  next?: SceneId;
  lateralSibling?: SceneId;
}
```

Bridge frames should be generated from transitions between main-scene definitions rather than registered as ordinary scene IDs.

---

# 15. URL/deep-link behavior

Support deep-linking to a hierarchy level during development and for sharing.

A simple query or hash approach is enough; a full router dependency is not required unless needed later.

Suggested format:

```text
?scene=solar-neighborhood&lang=ja
```

For the lateral branch:

```text
?scene=galactic-center-neighborhood&lang=en
```

When the URL identifies a valid scene, load it directly without replaying previous bridges.

Bridge state does not need to be deep-linkable initially.

---

# 16. Camera-state persistence

Each scene should remember its own camera state during the current session.

Example behavior:

1. user rotates Solar System,
2. user goes to Solar neighborhood,
3. user returns,
4. Solar System returns to the previous camera orientation rather than resetting.

A reset button restores the canonical scene view.

For the Solar-neighborhood ↔ Galactic-center-neighborhood lateral switch, camera state should be shared/synchronized so that the same physical view is compared directly.

---

# 17. Rendering markers versus physical object size

A recurring issue is that many objects are physically too small to appear at the correct spatial scale.

Adopt a strict rule:

**Never visually enlarge a physical object without either labeling the enlargement or rendering it as an explicitly symbolic marker.**

Possible modes:

- `physical`: geometry uses physical radius,
- `marker`: screen-space marker not to scale,
- `exaggerated`: physical size multiplied by a stated factor,
- `density-proxy`: point represents multiple physical objects.

Represent this in data or component props rather than relying on ad hoc conventions.

Example:

```ts
type RepresentationMode =
  | { type: "physical" }
  | { type: "marker" }
  | { type: "exaggerated"; factor: number }
  | { type: "density-proxy"; objectsPerMarker: number };
```

The UI should make the active convention discoverable.

---

# 18. Labels and annotations

Use labels to preserve scientific meaning when physical geometry becomes subpixel.

Labels should:

- anchor to real object positions,
- avoid changing object positions for readability,
- use leader lines where useful,
- support Japanese and English,
- avoid severe overlap,
- allow reduced label density on mobile.

Do not substitute labels for correct data placement.

---

# 19. Accessibility and motion

Support:

- keyboard navigation,
- visible focus states,
- appropriate button labels,
- `prefers-reduced-motion`,
- readable text contrast,
- touch controls.

Scale bridge transitions should reduce or eliminate animation when reduced motion is requested.

Do not encode scientific categories solely by color.

---

# 20. Performance principles

The site should remain usable on typical desktop and modern mobile hardware.

Guidelines:

- lazy-load scene code and heavy assets,
- use instancing / point rendering for large object counts,
- avoid re-rendering static geometry from React state unnecessarily,
- use deterministic level-of-detail strategies,
- cap label counts,
- use device-aware density for purely visual particles,
- do not reduce scientifically meaningful point density without indicating the representation rule.

For procedural or sampled astronomical distributions, use seeded randomness so screenshots and tests are reproducible.

---

# 21. Recommended technical stack

Unless the repository already establishes another stack, the default scaffold should use:

- Vite
- TypeScript
- React
- Three.js
- `@react-three/fiber`
- `@react-three/drei`

Testing/tooling:

- ESLint
- Prettier
- Vitest
- React Testing Library where useful
- Playwright for a small number of end-to-end smoke tests if setup remains lightweight

Do not add state-management libraries unless shared state becomes complex enough to justify them.

A small React context/store is sufficient initially.

Do not pin arbitrary old versions in this document; use mutually compatible current stable packages at implementation time.

---

# 22. Proposed repository structure

A reasonable initial structure is:

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── navigation.ts
│   │   ├── sceneRegistry.ts
│   │   └── appState.ts
│   ├── components/
│   │   ├── AppShell/
│   │   ├── SceneHUD/
│   │   ├── ScaleReadout/
│   │   ├── ScaleBar/
│   │   ├── NavigationControls/
│   │   ├── LanguageSwitch/
│   │   └── LoadingState/
│   ├── bridges/
│   │   ├── ScaleBridge.tsx
│   │   ├── bridgePlanner.ts
│   │   └── bridgeTypes.ts
│   ├── scenes/
│   │   ├── shared/
│   │   ├── human/
│   │   ├── earth/
│   │   ├── sun/
│   │   ├── earth-sun/
│   │   ├── solar-system/
│   │   ├── solar-neighborhood/
│   │   ├── galactic-center-neighborhood/
│   │   ├── milky-way/
│   │   ├── local-group/
│   │   ├── virgo/
│   │   ├── bao/
│   │   └── observable-universe/
│   ├── physics/
│   │   ├── constants.ts
│   │   ├── length.ts
│   │   └── coordinates.ts
│   ├── data/
│   │   └── sources.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── ja.ts
│   │   └── en.ts
│   ├── styles/
│   └── main.tsx
├── tests/
└── .github/
    └── workflows/
```

Do not create dozens of empty files just to match this tree. Create directories/files when they support the initial architecture or current implementation.

---

# 23. Scene component contract

Create a common scene interface early.

For example:

```ts
type ScaleSceneProps = {
  active: boolean;
  locale: Locale;
  onReady?: () => void;
};

type SceneMetadata = {
  id: SceneId;
  titleKey: TranslationKey;
  referenceLengthMeters: number;
  defaultViewportExtentMeters: number;
  metersPerSceneUnit: number;
  preferredPrimaryUnit: UnitId;
  camera: CameraConfig;
};
```

Each scene should separate:

- metadata,
- scientific data,
- rendering,
- bilingual content.

Avoid giant single-file scene components.

---

# 24. Common scene host

The initial infrastructure should include one common 3D host responsible for shared behavior such as:

- canvas sizing,
- DPR limits,
- camera control integration,
- loading state,
- error boundary / WebGL failure message,
- shared background,
- scene HUD,
- reset-camera hook,
- optional selection infrastructure.

Individual scenes should not each reinvent full-screen canvas setup.

---

# 25. Styling direction

The design should be quiet, scientific, and visually spacious.

Avoid:

- game-like UI,
- excessive gradients,
- glowing sci-fi decoration,
- unnecessary starfield backgrounds,
- card-heavy dashboards,
- decorative animations that compete with scale perception.

The bars, objects, labels, and numbers should carry the experience.

Keep design tokens centralized using CSS custom properties.

Support both desktop and mobile from the beginning.

Dark/light theming is optional unless explicitly requested later.

---

# 26. Initial commit scope

When starting from an otherwise empty repository containing this file, the initial agent should implement **common infrastructure only**.

Do not attempt to complete all eleven scientific scenes in the initial commit.

The initial commit should preferably include:

## Application scaffold

- Vite + React + TypeScript application
- build and dev scripts
- linting/formatting
- basic tests
- common global styling
- responsive full-viewport app shell

## Navigation infrastructure

- complete scene registry containing all planned scene IDs and provisional metadata
- main vertical order
- Solar-neighborhood lateral branch
- Previous/Next controls
- lateral comparison control where applicable
- deep-linkable scene selection
- camera-state store interface

Unimplemented scenes may use a clearly labeled development placeholder.

## Scale infrastructure

- physical length type/conversion utilities
- unit formatter
- shared scale readout component
- bridge planner
- scale bridge renderer
- support for manual bridge milestones
- tests for conversion and bridge planning

## 3D infrastructure

- shared R3F/Three.js scene host
- common camera/control abstraction
- orthographic and perspective support
- reset camera
- scene-unit normalization utilities
- placeholder scene demonstrating that the host works

## Internationalization

- Japanese and English string dictionaries
- language switch
- URL language parameter
- persistence of preference
- no user-visible hard-coded language in shared components

## Quality infrastructure

- ESLint
- Prettier
- type checking
- unit tests
- CI workflow that runs install, lint, typecheck, test, and build

A deployment workflow may be added if it is simple and does not impose repository-specific assumptions. Static hosting compatibility is required.

---

# 27. What the initial commit should NOT do

Do not:

- fetch large astronomy datasets,
- implement all planet or star catalogs,
- build a polished Human model,
- implement the entire Milky Way,
- invent decorative scientific content,
- create a continuous zoom system,
- create one universal astronomical world coordinate system,
- over-engineer backend services,
- add runtime databases,
- add authentication,
- add analytics,
- add external APIs without need.

The goal is a clean framework that makes each later scene implementation isolated and predictable.

---

# 28. Suggested initial commit message

A reasonable commit message is:

```text
chore: scaffold cosmic scale explorer
```

If the initial commit includes a functional first scale/bridge demo, this is also acceptable:

```text
feat: scaffold scale scenes and bridge framework
```

---

# 29. Incremental development workflow after the initial commit

Implement the main hierarchy from smaller to larger scales.

Recommended sequence:

```text
1. Human
2. Earth
3. Sun
4. Earth–Sun
5. Solar System
6. Solar neighborhood
6a. Galactic-center neighborhood lateral comparison
7. Milky Way
8. Local Group
9. Virgo
10. BAO
11. Observable Universe
```

For each scene:

1. agree on the exact scientific definition of `referenceLength`,
2. agree on `viewportExtent`,
3. identify authoritative data sources,
4. define coordinate frame,
5. decide physical versus symbolic representation for each object class,
6. implement the scene,
7. verify the incoming bridge,
8. add bilingual explanatory content,
9. add targeted tests,
10. check desktop and mobile interaction,
11. commit the scene as a focused change.

Avoid batching multiple major hierarchy levels into one large change unless explicitly requested.

---

# 30. Definition of done for a scene

A scene should not be considered complete merely because objects render.

It should satisfy:

- correct hierarchy reference length,
- documented viewport extent,
- documented coordinate frame,
- scientifically defensible object positions,
- explicit handling of not-to-scale markers,
- working orbit/pan/zoom where appropriate,
- camera reset,
- Japanese and English labels/content,
- unit readout,
- previous-scale comparison,
- correct Next/Previous behavior,
- incoming and outgoing bridge behavior,
- responsive layout,
- acceptable performance,
- relevant tests,
- source/provenance metadata for nontrivial data.

---

# 31. Scientific uncertainty

If a quantity is not uniquely defined, do not hide that ambiguity.

Examples:

- "size of the Solar System",
- outer edge of the Milky Way,
- Local Group boundary,
- spiral-arm geometry,
- Galactic-center stellar-density model,
- BAO scale convention,
- observable-universe distance convention.

Prefer:

```text
adopted definition: ...
```

or

```text
this visualization uses ...
```

over falsely presenting one convention as uniquely correct.

When a later user instruction changes a convention, update both code and explanatory copy consistently.

---

# 32. Source quality

For scientific values, prefer authoritative or primary sources, for example:

- IAU definitions/constants,
- NASA/ESA mission documentation,
- Gaia catalog/documentation,
- refereed astronomical papers,
- major survey data releases,
- standard cosmology references.

Do not use random educational websites as the sole source for precision values if primary references are readily available.

When internet access is unavailable during implementation, do not invent uncertain values. Use conservative placeholders with a TODO/source-needed marker or ask for a later source-validation pass.

---

# 33. Testing priorities

Tests should focus on logic where regressions would silently corrupt scientific meaning.

High priority:

- unit conversion,
- unit formatting,
- bridge milestone generation,
- forward/backward bridge symmetry,
- scene graph navigation,
- lateral sibling navigation,
- scene URL parsing,
- language switching,
- normalized scene-coordinate conversion.

Visual snapshot tests should be used sparingly.

For important 3D scenes, a small Playwright smoke test can verify that:

- the canvas loads,
- controls respond,
- navigation works,
- no runtime error occurs.

---

# 34. Scale bridge test examples

Include tests for large and modest ratios.

Examples conceptually:

```text
Human → Earth:
requires multiple intermediate bridge frames.

Earth → Sun:
may be understandable with one bridge frame if the small bar remains legible.

Sun → 1 AU:
same.

Solar System → Solar neighborhood:
requires intermediate frames and should be allowed to use a 1 pc pedagogical milestone.

Solar neighborhood → Milky Way:
requires intermediate frames and may use 1 kpc.

Local Group → Virgo:
small enough that no artificial extra decade should be added.

Virgo → BAO:
moderate ratio.

BAO → Observable Universe:
may require an intermediate Gpc-scale bridge depending on viewport legibility.
```

Do not lock the exact frame count before testing responsive rendering.

---

# 35. A note on animation and state transitions

The main hierarchy should feel like a sequence of discrete conceptual rooms.

A good transition may be:

```text
scene fades out
→ bridge frame appears
→ one or more discrete bridge steps
→ target scene fades in
```

Do not animate the old scene itself shrinking into the new scene.

That would reintroduce the continuous-zoom metaphor this project is deliberately avoiding.

---

# 36. Optional progress indicator

A subtle hierarchy indicator is acceptable, for example:

```text
6 / 11
Solar neighborhood
```

or a small linear sequence of hierarchy names.

Intermediate bridge frames should not increment the hierarchy count.

The Galactic-center lateral comparison should remain `6 / 11`, because it is not a new scale level.

---

# 37. User-facing language style

Explanatory text should be concise and scientifically careful.

Prefer:

> The star markers are enlarged for visibility; their positions are to scale.

over:

> Stars are shown here.

Prefer:

> This visualization adopts 10 pc as the Solar-neighborhood reference span.

over:

> The Solar neighborhood is 10 pc wide.

Prefer:

> The BAO feature is a statistical excess in pair separation near this scale.

over:

> Galaxies form shells of this radius.

Japanese and English should be parallel in meaning, not necessarily literal word-for-word translations.

---

# 38. Data/visual separation

Do not couple dataset structure to Three.js objects.

Prefer:

```text
scientific data
→ coordinate transform
→ scene model
→ render representation
```

This makes it possible to:

- update datasets,
- change render methods,
- test coordinate transforms,
- use the same data in labels and geometry,
- compare alternate scientific models.

---

# 39. Future extensibility

The architecture should allow, without major rewrite:

- additional lateral same-scale comparisons,
- optional explanatory overlays,
- perspective/orthographic toggles,
- alternative scientific conventions,
- additional data-source layers,
- screenshot/share mode,
- embedded iframe mode.

However, do not implement speculative features during the initial scaffold.

Build clean extension points, not unused systems.

---

# 40. Anti-goals

This project is explicitly **not**:

- a continuous powers-of-ten zoom,
- a cinematic flight from a human to the cosmic horizon,
- a generic space simulator,
- a planetarium,
- a full N-body simulation,
- a photorealistic rendering showcase,
- a dashboard of astronomy facts,
- a collection of unrelated scale analogies.

Its identity is:

> **a sequence of physically grounded, interactive scale scenes connected by explicit length-comparison bridges.**

When making design tradeoffs, preserve that identity.

---

# 41. First-agent checklist

If this file is the only meaningful file in the repository, the first Codex agent should:

- [ ] inspect the repository and confirm there is no existing stack to preserve,
- [ ] scaffold the default web stack,
- [ ] implement the shared app shell,
- [ ] define the hierarchy registry,
- [ ] define the lateral Solar-neighborhood branch,
- [ ] implement bilingual infrastructure,
- [ ] implement canonical length conversions,
- [ ] implement reference-length metadata,
- [ ] implement scale bridge planning/rendering,
- [ ] implement normalized per-scene 3D coordinates,
- [ ] implement a common 3D host with basic controls,
- [ ] create development placeholders for unimplemented scenes,
- [ ] add tests for units, bridges, and navigation,
- [ ] add CI,
- [ ] write a concise README describing how to run the project,
- [ ] run lint/typecheck/tests/build,
- [ ] make the initial commit.

Do not ask the user to decide minor implementation details that are already covered by this document.

When a scientific or UX decision is genuinely unresolved and materially changes the visualization, surface that decision explicitly in the implementation summary rather than silently inventing a convention.

---

# 42. Guiding principle

At every stage, ask:

> Does this help the user form a more accurate intuition for the actual physical scale and for the ratio to neighboring scales?

If the answer is no, the feature is probably secondary.

Accuracy does not mean every object must be rendered literally. It means that any necessary abstraction, exaggeration, sampling, or model dependence is made explicit and does not quietly distort the scale intuition the project is trying to build.
