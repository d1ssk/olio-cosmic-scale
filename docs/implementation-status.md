# Implementation status and continuation

This is the handoff after completing the common framework and a first pass of all thirteen
hierarchy levels (Virgo uses a partial catalog) and the Galactic bulge sibling
(with a shared continuous Solar System world). The focused design documents
describe the current decisions; `archive/initial-project-spec.md` is historical
and must not override them.

## Implemented and next

| Scene                                    | Status                                                                                                                                           | Connecting bars                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `human` — 人間 / Human                   | Locally hosted, attributed Hachikō scan; adopted full height 2.17 m including pedestal                                                           | 1.7 m physical bar beside the statue                                                                          |
| `earth` — 地球 / Earth                   | Spherical Earth, mean diameter 12,742 km; local NASA monthly texture                                                                             | Diameter bar beside Earth over the Pacific; ~65.1 km comparison bar alongside it                              |
| `earth-moon` — 地球と月 / Earth and Moon | Both diameters and adopted mean center distance to the same scale; Moon is a smooth gray sphere                                                  | 384,400 km center-distance bar and the Earth-diameter bar beside Earth                                        |
| `sun` — 太陽 / Sun                       | Nominal IAU photospheric sphere, local Solar System Scope texture, subtle unlit animated shader                                                  | Solar diameter and mean Earth–Moon distance; direct transfers both directions                                 |
| `earth-sun` — 地球と太陽 / Earth and Sun | Inner preset of the shared world; eight planets and Moon, dated positions and textured physical spheres                                          | 1 AU persists; solar diameter fades; 100 AU appears on zoom-out                                               |
| `solar-system` — 太陽系 / Solar System   | Outer preset of the same mounted world; 105 AU view, 160 AU manual zoom limit                                                                    | Adopted 100 AU comparison; continuous camera zoom to/from Earth–Sun                                           |
| `solar-neighborhood`                     | HYG v4.1 subset: 62 entries within 5 pc, catalog color/absolute magnitude display, hover/all labels                                              | 8 pc and 20,000 AU world-fixed bars; one standalone bridge to Solar System                                    |
| `galactic-center-neighborhood`           | Galactic bulge at model x=1 kpc; 6,476 deterministic modeled stars, same volume and camera                                                       | Same bars and display rules; lateral comparison without bridge                                                |
| `milky-way`                              | Sourced representative disk and Sun distance; deterministic schematic arms and bulge/bar; oblique camera                                         | 30 kpc and ~490 pc horizontal bars in the foreground disk plane; one standalone bridge from the neighborhoods |
| `local-group`                            | 75 catalog entries/candidates (McConnachie 2012), 72 sourced-size model envelopes; selection, close view and per-object caveats                  | 3 Mpc comparison and 30 kpc direct transfer to/from Milky Way                                                 |
| `virgo`                                  | 5,647 catalog galaxies; all 278 SBF targets and 1,589 EVCC rows; measured and optional statistical depths                                        | 16.5 Mpc reference and exact 3 Mpc direct transfer to/from Local Group                                        |
| `bao`                                    | 500k AbacusSummit halos, movable 128³ matter slab, r²ξ(r) reveal and statistical separation guide                                                | Vertical 147 Mpc and 16.5 Mpc rulers; direct 16.5 Mpc transfer to/from Virgo                                  |
| `cosmic-web`                             | Fixed central AbacusSummit slab; 512³ default / 256³ lighter source, retaining only 3 MiB / 384 KiB byte windows                                 | Button-triggered same-coordinate camera/crossfade transition to/from the central BAO cube                     |
| `observable-universe`                    | 14 Gpc observer-centered comoving radius; finite LSS–particle-horizon shell, asset-based temperature/E colors and Q/U polarization, radial ruler | Exact 3 Gpc direct bar transfer to/from Cosmic Web; radial ruler remains the scene reference                  |

The BAO and Cosmic Web scenes are implemented from the supplied AbacusSummit export. Observable Universe has its finite shell, coordinate interaction, precomputed joint T/E HEALPix temperature and Q/U polarization layers, and incoming 3 Gpc transfer; detailed matter content in the light-cone sector remains a future increment. Virgo uses the user-supplied EVCC
catalog instead of the NGVS II excerpt. The main hierarchy contains **13** levels;
the Galactic-center neighborhood remains the same-scale sibling of level **7 / 13**.
Keep the stable ID `earth-moon` despite the display-name change.

## Decisions to preserve

- Independent physical coordinate worlds, SI data and a reference length distinct from viewport extent. The user-authorized Earth–Sun / Solar System pair shares a continuous world at AU/10 meters per scene unit. In-scene zoom never navigates.
- Dark shared scene/bridge background, burgundy accent, slight corner rounding, fixed bottom navigation, compact logarithmic axis with ticks and hover/focus names.
- All hierarchy and bridge actions are explicit and manual. Previous always means smaller; Next always means larger, including when entering a bridge backward.
- Ratios up to 200 bypass standalone bridges. Larger intervals use geometrically spaced comparisons with balanced ratios rather than round-number milestones. Human–Earth has two standalone comparisons (1.7 m → ~333 m → ~65.1 km); the final comparison occurs inside Earth.
- Center-align comparison bars, omit end caps, and keep ratios unobtrusive. In scenes use real physical lengths and depth testing; bars and labels behind objects must be occluded.
- Except for the continuous solar camera animation (1000 ms), every animation is sequential: remove departing bars → resize the shared bar → reveal new bars. Internal bridge timing is 180 + 720 + 180 ms. A scene transfer resizes for 1000 ms, then reveals the destination over 180 ms. Wait for actual target projection after loading. Repeated scale actions are locked during transitions; reduced motion skips visual waits, not navigation steps.
- “スケールバーを非表示” / “Hide scale bars” is unchecked initially and local to a scene. Hide physical bars and their labels, not the HUD or logarithmic axis. Restore only a shared bar before a hidden-state departure; do not inherit hidden state in the destination.
- Show m, pc, AU, ly conversions except primary duplication. No extra prefixed-meter conversion rows. Main and secondary values share a font family; scientific notation uses superscripts rather than visual E notation.
- Preserve bilingual copy, source/asset credits, camera memory and exact reset, responsive layout, and reduced-motion behavior.

## Extending a scene

1. Read `scenes.md`, `scientific-guidelines.md`, and `scales-and-bridges.md`; verify the new scene's scientific values and record sources. Registry values for unimplemented scenes remain provisional.
2. Add data, coordinate/model transforms, and rendering separately. Reuse `SceneHost`, shared controls, readout and translation keys.
3. Use `SceneReferenceBar` for physical bars. Its `reference`/`comparison` identity selects the hidden SVG endpoint carrier, while its GPU geometry determines visible depth. Its length comes from the supplied metadata; a comparison bar must use the actual connecting SI length.
4. Extend the explicit transfer selection in `App`, scene overlay inclusion, and any incoming `entryBarKind` visibility. Keep all new bars hidden until the transfer finishes via `BarVisibilityContext`. This wiring currently covers the implemented scenes through both stellar neighborhoods; it is a deliberate extension point, not a universal transfer engine.
5. Add new scene selectors to the mobile flow layout if needed. `fitToViewport` is available for fitting a perspective default camera to the horizontal viewport extent; Earth and Moon is an example.
6. Test physical dimensions and graph changes. Browser-check both directions, a hidden-bar departure, midpoint animation visibility, orbit/reset, direct axis/URL entry, narrow screens, and reduced motion. Run `npm run check` and `npm run build`.
7. Update these status notes and the relevant specifications with the final implementation.

## Assets and verification

The committed `public/models/hachiko/hachiko.glb` embeds its geometry and texture; its source/license are alongside it. The Earth JPEG is also committed with NASA attribution. Builds have no dependency on source downloads in `tmp/`; the redundant originals were removed. `scripts/prepare-hachiko.py` remains available if the documented input is obtained again.

At this handoff, the automated suite has 99 passing tests, including stellar coordinate integrity, density sampling, photometry ordering and single-frame bridge reversal. Solar additions cover nominal radius, common normalization, independent JPL J2000 approximate-position fixtures, lunar composition and curve anchors, seasonal distance changes and date limits. Browser smoke checks covered scene and bridge sequencing, non-inherited bar visibility, mobile/portrait layout, reduced motion, physical occlusion, and camera reset. The temporary browser harness is not part of the repository. The production build succeeds with the existing shared Three.js chunk-size warning. No deployment or remote push is part of this handoff.

## Solar-world continuation notes

Sun keeps its IAU nominal diameter and local CC BY 4.0 shader texture. Earth–Sun and Solar System share one renderer and one mounted Canvas at AU/10 meters per unit. Their standard short-side extents are 3 AU and 105 AU; 100 AU is an adopted comparison length, not a Solar System boundary. Wheel zoom targets the cursor, is capped at a 160 AU short-side extent, and never exits the shared solar world. Explicit Next/Previous continuously zooms between presets. Sun → Earth–Sun resets to the inner preset. Reduced motion skips playback, and navigation/controls are locked during animation.

All eight planets plus Earth's Moon have real mean spherical radii and local texture maps. Saturn has three physical major-ring annuli with illustrative opacity/color. No other satellites, small-body populations or Oort Cloud are included. Annotation glyph circles were removed: leaders alone connect names to actual positions. Inner-planet names fade away by the 100 AU extent. Jupiter and outer-planet names remain opaque through 120 AU, then fade gradually toward 320 AU (remaining readable at the 160 AU zoom limit); the Sun name follows the Mars-orbit fade at 14–32 AU while its body/glow and the 1 AU ruler persist; the permanently placed 100 AU ruler enters the viewport naturally. The old focus button was removed. Primary rulers remain fixed in 3D and override their opacity fades when needed for departure transfers. Close inspection reveals screen-following solar and then Earth diameter rulers, with translated descriptions. Inner orbit lines progressively fade on zoom-out. Navigation uses visible world rulers: a wholly visible solar-diameter bar enables direct Sun return; a visible 100 AU segment triggers a quick outer framing and pause followed automatically by the next bridge. Other non-preset views recover to the nearer solar preset. The distant Sun has an explicitly illustrative fixed-footprint display PSF. Dragging pivots at the local body depth; camera depth bounds retain foreground outer orbits at low elevations.

Astronomy Engine 2.1.19 remains a local dependency; UTC selection covers 1900–2100 and persists across navigation. Position, pole, radius, texture and ring provenance is recorded in `src/data/sources.ts` and the local asset READMEs. Map longitudes, illumination, solar surface motion and ring opacity are illustrative. The Moon's curve is geocentric at Earth's selected-date position. No runtime external API is used.

Automated checks cover common units, eight planets plus Moon, physical ring intervals, independent JPL inner-planet fixtures, all orbit midpoint anchors, polar-vector normalization, UTC limits, seasonal distances, continuous-edge isolation, logarithmic interpolation symmetry, bounds and opacity thresholds. Browser QA verifies retained Canvas identity through forward/reverse playback, cursor anchoring, no wheel navigation, 160 AU clamp, Sun entry reset, faded departure-bar restoration, mobile 320/390 px, reduced motion, and Saturn/Jupiter/Neptune close-ups. The production build retains the known shared Three.js chunk warning. JPL Horizons precision comparison was unavailable (HTTP 503); the independent JPL fixture is a lower-accuracy regression comparison, not a precision claim.

## Stellar-neighborhood verification

Implemented the two requested stellar scenes; display naming is Galactic bulge / 銀河系バルジ内 to distinguish the chosen x=1 kpc location from Sagittarius A*. See `scenes.md` §7 for all source, sampling, incomplete-catalog, photometry and bar conventions. Browser checks cover default and all labels, hover, sibling camera preservation, forward/reverse bridges, mobile, and reduced motion. Catalog binaries can overlap physically; labels separate without changing their positions. There are no new dependencies, large catalogs or live data calls.

## OpenSpace volume prototype

Milky Way now has a HUD selector for the original simple model and an OpenSpace/NAOJ volume alternative. The volume is now the default, and switching retains the Canvas, camera, 30 kpc rulers and bridge. The served volume is 256×256×32 RGBA8 (8 MiB); the user-supplied 512 MiB original was a temporary preprocessing input and is no longer retained under `tmp/`. Preprocessing decodes square-root encoding before averaging. Runtime squares RGBA samples, applies simplified emission/absorption ray marching, and releases the texture on switch/unmount. Points/halo are unused. Data hash, sources, MIT notice and reproduction instructions live in `public/models/milky-way/`.

Validation adds two volume metadata/physical-transform tests (93 app tests total) and four standalone Python/NumPy preprocessing/integrity tests. Browser QA confirms same-camera switching, three dispose/reload cycles (GPU texture count 2→3→2), mobile widths 320/390 px, hidden-bar bridge return, load failure fallback, reduced motion and outgoing navigation. The production build succeeds with the unchanged shared Three.js chunk warning. Apple M2 / Chrome (ANGLE Metal) measured median ~16.7 ms frames for both variants at the default view and for volume edge-on/close views; desktop-emulated 320/390 px viewports also remained ~16.7 ms. These are VSync-limited frame timings, not GPU timings or real-mobile measurements. See `scenes.md` §8 for remaining prototype limitations.

### Volume default and return/stability revision

OpenSpace is now the default on direct entry and bridge return; simple remains selectable. Previous first recovers the default camera framing when needed, then restores/removes bars and transfers the ~490 pc comparison into the single bridge. Bridge Previous continues via 8 pc to the Solar neighborhood. Arrival waits for volume load/error before scene reveal. Camera gestures are disabled throughout departure.

The ray shader uses current render-time matrices, half-voxel samples on a fixed galaxy-centered lattice, and analytic within-cell emission/absorption. This removes full-ray sample redistribution as counts change. Tests: 95 application tests plus the existing four preprocessing tests. Browser checks include current-frame matrix agreement (zero difference), extreme view/hidden-bar returns, both bridge directions, simple selection and reduced-motion mobile. Revised M2/Chrome timings: ~60 fps default, ~30 fps zoomed edge-on; the earlier 60 fps close-view result applied to coarse sampling.

### Physical bridge entry and annotation follow-up

Fixed the missing bridge animation target on Milky Way Previous: the bridge contains ~490 pc, not the scene's 30 kpc reference. Entry now selects the first/last planned physical length by direction. New component tests verify actual Web Animation keyframes, hidden target, post-expansion comparison reveal and lock release across three reverse edges. Total: 98 app tests. Browser measurements confirm ~9.5 px → ~1,233 px continuous expansion at 1440×1000 and onward navigation to the Solar neighborhood.

Sun and center annotations use stable SVG nodes with per-render-frame projection after current camera matrix updates, replacing 20 Hz React-state updates. During a 66-frame orbit check, the Sun leader's anchor matched its current projection with zero pixel error and retained node identity.

### Distribution metadata and display names

The selector now reads “OpenSpace volume” / “Simple model” (Japanese: “OpenSpace volume” / “簡易モデル”), without prototype/original suffixes. The lightweight volume manifest embeds the exact upstream Name, Author, Description, License and URL. `ATTRIBUTION.json` and the full MIT notice accompany the binary; preprocessing also copies both to alternative output directories. The volume details expose OpenSpace Team and MIT License links. Tests verify embedded provenance and copied notices: 99 app tests, five preprocessing tests.

## Camera controls and display name

All SceneHost scenes use the original fixed world-up OrbitControls rotation and damping. There is no custom drag-start or pointer-move rotation handler. Camera memory, reset, pan, cursor zoom, pinch and scene-specific distance/zoom limits remain in place. The Earth–Sun display title is “地球と太陽” / “Earth and Sun”; its stable ID remains `earth-sun`.

## Light-second ruler and stellar annotations

Earth and Moon includes a yellow, parallel 299,792,458 m vacuum light-second auxiliary ruler at the same world-space height as the main red ruler and slightly behind it in the initial view, with bilingual meaning and a BIPM source link. Its physical length uses the shared SI light-speed constant; hidden-bar and bridge-only states suppress it. Solar-neighborhood annotation anchors now update stable SVG nodes on every rendered frame after camera matrix refresh, replacing 20 Hz React state updates; native camera controls are unchanged.

## Direct solar departure

Next skips outer-preset framing and its pause when the entire 100 AU ruler is visible (including depth clipping, at least 2 px). The current projected ruler transfers directly into the bridge. A partially visible ruler retains the existing framing step.

## Famous-star distance table

Solar neighborhood has a right-side triangle toggle opening a scrollable table upward. Seventeen selected stars (HYG v4.1 plus documented Betelgeuse/Deneb estimates) show Earth-distance approximations in ly and pc, sorted nearest first. Only Proxima Centauri, Sirius and Procyon overlap the 3D sample. The six added bright stars have approximate distance labels. Bilingual names, catalog/CC BY-SA attribution and the beyond-5-pc distinction are included. It supports keyboard activation and Escape; mobile places the toggle at the lower right of the canvas.

## Local Group implementation

Added the ninth independent physical scene: 75 tagged catalog entries including
candidates, with 72 simple 3D galaxy models and three explicit size-missing
position markers. Geometry uses catalog J2000 directions, heliocentric distances,
projected half-light radii, ellipticities and PA where available. MW reuses its
existing simple model; M31/M33/LMC use sourced disk tilts; SMC and unknown dwarf
depths use disclosed approximations. The sample is a fixed 2012 snapshot, not a
present-day census. See `scenes.md` §9 and the scene README for all conventions.

Bilingual selection, close view, per-object uncertainty/size details, non-overlapping
names and visible marker disclosure accompany the existing controls. The 30 kpc
bar transfers both ways to MW; the 3 Mpc comparison span is independent of viewport.
No other major hierarchy scene is implemented in this change.

Validation: `npm run check` passes (109 tests across 20 files), and `npm run build`
succeeds with the existing shared Three.js chunk warning. Chrome smoke checks
cover seven selected objects (including a missing-size entry), all 72 active
point-material uniforms, orbit/reset, hidden-bar MW return and direct forward
transfer, outgoing Virgo navigation, and Japanese 390/320 px layouts with reduced
motion. No page exceptions were observed. Desktop Chrome at those mobile viewport
sizes measured about 16.7 ms median animation frames over 45 frames; this is a
VSync-limited desktop measurement, not a real-mobile/GPU benchmark.

### Local Group framing and interaction refinement

Initial/reset view tightens from 3.6 to 2.4 Mpc. Reference/comparison rulers move
to Y=−0.65/−0.75 Mpc; these values and the 100/40 px desktop/mobile annotation
gaps are centralized in `localGroupData.ts`. Default names use both screen sides,
measured text widths, longer bent leaders and collision fallback.

Drag-start pivot depth now follows the nearest resolved on-screen galaxy using
the solar world's projection-preserving helpers, with full-world depth fitting.
MW and Local Group departures preserve the current camera when the connecting
bar is wholly in the view volume and at least 0.5 px long, even if hidden. Only
clipped or edge-on bars trigger recovery; transitions without a carrier do not.

Refinement validation: 113 tests in 21 files and the production build pass (the
existing shared chunk warning remains). Chrome checks verify no projection jump
on drag-start depth correction, a centered M31 through rotation, unchanged zoom
on both non-default-view direct transfers (including hidden bars), and recovery
when the carrier is clipped. Existing solar full/partial ruler exits also pass.
Desktop and 390/320 px layouts retain all five default names; annotation placement
reserves the ruler-number areas. No page exceptions were observed.

## Galaxy hover and stellar controls

Local Group now identifies hovered center markers and resolved point-cloud samples,
including samples away from the center. Hover annotations have placement priority
and clear on leave, drag and zoom without changing selection. Solar-neighborhood
name controls move into the lower-left information box; both sibling navigation
buttons sit directly below their title cards. The distance table maps exactly
Proxima Centauri, Sirius and Procyon to the existing catalog IDs and previews their
annotations on hover or keyboard focus. Leave, Escape, closing and disabling the
table clear only the transient preview, preserving explicit selection.

Validation: 114 tests and the production build pass with the existing shared
chunk warning. Chrome verifies off-center galaxy-cloud hover/leave, all three
table previews and cleanup, retained star selection, both sibling directions,
and desktop plus 390/320 px layouts without page exceptions.

### Distance-table annotation emphasis

The table's transient star preview now uses warm highlighted, bold text with a
soft glow and a brighter/thicker leader. This also works with all names enabled;
leaving the name clears the emphasis while keeping the existing names/selection.
Keyboard focus uses the same treatment. The effect is static, including under
reduced motion, and leaves physical anchors and label layout unchanged.

## Virgo environment

Current union: 5,647 galaxies, with all 278 SBF measurements and all 1,589 supplied
EVCC entries. NGVS II's 60-row excerpt is removed. Supplied M_g is interpreted
literally as absolute g magnitude and overrides B photometry on matches.

Default statistical display assigns only unknown depths: 759 Virgo members use
angularly weighted SBF q1/q2 main-cluster depths (12–23 Mpc, 0.25 Mpc smoothing);
735 other missing-distance objects use independent neighbors and adopted group
priors. A checkbox collapses these 1,494 galaxies to their representatives.
Independent distances, remaining flow estimates, sky directions, photometry and
camera are preserved. Draws use fixed galaxy seeds and sorted donors. The UI
explicitly distinguishes synthetic assignments from measurements.

See the [Virgo README](../src/scenes/virgo/README.md) for complete source hashes,
CSV reproduction, membership handling, matching and statistical conventions.
EVCC M and P remain distinct (1,028 members / 561 possible); P is not a confirmed
non-member class. Two CSV entries share NGC4257 but have different VCC IDs and
coordinates; both are retained. Empty aliases never match; all 74 external Local
Group entries survive independently.

The source-color checkbox and M31 annotation remain. Missing photometry uses
1.5 px, the observer origin 7 px. The exact 3 Mpc Local Group bridge is unchanged,
as are the 16.5 Mpc reference and 44 Mpc initial viewport. Data loads lazily; no
runtime API or new application dependency.

Validation: 121 unit tests, formatting/lint/typecheck and production build pass.
Browser QA verifies 5,647 GPU points, exactly 1,494 radial changes, fixed positions
for every other galaxy, unchanged sizes/camera, exact statistical restoration,
source-color independence, M31 annotation, hidden-bar Local Group return, and
320/390 px Japanese reduced-motion layouts. Desktop legends scroll inside the
available HUD row so actions cannot move under the navigation dock. Projected
labels avoid overlay panels. No scene/shader errors (existing favicon 404 excluded).
The lazy catalog chunk is approximately 287 kB gzip / 2.60 MB minified and retains
the expected large-chunk build warning. The supplied CSV matches its bundled copy
byte-for-byte and its recorded hash.

## Cosmic Web fixed slab

The twelfth scene uses the supplied full-box AbacusSummit density field without
mounting a full volume. Default High reads a byte-identical 3 MiB pre-extracted central slab from the 512³
source; lighter Standard reads a 384 KiB range from the 256³ source. Both produce the same
46.875 Mpc/h centered physical thickness. The full box, fixed slab, and persistent
500 Mpc/h BAO-cube outline derive their geometry and encoding from the runtime
manifest. Source hashes match that manifest.

Ordinary BAO use requests no full-box data. Its explicit Next action mounts and
waits for the standard slab, then runs a 1.6 s same-coordinate camera pullback and
crossfade. Previous performs the inverse and releases the slab GPU texture after
return. Manual camera controls never trigger navigation. Standard uses a 393,216-byte HTTP range; High now fetches the complete
3,145,728-byte prepared asset, allowing ordinary GitHub/Pages distribution.
The original 128 MiB source is preserved locally, outside deployment. Formatting, lint, type checking, all 132 tests in 24 files, and the
production build pass; only the existing large-chunk warning remains.

## Observable Universe matter / tracer wedge

The supplied `tmp/observable_universe_wedge/` asset replaces the earlier
nearby-boost variant. Rendering parameters are preserved.
Metadata-driven loading retains raw source coordinates and radial ticks, with
one common SI scale / CMB basis transform. Matter and galaxies use separate
Gaussian GPU point layers and default-on bilingual toggles. A dark central plane and a translucent sector
improve contrast from both sides; their shared display thickness is compressed to 25%; CMB geometry, mode controls, camera and navigation are unchanged.
See the scene README for model provenance, display conventions and debug option.
