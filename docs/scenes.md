# Scene specifications

Sections 1–6 below describe implemented behavior; sections 7–12 and the Galactic-center sibling describe future scientific scenes currently represented by development placeholders. Establish the exact reference length, viewport, authoritative sources, coordinate frame, and representation mode before implementing each remaining scene.

## 1. Human

Use a representative 1.7 m reference bar in a local Y-up coordinate frame, with 0.17 m per render unit. The requested Hachikō scan by Maurice Svay (CC BY 4.0) is the human-scale object. Its metric calibration is not supplied by the author: normalize the entire imported model, including its base, to an explicitly labeled adopted height of 1.7 m. Preserve proportions, center X/Z, and place the model base at Y=0. Place the reference bar outside the model’s positive-Z bounding edge (the scan’s lateral direction; its head faces approximately −X), with 0.25 m of physical clearance; its base stays at Y=0. Source and license links remain visible in both languages and on mobile.

The supplied official GLB is hosted locally at `public/models/hachiko/hachiko.glb`. Its lighter JPEG variant and lossless uint16 index repacking reduce the asset from the supplied 8.08 MB original to about 2.96 MB, without simplifying the 97,157 triangles. `scripts/prepare-hachiko.py` reproduces the repacking; the original credit is preserved alongside the asset.

## 2. Earth

Render a sphere with the existing mean-diameter convention of 12,742 km (JPL mean radius rounded to 6,371 km), normalized to radius 5 scene units. Preserve an 18,000 km default viewport extent. The local Earth-centered frame uses Y north, +X at 0° latitude/longitude, and −Z at 90°E on the equator. The default camera looks toward East Asia. Orbit, bounded zoom, pan, and reset use the common host.

Use the locally hosted 2048×1024 NASA Earth Observatory Blue Marble July 2004 composite with baked topographic shading. Credit NASA and label the spherical approximation and composite image in both languages. Lighting is for inspection, not a model of the current Sun; do not add invented terrain, weather, atmosphere, or rotation.

The reference bar sits beside the globe at longitude 150°W, parallel to the polar axis, from Y = −radius to Y = +radius. Its horizontal distance from the axis is 1.15 mean radii; the clearance is an adopted display convention. Both Earth and Human reference bars and labels use GPU depth testing, so the object occludes them when behind it. A ~65.1 km comparison bar sits 0.08 mean radii farther out, parallel and centered at Y=0, retaining its true physical length. A one-second transfer connects this smaller bar to the last standalone bridge bar in both directions; wait for the loaded scene and camera projection on arrival. Direct axis/URL links do not replay the bridge arrival. Earth’s next neighbor is Earth and Moon, with its own diameter-bar transfer. The Earth diameter label is offset 65 screen pixels above the midpoint so it does not overlap the small comparison bar. Reduced motion reveals the scene and bar without animation.

## 3. Earth and Moon

Use the NASA/JPL mean lunar distance (mean semimajor axis) 384,400 km as the reference center-to-center separation, not a current ephemeris. The mean lunar diameter is 3,474.8 km (NASA LADEE press kit); retain Earth's 12,742 km spherical diameter. Normalize the separation to 10 units, with centers at X=−5 and +5 and midpoint origin. Both physical spheres use the same normalization with no size or distance exaggeration. Orientation, placement and illumination are illustrative; the Moon has a uniform gray surface without terrain. Reuse Earth's local NASA texture and credit it.

The main bar parallels the center-to-center line, offset downward by 10% of the separation. The Earth-diameter bar stands parallel to Y beside Earth, centered at Y=0, 1.8 Earth radii from its center. Earth → Earth and Moon transfers the Earth reference bar into this small bar over one second. Returning removes the system and its main distance bar, then enlarges the Earth-diameter bar after 180 ms. Both directions wait for actual camera projection, respect camera memory and reduced motion, and require one explicit navigation action. Direct axis links do not replay the transition.

## 4. Sun

Adopt IAU 2015 B3 nominal photospheric radius 695,700,000 m, diameter 1,391,400,000 m, replacing the provisional 1,392,700,000 m ladder value. Normalize radius to 5 units in a Sun-centered Y-up frame; default viewport extent is 2.1e9 m. The default perspective camera faces +Z toward the origin, with responsive horizontal fitting. The axis orientation is illustrative, not a dated solar pole model.

Use the locally hosted 2048×1024 Solar System Scope texture (CC BY 4.0), rendered with an unlit shader. Low-amplitude deterministic 3D noise evolves brightness only; illustrative limb darkening gives depth. The physical spherical silhouette never changes. Reduced motion freezes shader time. Texture, noise, orientation and limb darkening do not represent observations for the selected date. No corona shell or bloom enlarges the apparent physical boundary.

A diameter bar sits at X=1.15 radii; the Earth–Moon mean-distance comparison bar at X=1.35 radii. Both are Y-parallel and centered on Y=0, with depth-tested GPU labels and physical lengths. Label centering accommodates mobile widths. Earth and Moon ↔ Sun transfers the 384,400 km bar directly; Sun ↔ Earth–Sun transfers the solar-diameter bar. Both use remove → 1000 ms resize → reveal, loaded target projection, camera memory, hidden-bar restoration and reduced motion. Axis/URL entry skips transfers.

## 5. Earth–Sun system and 6. Solar System

These two hierarchy entries are the user-authorized continuous-zoom exception. They share the same mounted Canvas, renderer, ephemeris, objects, axes, and normalization (1 AU = 10 scene units). All other scale scenes remain independent. Manual zoom updates the shared solar scene label, axis selection, reference readout and URL without replacing the Canvas or resetting its camera: Earth–Sun becomes Solar System at 20 AU, and returns at 14 AU. Other scene boundaries remain explicit. Previous/Next between these two entries animates the camera over 1000 ms with a smooth logarithmic zoom and continuous recentering toward the Sun; it does not remove the world, remount models or insert a bar bridge. Reduced motion applies the destination directly. Other navigation is locked during playback. Direct axis/URL access selects a preset without playback. Each preset retains camera memory; Reset restores that preset exactly. Sun → Earth–Sun always starts at the inner preset, even after a previous wide exploration.

Both solar presets look toward the Sun from 45° above the ecliptic plane (adopted camera convention); reset and animated preset arrivals use this same orientation. The Earth–Sun preset uses a fixed 1 AU reference and 2.05 AU short-side viewport extent. The Solar System preset adopts 100 AU as a **comparison length**, not a claimed Solar System boundary, and fits a 105 AU short-side extent. Manual zoom is bounded between a 4,000 km and 160 AU short-side extent. The upper limit gives the complete planetary-orbit view and 100 AU ruler some margin beyond the standard 105 AU view; it is an interaction convention. No Oort Cloud, Kuiper-belt population, asteroid population or planetary satellites other than Earth's Moon are included. Orthographic zoom targets the cursor, enabling close inspection without a “Focus Earth and Moon” button. Panning and camera rotation are retained.

Render the Sun, all eight planets and Moon on the same true physical scale. Mean spherical radii come from JPL (Earth and Moon retain their existing scene conventions); do not enlarge subpixel bodies. The Sun uses the shared unlit shader. Earth reuses NASA Blue Marble, while other planets and Moon use locally hosted Solar System Scope 2k maps (CC BY 4.0), including the Venus atmosphere map. Planet materials use inspection lighting. Surface colors, texture longitude, lighting and solar motion are illustrative, not current observations. Astronomy Engine's rotation-axis model supplies north-pole orientation. Spherical bodies omit flattening and terrain.

Saturn additionally has flat C/B/A ring annuli in its equatorial plane. Adopt Cassini's 1997 press-kit radial intervals, measured from Saturn's center: C 74,510–92,000 km; B 92,000–117,580 km; A 122,170–136,780 km. The gap between B and A remains empty. Colors and opacity are illustrative; no ring thickness, fine ringlets, F/G/E rings or satellite geometry is claimed.

Annotations use names and bent screen-space leader lines anchored to actual body centers; no circular position glyphs. The Sun name and leader follow the Mars-orbit fade (14–32 AU short-side extent); the solar sphere and display PSF remain present. Inner-planet annotations fade as their local orbital scale becomes crowded and fade out by a 100 AU short-side viewport. Jupiter and the outer planets stay opaque through 120 AU and fade toward 320 AU, retaining over 75% opacity at the 160 AU manual zoom limit. The Earth and Moon have opposite vertical leader offsets. Geometry remains present at every zoom, even when labels disappear; annotations return on zoom-in. Orbit lines retain real coordinates and constant screen stroke width. Adopted short-side extent fades (AU) are Mercury 4–10, Venus 6–15, Earth 9–22, Mars 14–32, and Moon 6–20; outer orbits remain visible. On drag start, a resolved on-screen body supplies the depth of the current view-center pivot, preserving the orthographic projection. Camera distance and depth clipping follow the full world bounds so foreground outer orbits remain visible at low elevations.

The 1 AU ruler and number persist when zooming out. Its horizontal label offset follows one quarter of the projected bar length, capped at 65 px, so it approaches the midpoint as the bar shrinks; the label stays 18 px below the bar to avoid the Sun. The solar-diameter comparison fades between 3 and 8 AU. The 100 AU ruler is always present and enters the viewport naturally on zoom-out. These parallel bars are fixed in the ecliptic plane: 1 AU at Z=1.08 AU, the solar diameter at Z=1.16 AU, and 100 AU at Z=32 AU, centered on X=0. Their endpoints retain their exact SI lengths. Bar strokes have flat caps matching DOM transfer endpoints, avoiding a stroke-width increase when a tiny transfer bar becomes a 3D bar. The solar label offset is 28 px on desktop and 6 px for canvases below 400 px high to retain the number within the tighter viewport. Only when a visible planet or Moon resolves to 2–8 pixels in diameter does an additional camera-plane solar-diameter bar fade in near the canvas bottom. A second Earth-diameter bar fades in at 24–64 pixels. Both disappear when no qualifying body is visible. Their labels include translated parenthetical Sun/Earth diameter descriptions. Both solar-diameter labels use Gm; the additional bar never owns a bridge carrier. Bars may clip at close zoom. The 1 AU bar is the reference carrier in Earth–Sun; 100 AU is the reference carrier in Solar System. Auxiliary rulers do not overwrite those carriers. Departure restores the appropriate connecting bar even if its zoom-dependent opacity or the scene's bars were hidden. Solar navigation first checks projected world-fixed ruler segments against the view volume. Previous directly transfers to Sun if the solar-diameter segment is wholly in view, at least 0.5 px long, and its fade opacity exceeds 0.2. Next with at least 2 px of the 100 AU segment in view frames the outer preset in 650 ms, pauses 220 ms, then proceeds automatically to the stellar bridge. When the 100 AU ruler is absent but the entire 1 AU ruler is visible (at least 2 px), Next moves to the outer preset and stops there. Otherwise a non-preset view restores the nearer logarithmic-scale preset (2.05 or 105 AU), including Sun centering and default orientation. Reduced motion skips zoom/pause delays. Preset tolerances are 4% in log extent, 1% of preset extent in center offset and 0.02 rad in orientation. Existing Sun-diameter transfers and the Solar System ↔ stellar-neighborhood bar bridge remain available.

Astronomy Engine 2.1.19 runs locally with no live API. UTC input supports 1900–2100 inclusive, initially the current minute, and persists across scene navigation within a session. Invalid/incomplete input retains the last valid positions with an error. Positions are same-time geometric heliocentric vectors, with no aberration or light-time correction. Transform EQJ to fixed J2000 ecliptic coordinates, then use scene (X,Y,Z) = ecliptic (x,z,−y), converting AU to SI meters before normalization.

Each trajectory samples 257 positions over one adopted sidereal period centered on the selected date; never force a perturbed path closed. Thus outer-planet samples may extend beyond UI date bounds (up to about 82.4 years for Neptune). The Moon's curve samples geocentric positions across 27.32166 days, translated to Earth's selected-date position: it is an Earth-relative guide, not the lunar heliocentric trajectory. The central sample coincides with the displayed body. Mobile uses a minimum 300 px canvas and scrolling explanatory controls.

Validation covers nominal dimensions, common normalization, all nine nonsolar bodies, pole normalization, lunar composition, curve anchors, input dates, seasonal distance, the 160 AU bound, continuous-edge isolation, reversible zoom interpolation, annotation/ruler fades, and Saturn's major-ring intervals. Independent JPL Table 1 J2000 Kepler fixtures check Mercury/Venus/Earth axes and positions within 50,000 km (a regression tolerance, not an accuracy claim; Earth fixture is the Earth–Moon barycenter). A Horizons precision comparison was unavailable (HTTP 503).

## 7. Solar neighborhood

Use documented catalog-derived 3D positions around the Sun where practical, making parsec-scale separations tangible. Named systems (for example Alpha Centauri, Barnard's Star, or Sirius) are selected from a source, not a handwritten decorative list. This scene owns the lateral comparison described below.

### Galactic-center neighborhood sibling

Compare stellar number density at exactly the same scale. Preserve viewport, camera, projection, zoom, orientation, point sizes, sampling, labels, and scale bar. Use no bridge; a short lateral slide/crossfade is acceptable. Apply all density-honesty requirements in the scientific guidelines.

## 8. Milky Way

Show the Sun in relation to disk diameter/thickness, bulge/bar, and Galactic center. Make direct constraints versus modeled spiral structure clear, using styling and explanatory labels rather than presenting illustrative arms as exact.

## 9. Local Group

Show Milky Way, Andromeda, M33, and major satellites/groups on one spatial scale, including the Milky Way–Andromeda separation. Use real relative centers where known; supported visible/stellar extents can be approximately to scale. Small galaxies need explicit markers and labels.

## 10. Virgo environment

Extend from the Local Group to the nearby large-scale environment and Virgo Cluster, optionally including selected groups/galaxies only when they improve spatial understanding. The provisional reference is the 16.5 Mpc Local Group–Virgo distance. Avoid decorative unsourced points; show cluster extent at the same scale where useful.

## 11. BAO scale

Teach a roughly 147 Mpc-class statistical clustering scale, not an object size. A 3D density sample or carefully labeled schematic may show a reference point and BAO-radius sphere, while explaining the two-point-correlation/pair-separation meaning. Never render literal visible shells around every galaxy.

## 12. Observable Universe

Show an observer-centered final cosmic scale under an explicit cosmological distance convention. Potential elements include radial structure, CMB last-scattering surface, observable boundary, or conceptual light-cone information. Separate comoving distance from light-travel time and do not imply a complete matter catalog.

## Scene completion checklist

A completed scene needs:

- adopted reference length and documented viewport extent;
- explicit origin/coordinate frame and defensible object positions;
- honest marker/exaggeration/proxy/model conventions;
- appropriate orbit/pan/zoom and reset;
- bilingual labels/content and unit readout;
- correct previous/next/lateral behavior and incoming/outgoing bridges;
- responsive, accessible interaction and acceptable performance;
- targeted tests and provenance for nontrivial data.

### Solar unresolved-source display

When the physical solar disk falls from 6 to 2 CSS pixels in diameter, an additive Gaussian-core/halo display PSF fades in at the true solar center. Its 24 px footprint stays constant; the physical sphere and physical diameter rulers retain their scale. This is an adopted display-resolution convention, not a calibrated angular, flux, exposure or detector model. The orthographic scene has no unique observing distance. Japanese/English convention text explicitly distinguishes the glow from the physical diameter. PSF context: [ESA ISO handbook, point spread function](https://general-tools.cosmos.esa.int/iso/manuals/HANDBOOK/cam_hb/node33.php).

### Shared scene HUD

Model/scene descriptions and source links use a native details/summary triangle, closed by default; date controls remain available outside it. Beside Hide scale bars, show the true SI-length ratio of the two smallest distinct projected bars currently in the viewport with opacity above 0.15. Deduplicate the world and inspection copies of the solar diameter. Hide the ratio when fewer than two lengths are visible, bars are hidden, or a transition is playing. Partial segments still refer to their full physical length. Previous with a visible 1 AU segment (at least 2 px) returns to Earth–Sun, unless the fully visible solar-diameter bar enables direct Sun return.
