# Product and interaction

## Teaching goal

Cosmic Scale Explorer builds intuition for physical and astronomical length scales: the size of each hierarchy, its ratio to adjacent hierarchies, its natural units, conversion among meter/AU/light-year/parsec families, and the positions of real objects at a fixed scale.

The experience is deliberately discrete:

> understand one scale as its own world → compare it explicitly with the previous scale → enter the next world

It is not a continuous zoom, cinematic cosmic flight, planetarium, generic space simulator, N-body simulation, photorealism showcase, astronomy-fact dashboard, or a collection of unrelated size analogies.

## Hierarchy

The main vertical sequence is:

1. Human
2. Earth
3. Sun
4. Earth–Sun system
5. Solar System
6. Solar neighborhood
7. Milky Way
8. Local Group
9. Nearby galaxy cluster (Virgo)
10. BAO scale
11. Observable Universe

The Galactic-center neighborhood is a lateral, same-scale sibling of level 6. It is excluded from the main sequence and remains `6 / 11`. Switching between the two neighborhoods has no scale bridge and preserves physical viewport, camera projection/zoom/orientation, point-size and sampling rules, label style, and scale bar as far as possible.

## Three modes

### Scene mode

A scene is an independent interactive 3D world. As scientifically appropriate it supports orbit, pan, bounded zoom, selection/focus, reset, labels, and mouse, trackpad, touch, and keyboard input. A scene chooses perspective or orthographic projection. Zooming or scrolling never changes hierarchy.

### Scale bridge mode

A bridge compares adjacent reference lengths using only exact screen-space bars, numerical labels, conversions, ratio text, concise translated copy, and previous/next controls. It contains no 3D canvas, astronomical/decorative objects, or familiar-object analogies. DOM/SVG/CSS is preferred. Animation may briefly fade, resize, or crossfade discrete frames; it must never resemble travel through a universal space.

Intermediate frames are reversible comparison steps, not named scenes or progress levels. Define each forward transition once and reverse that same sequence for backward travel.

### Shared HUD

Every scene shares a quiet visual language for the title, main reference length, secondary conversions, meaningful current scale, previous-scale reference, hierarchy progress, navigation, language switch, reset, and optional scene-specific controls. Visualized science remains primary.

## Navigation and URLs

Navigation is an explicit graph, not scattered next/previous conditionals. Bridge frames are derived from adjacent main-scene definitions and never registered as scenes. The lateral sibling is a graph edge separate from the main order.

Deep links use `?scene=<id>&lang=ja|en`. A valid scene opens directly without replaying bridges; bridge state need not be linkable initially. Unknown values fall back safely. Static-hosting compatibility is required, so a full router is optional.

Language resolution order is URL → saved preference → browser language → Japanese. Manual changes update both local preference and the URL.

## Camera memory and transitions

Each scene retains its camera state for the current browser session, and Reset restores the canonical view. The neighborhood sibling views synchronize camera state for a direct density comparison.

Main transitions should feel like conceptual rooms: scene fades out → one or more discrete bridge frames → target fades in. Never shrink the old scene into the new one. Reduced-motion preferences remove or minimize animation.

The hierarchy indicator ignores bridge frames and treats the Galactic-center comparison as level 6.
