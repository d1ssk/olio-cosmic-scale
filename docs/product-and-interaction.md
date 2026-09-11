# Product and interaction

## Teaching goal

Cosmic Scale Explorer builds intuition for physical and astronomical length scales: the size of each hierarchy, its ratio to adjacent hierarchies, its natural units, conversion among meter/AU/light-year/parsec families, and the positions of real objects at a fixed scale.

The experience is deliberately discrete:

> understand one scale as its own world → compare it explicitly with the previous scale → enter the next world

The user-authorized Earth–Sun / Solar System pair is the sole continuous-zoom exception. Its shared physical world has two explicit camera presets; manual zoom remains inside that world. Other scales retain discrete scenes and scale bridges.

BAO and Cosmic Web remain separate scenes. Only an explicit scale button starts
a temporary same-coordinate zoom/crossfade; ordinary BAO display does not load
the full-box density files, and manual zoom never switches scenes.

## Hierarchy

The main vertical sequence is:

1. Human
2. Earth
3. Earth and Moon
4. Sun
5. Earth–Sun system
6. Solar System
7. Solar neighborhood
8. Milky Way
9. Local Group
10. Nearby galaxy cluster (Virgo)
11. BAO scale
12. Cosmic Web
13. Observable Universe

The Galactic-center neighborhood is a lateral, same-scale sibling of level 7. It is excluded from the main sequence and remains `7 / 13`. Switching between the two neighborhoods has no scale bridge and preserves physical viewport, camera projection/zoom/orientation, point-size and sampling rules, label style, and scale bar as far as possible.

## Scene, bridge, and shared interface

### Scene mode

A scene is an independent interactive 3D world. As scientifically appropriate it supports orbit, pan, bounded zoom, selection/focus, reset, labels, and mouse, trackpad, touch, and keyboard input. A scene chooses perspective or orthographic projection. Zooming never exits a scene world; within the shared solar world only, its Earth–Sun / Solar System label follows the zoom.

### Scale bridge mode

A bridge compares adjacent reference lengths using only exact screen-space bars, numerical labels, conversions, ratio text, concise translated copy, and previous/next controls. It contains no 3D canvas, astronomical/decorative objects, or familiar-object analogies. DOM/SVG/CSS is preferred. Animation may briefly fade, resize, or crossfade discrete frames; it must never resemble travel through a universal space.

Adjacent scenes with a reference-length ratio at or below 1:200 bypass standalone bridges in either direction. Earth ↔ Earth and Moon already connects the shared Earth-diameter bar with a direct animation. Other direct edges remain without bar transfers until their scenes are implemented. Larger ratios use bridges; the final Human–Earth comparison lives inside the Earth scene rather than a third bridge screen.

Intermediate frames are user-controlled comparison steps, not named scenes or progress levels. Previous scale always moves one comparison step toward smaller lengths; Next scale always moves one toward larger lengths, regardless of the entry direction. At bridge endpoints these actions return to the corresponding scene. Keep these controls in a shared bottom dock. Animate only the step requested by the user; never auto-advance. Reduced motion removes animation without skipping steps. The compact top logarithmic reference-length axis has decade ticks and clickable scene dots, with scene names shown on hover or keyboard focus.

### Shared HUD

Every scene shares a quiet visual language for the title, main reference length, secondary conversions, meaningful current scale, previous-scale reference, hierarchy progress, navigation, language switch, reset, and optional scene-specific controls. Visualized science remains primary.

## Navigation and URLs

Navigation is an explicit graph, not scattered next/previous conditionals. Bridge frames are derived from adjacent main-scene definitions and never registered as scenes. The lateral sibling is a graph edge separate from the main order.

Deep links use `?scene=<id>&lang=ja|en`. A valid scene opens directly without replaying bridges; bridge state need not be linkable initially. Unknown values fall back safely. Static-hosting compatibility is required, so a full router is optional.

Language resolution order is URL → saved preference → browser language → Japanese. Manual changes update both local preference and the URL.

## Camera memory and transitions

Each scene retains its camera state for the current browser session, and Reset restores the canonical view. The neighborhood sibling views synchronize camera state for a direct density comparison.

Except for Earth–Sun ↔ Solar System continuous camera zoom, every animated scale action proceeds sequentially: remove bars absent from the destination → resize/reposition the shared bar → reveal new bars and the destination. Never overlap resizing and the appearance of new bars. Standalone comparisons remain manual, one per action. Outside the shared solar pair, never shrink the old scene into the new one. Reduced-motion preferences remove or minimize animation.

The hierarchy indicator ignores bridge frames and treats the Galactic-center comparison as level 7 of 12.

Each scene offers “スケールバーを非表示” / “Hide scale bars”, initially unchecked. It hides physical bars and their labels while retaining the reference readout and navigation axis. This setting is local to the mounted scene and is not inherited on navigation. If a hidden bar must be carried into the next scale, restore only that bar before resizing. Block repeated scale actions during the transition. See [Scales and bridges](scales-and-bridges.md) for timings.
