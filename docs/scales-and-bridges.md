# Scales, units, and bridges

## Provisional scale ladder

These centralized defaults scaffold the ladder; several are adopted conventions to validate when their scene is implemented. Never silently change a definition because that changes both the pedagogical meaning and bridge sequence.

| ID                             | Adopted reference length | Main unit | Status                                       |
| ------------------------------ | -----------------------: | --------- | -------------------------------------------- |
| `human`                        |                    1.7 m | m         | representative height                        |
| `earth`                        |                12,742 km | km        | mean spherical diameter                      |
| `earth-moon`                   |               384,400 km | km        | mean center-to-center separation             |
| `sun`                          |        1.3914 million km | Gm        | nominal photospheric diameter (IAU 2015 B3)  |
| `earth-sun`                    |                     1 AU | AU        | separation convention                        |
| `solar-system`                 |                   100 AU | AU        | adopted comparison span                      |
| `solar-neighborhood`           |                     8 pc | pc        | adopted comparison length                    |
| `galactic-center-neighborhood` |                     8 pc | pc        | same scale as sibling                        |
| `milky-way`                    |                   30 kpc | kpc       | representative stellar disk diameter         |
| `local-group`                  |                    3 Mpc | Mpc       | adopted comparison span (not group boundary) |
| `virgo`                        |                 16.5 Mpc | Mpc       | adopted observer–Virgo distance              |
| `bao`                          |            147 Mpc class | Mpc       | convention to document                       |
| `observable-universe`          |  28.5 Gpc class diameter | Gpc       | distance convention to document              |

Solar-neighborhood span, Milky Way boundary, Local Group extent, Virgo reference, BAO convention, and observable-universe convention require an explicit source/definition pass with the relevant scene.

## Canonical lengths and formatting

Store every physical length once in SI meters. Conversion and display are presentation concerns. Centralize exact/conventional constants such as AU, parsec, and light-year, and attach provenance to non-exact adopted values.

The low-level formatter supports these unit families (this is not a request to show all of them in the HUD):

- `cm` at the Human scale, and `m`, `km`, `Mm`, `Gm`, `Tm`, `Pm`, `Em`, `Zm`, `Ym` where useful;
- `AU`;
- `ly`, `kly`, `Mly`, `Gly`;
- `pc`, `kpc`, `Mpc`, `Gpc`.

Do not use unfamiliar legal prefixes just because they exist. Prefer conventional astronomical units or readable scientific notation. Use locale-aware grouping but keep unit symbols unchanged, and match precision to source accuracy and teaching purpose rather than exposing floating-point noise.

## Bridge legibility

Adjacent scene ratios at or below 1:200 bypass the bridge in both directions. Earth ↔ Earth and Moon shares the Earth-diameter bar; Earth and Moon ↔ Sun shares the mean lunar-distance bar; Sun ↔ Earth–Sun shares the nominal solar-diameter bar. Each transfers directly in both directions. Larger unimplemented scenes still defer physical transfers. Larger ratios get intermediate scale-only frames.

Planning caps each comparison at 1:200. The main bar occupies 94% of the measured comparison width; the smaller bar retains its exact ratio without a minimum-width exaggeration. A 1 CSS-pixel legibility floor reduces the cap only for exceptionally narrow containers. These values are shared design tokens:

```ts
type BridgeConfig = {
  mainBarFraction: number;
  maxStepRatio: number;
  minSmallBarPx: number;
};
```

Automatic steps use geometric spacing: choose the smallest step count satisfying the ratio cap, then use the same multiplicative ratio at every step. Do not round stored intermediate lengths. Solar System–Solar neighborhood uses the user-adopted 20,000 AU intermediate length across viewport sizes (a 1:200 step from 100 AU); only the first comparison is standalone, with the final comparison inside the neighborhood.

Support both automatic planning and per-transition `bridgeMilestones`. Manual milestones remain subject to legibility: the planner may fill an overlarge segment rather than producing an invisible bar.

## Bridge state and rendering

A bridge step compares two lengths directly and shows their formatted length labels and a subdued ratio. The full conversion set belongs to the scene HUD. Bars have no end caps; their centers are aligned. Intermediate values:

- are not scene IDs or hierarchy levels;
- receive no astronomical names or 3D/decorative content;
- are reversible;
- use the exact forward sequence in reverse during backward navigation.

Use a sequential transition between discrete comparison states: fade out the departing bar for 180 ms, then resize/reposition the surviving bar for 720 ms, then reveal the incoming bar for 180 ms. The incoming opacity transition starts only at 900 ms. Reduced motion removes these visual delays. Bridge and scene backgrounds both use the canvas color. Preserve bar identity by physical length: forward travel shrinks the current main bar before the next appears; backward travel promotes the smaller bar and reveals the next smaller comparison. Comparison frames advance or reverse only through explicit button actions; wheel/pinch never advances scenes. The bar track occupies 94% of the measured comparison container, matching the planner. The Human scene reference bar projects two 3D endpoints separated by exactly 1.7 m. On forward entry, its captured screen endpoints animate into the first bridge’s smaller bar; this animation never advances the comparison index. The Human–Earth transition displays only the first two bridge frames. The final comparison occurs inside Earth: the ~65.1 km bar shrinks into a neighboring parallel bar centered at the same Y as the Earth diameter bar. Backward travel removes the Earth scene and diameter bar, then expands the ~65.1 km bar after 180 ms. Both bridge bars share a horizontal center. These physical intermediate lengths are fixed across viewport sizes by `humanEarthBridge.ts`, using the 1:200 plan at a nominal 900 px width. Do not replan them on resize: the Earth scene must retain the same ~65.1 km bar. The generic width-dependent legibility rule still applies to other bridges. On scene arrival in either direction, capture the bridge bar matching the destination’s connecting physical length (the ~65.1 km comparison for Earth, the reference length for Human), retain it while the lazy scene loads, and interpolate it to the projected scene endpoints over 1000 ms while the destination canvas and new bars remain hidden. Reveal the destination over 180 ms only after this interpolation finishes. The scene then reveals its depth-tested 3D bar; the transparent SVG only supplies projected coordinates. Reduced motion skips only these visual interpolations.

Each scene has a “Hide scale bars” checkbox, initially unchecked. It hides 3D bars and their labels, not the reference-length panel or navigation axis. This local state is discarded when changing scenes. A scale action first restores only the shared physical bar for 180 ms if hidden, removes other bars, and then follows resize → reveal. Repeated scale actions are ignored while a transition is in progress. Reduced motion skips the visual waits without hiding bars in the destination.

Every scene displays m, pc, AU, and ly reference-length conversions, omitting duplication of the primary unit and all additional prefixed-meter conversions. Secondary values use the same font family as the primary. Secondary values remain visible on mobile. The top axis positions scenes by log10(referenceLengthMeters) over 10^0–10^27 m; the two neighborhood scenes share the same physical position.

## Test expectations

Cover modest and large ratios, responsive widths, manual milestones, and exact forward/backward symmetry. Expected qualitative cases:

- Human → Earth uses two bridge screens plus an in-scene Earth comparison, with the 1:200 cap, each about 1:195.7.
- Earth → Earth and Moon → Sun and Sun → 1 AU may need only a direct frame when legible.
- Solar System → Solar neighborhood uses one standalone 100 AU → 20,000 AU comparison; the final ~1:82.5 comparison is in the scene, with an exact world-fixed small ruler and reversible transfer.
- Solar neighborhood → Milky Way uses equal-ratio automatic comparisons.
- Local Group → Virgo needs no artificial decade.
- Virgo → BAO is moderate.
- BAO → Observable Universe switches directly because its ratio is below 200.

Do not freeze exact frame counts without testing the responsive rendering.

## Solar System continuous-zoom exception

Earth–Sun ↔ Solar System shares a single coordinate world and animates the camera instead of transferring bars. Its 1 AU and 100 AU references remain fixed while the camera moves between short-side extents of 2.05 and 105 AU. Manual cursor-targeted zoom is limited to 160 AU and never exits the shared solar world. The 100 AU comparison is not a Solar System boundary; no Oort Cloud is rendered. The 1 AU ruler and label persist, while planetary leaders fade and the 100 AU ruler appears as it fits. Primary solar rulers are physically exact world-fixed segments. Only the additional close-inspection solar-diameter ruler follows the orthographic camera-target plane, with no length exaggeration and a Gm label. This exception does not change any other bridge timing or scene boundary.

Milky Way now adopts a representative 30 kpc stellar disk (ESA; no unique edge). Neighborhood ↔ Milky Way uses one standalone comparison, 8 pc → ~490 pc (geometric mean of 8 pc and 30 kpc). The final ~490 pc → 30 kpc comparison is inside the galaxy; both ratios are ~61.2. See `scenes.md` §8 for physical plane and camera conventions.

Local Group uses an adopted 3 Mpc comparison span and a separate 2.4 Mpc viewport.
Its 30 kpc comparison transfers directly to/from the Milky Way's reference, ratio
100, using the existing sequential resize/reveal timing and reduced-motion path.
Both directions preserve the explored frame when the connecting bar is wholly
inside the view volume and at least 0.5 px long. Only clipped/edge-on bars recover
default framing before capture; hidden-bar departures restore only the connecting
physical bar. A transition without a connecting bar needs no recovery. The world remains independent.

Virgo uses a 16.5 Mpc reference and a separate 44 Mpc initial viewport. Local Group ↔ Virgo transfers the exact 3 Mpc bar directly (ratio 5.5). The worlds remain independent. The 50MGC spatial selection and SBF background retention are documented in `src/scenes/virgo/README.md`; 16.5 Mpc is not a cluster diameter or selection cutoff.
