# Implementation status and continuation

This is the handoff after completing the common framework and the first seven hierarchy levels and the Galactic bulge sibling (with a shared continuous Solar System world). The focused design documents describe the current decisions; `archive/initial-project-spec.md` is historical and must not override them.

## Implemented and next

| Scene                                    | Status                                                                                                  | Connecting bars                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `human` — 人間 / Human                   | Locally hosted, attributed Hachikō scan; adopted full height 1.7 m including base                       | 1.7 m physical bar beside the statue                                             |
| `earth` — 地球 / Earth                   | Spherical Earth, mean diameter 12,742 km; local NASA monthly texture                                    | Diameter bar beside Earth over the Pacific; ~65.1 km comparison bar alongside it |
| `earth-moon` — 地球と月 / Earth and Moon | Both diameters and adopted mean center distance to the same scale; Moon is a smooth gray sphere         | 384,400 km center-distance bar and the Earth-diameter bar beside Earth           |
| `sun` — 太陽 / Sun                       | Nominal IAU photospheric sphere, local Solar System Scope texture, subtle unlit animated shader         | Solar diameter and mean Earth–Moon distance; direct transfers both directions    |
| `earth-sun` — 地球–太陽系 / Earth–Sun    | Inner preset of the shared world; eight planets and Moon, dated positions and textured physical spheres | 1 AU persists; solar diameter fades; 100 AU appears on zoom-out                  |
| `solar-system` — 太陽系 / Solar System   | Outer preset of the same mounted world; 105 AU view, 160 AU manual zoom limit                           | Adopted 100 AU comparison; continuous camera zoom to/from Earth–Sun              |
| `solar-neighborhood`                     | HYG v4.1 subset: 62 entries within 5 pc, catalog color/absolute magnitude display, hover/all labels     | 8 pc and 20,000 AU world-fixed bars; one standalone bridge to Solar System       |
| `galactic-center-neighborhood`           | Galactic bulge at model x=1 kpc; 6,476 deterministic modeled stars, same volume and camera              | Same bars and display rules; lateral comparison without bridge                   |
| Larger scales                            | Registry, metadata, navigation and shared HUD exist; scientific rendering is still `PlaceholderScene`   | Direct physical transfers are not automatically implemented by the registry      |

The next scene to implement is **Milky Way**. Its predecessor is `solar-neighborhood`. The main hierarchy contains **12** levels; the Galactic-center neighborhood remains the same-scale sibling of level **7 / 12**. Keep the stable ID `earth-moon` despite the display-name change.

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

At this handoff, the automated suite has 87 passing tests, including stellar coordinate integrity, density sampling, photometry ordering and single-frame bridge reversal. Solar additions cover nominal radius, common normalization, independent JPL J2000 approximate-position fixtures, lunar composition and curve anchors, seasonal distance changes and date limits. Browser smoke checks covered scene and bridge sequencing, non-inherited bar visibility, mobile/portrait layout, reduced motion, physical occlusion, and camera reset. The temporary browser harness is not part of the repository. The production build succeeds with the existing shared Three.js chunk-size warning. No deployment or remote push is part of this handoff.

## Solar-world continuation notes

Sun keeps its IAU nominal diameter and local CC BY 4.0 shader texture. Earth–Sun and Solar System share one renderer and one mounted Canvas at AU/10 meters per unit. Their standard short-side extents are 3 AU and 105 AU; 100 AU is an adopted comparison length, not a Solar System boundary. Wheel zoom targets the cursor, is capped at a 160 AU short-side extent, and never exits the shared solar world. Explicit Next/Previous continuously zooms between presets. Sun → Earth–Sun resets to the inner preset. Reduced motion skips playback, and navigation/controls are locked during animation.

All eight planets plus Earth's Moon have real mean spherical radii and local texture maps. Saturn has three physical major-ring annuli with illustrative opacity/color. No other satellites, small-body populations or Oort Cloud are included. Annotation glyph circles were removed: leaders alone connect names to actual positions. Inner-planet names fade away by the 100 AU extent. Jupiter and outer-planet names remain opaque through 120 AU, then fade gradually toward 320 AU (remaining readable at the 160 AU zoom limit); the Sun name follows the Mars-orbit fade at 14–32 AU while its body/glow and the 1 AU ruler persist; the permanently placed 100 AU ruler enters the viewport naturally. The old focus button was removed. Primary rulers remain fixed in 3D and override their opacity fades when needed for departure transfers. Close inspection reveals screen-following solar and then Earth diameter rulers, with translated descriptions. Inner orbit lines progressively fade on zoom-out. Navigation uses visible world rulers: a wholly visible solar-diameter bar enables direct Sun return; a visible 100 AU segment triggers a quick outer framing and pause followed automatically by the next bridge. Other non-preset views recover to the nearer solar preset. The distant Sun has an explicitly illustrative fixed-footprint display PSF. Dragging pivots at the local body depth; camera depth bounds retain foreground outer orbits at low elevations.

Astronomy Engine 2.1.19 remains a local dependency; UTC selection covers 1900–2100 and persists across navigation. Position, pole, radius, texture and ring provenance is recorded in `src/data/sources.ts` and the local asset READMEs. Map longitudes, illumination, solar surface motion and ring opacity are illustrative. The Moon's curve is geocentric at Earth's selected-date position. No runtime external API is used.

Automated checks cover common units, eight planets plus Moon, physical ring intervals, independent JPL inner-planet fixtures, all orbit midpoint anchors, polar-vector normalization, UTC limits, seasonal distances, continuous-edge isolation, logarithmic interpolation symmetry, bounds and opacity thresholds. Browser QA verifies retained Canvas identity through forward/reverse playback, cursor anchoring, no wheel navigation, 160 AU clamp, Sun entry reset, faded departure-bar restoration, mobile 320/390 px, reduced motion, and Saturn/Jupiter/Neptune close-ups. The production build retains the known shared Three.js chunk warning. JPL Horizons precision comparison was unavailable (HTTP 503); the independent JPL fixture is a lower-accuracy regression comparison, not a precision claim.

## Stellar-neighborhood verification

Implemented the two requested stellar scenes; display naming is Galactic bulge / 銀河系バルジ内 to distinguish the chosen x=1 kpc location from Sagittarius A*. See `scenes.md` §7 for all source, sampling, incomplete-catalog, photometry and bar conventions. Browser checks cover default and all labels, hover, sibling camera preservation, forward/reverse bridges, mobile, and reduced motion. Catalog binaries can overlap physically; labels separate without changing their positions. There are no new dependencies, large catalogs or live data calls.
