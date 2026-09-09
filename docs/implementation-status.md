# Implementation status and continuation

This is the handoff after completing the common framework and the first three scenes. The focused design documents describe the current decisions; `archive/initial-project-spec.md` is historical and must not override them.

## Implemented and next

| Scene                                            | Status                                                                                                | Connecting bars                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `human` — 人間 / Human                           | Locally hosted, attributed Hachikō scan; adopted full height 1.7 m including base                     | 1.7 m physical bar beside the statue                                             |
| `earth` — 地球 / Earth                           | Spherical Earth, mean diameter 12,742 km; local NASA monthly texture                                  | Diameter bar beside Earth over the Pacific; ~65.1 km comparison bar alongside it |
| `earth-moon` — 地球と月 / Earth and Moon         | Both diameters and adopted mean center distance to the same scale; Moon is a smooth gray sphere       | 384,400 km center-distance bar and the Earth-diameter bar beside Earth           |
| `sun` and larger scales, Galactic-center sibling | Registry, metadata, navigation and shared HUD exist; scientific rendering is still `PlaceholderScene` | Direct physical transfers are not automatically implemented by the registry      |

The next scene to implement is **Sun**. Its predecessor is `earth-moon`. The main hierarchy contains **12** levels; the Galactic-center neighborhood remains the same-scale sibling of level **7 / 12**. Keep the stable ID `earth-moon` despite the display-name change.

## Decisions to preserve

- Independent physical coordinate worlds, SI data, per-scene normalization, and a reference length distinct from viewport extent. In-scene zoom never navigates.
- Dark shared scene/bridge background, burgundy accent, slight corner rounding, fixed bottom navigation, compact logarithmic axis with ticks and hover/focus names.
- All hierarchy and bridge actions are explicit and manual. Previous always means smaller; Next always means larger, including when entering a bridge backward.
- Ratios up to 200 bypass standalone bridges. Larger intervals use geometrically spaced comparisons with balanced ratios rather than round-number milestones. Human–Earth has two standalone comparisons (1.7 m → ~333 m → ~65.1 km); the final comparison occurs inside Earth.
- Center-align comparison bars, omit end caps, and keep ratios unobtrusive. In scenes use real physical lengths and depth testing; bars and labels behind objects must be occluded.
- Every animation is sequential: remove departing bars → resize the shared bar → reveal new bars. Internal bridge timing is 180 + 720 + 180 ms. A scene transfer resizes for 1000 ms, then reveals the destination over 180 ms. Wait for actual target projection after loading. Repeated scale actions are locked during transitions; reduced motion skips visual waits, not navigation steps.
- “スケールバーを非表示” / “Hide scale bars” is unchecked initially and local to a scene. Hide physical bars and their labels, not the HUD or logarithmic axis. Restore only a shared bar before a hidden-state departure; do not inherit hidden state in the destination.
- Show m, pc, AU, ly conversions except primary duplication. No extra prefixed-meter conversion rows. Main and secondary values share a font family; scientific notation uses superscripts rather than visual E notation.
- Preserve bilingual copy, source/asset credits, camera memory and exact reset, responsive layout, and reduced-motion behavior.

## Extending a scene

1. Read `scenes.md`, `scientific-guidelines.md`, and `scales-and-bridges.md`; verify the new scene's scientific values and record sources. Registry values for unimplemented scenes remain provisional.
2. Add data, coordinate/model transforms, and rendering separately. Reuse `SceneHost`, shared controls, readout and translation keys.
3. Use `SceneReferenceBar` for physical bars. Its `reference`/`comparison` identity selects the hidden SVG endpoint carrier, while its GPU geometry determines visible depth. Its length comes from the supplied metadata; a comparison bar must use the actual connecting SI length.
4. Extend the explicit transfer selection in `App`, scene overlay inclusion, and any incoming `entryBarKind` visibility. Keep all new bars hidden until the transfer finishes via `BarVisibilityContext`. This wiring currently covers only the three implemented scenes; it is a deliberate extension point, not a universal transfer engine.
5. Add new scene selectors to the mobile flow layout if needed. `fitToViewport` is available for fitting a perspective default camera to the horizontal viewport extent; Earth and Moon is an example.
6. Test physical dimensions and graph changes. Browser-check both directions, a hidden-bar departure, midpoint animation visibility, orbit/reset, direct axis/URL entry, narrow screens, and reduced motion. Run `npm run check` and `npm run build`.
7. Update these status notes and the relevant specifications with the final implementation.

## Assets and verification

The committed `public/models/hachiko/hachiko.glb` embeds its geometry and texture; its source/license are alongside it. The Earth JPEG is also committed with NASA attribution. Builds have no dependency on source downloads in `tmp/`; the redundant originals were removed. `scripts/prepare-hachiko.py` remains available if the documented input is obtained again.

At handoff, the automated suite has 46 passing tests. Browser smoke checks covered scene and bridge sequencing, non-inherited bar visibility, mobile/portrait layout, reduced motion, physical occlusion, and camera reset. The temporary browser harness is not part of the repository. The production build succeeds with the existing shared Three.js chunk-size warning. No deployment or remote push is part of this handoff.
