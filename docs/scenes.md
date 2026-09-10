# Scene specifications

Sections 1–9 and the Galactic bulge sibling describe implemented behavior; sections 10–12 describe future scientific scenes currently represented by development placeholders. Establish the exact reference length, viewport, authoritative sources, coordinate frame, and representation mode before implementing each remaining scene.

## 1. Human

Use a representative 1.7 m reference bar in a local Y-up coordinate frame, with 0.17 m per render unit. The requested Hachikō scan by Maurice Svay (CC BY 4.0) is the human-scale object. Its metric calibration is not supplied by the author: normalize the entire imported model, including its base, to an explicitly labeled adopted height of 1.7 m. Preserve proportions, center X/Z, and place the model base at Y=0. Place the reference bar outside the model’s positive-Z bounding edge (the scan’s lateral direction; its head faces approximately −X), with 0.25 m of physical clearance; its base stays at Y=0. Source and license links remain visible in both languages and on mobile.

The supplied official GLB is hosted locally at `public/models/hachiko/hachiko.glb`. Its lighter JPEG variant and lossless uint16 index repacking reduce the asset from the supplied 8.08 MB original to about 2.96 MB, without simplifying the 97,157 triangles. `scripts/prepare-hachiko.py` reproduces the repacking; the original credit is preserved alongside the asset.

## 2. Earth

Render a sphere with the existing mean-diameter convention of 12,742 km (JPL mean radius rounded to 6,371 km), normalized to radius 5 scene units. Preserve an 18,000 km default viewport extent. The local Earth-centered frame uses Y north, +X at 0° latitude/longitude, and −Z at 90°E on the equator. The default camera faces East Asian longitudes from the equatorial plane, keeping the polar-axis bars vertical on screen. Orbit, bounded zoom, pan, and reset use the common host.

Use the locally hosted 2048×1024 NASA Earth Observatory Blue Marble July 2004 composite with baked topographic shading. Credit NASA and label the spherical approximation and composite image in both languages. Lighting is for inspection, not a model of the current Sun; do not add invented terrain, weather, atmosphere, or rotation.

The reference bar sits beside the globe at longitude 150°W, parallel to the polar axis, from Y = −radius to Y = +radius. Its horizontal distance from the axis is 1.15 mean radii; the clearance is an adopted display convention. Both Earth and Human reference bars and labels use GPU depth testing, so the object occludes them when behind it. A ~65.1 km comparison bar sits 0.08 mean radii farther out, parallel and centered at Y=0, retaining its true physical length. A one-second transfer connects this smaller bar to the last standalone bridge bar in both directions; wait for the loaded scene and camera projection on arrival. Direct axis/URL links do not replay the bridge arrival. Earth’s next neighbor is Earth and Moon, with its own diameter-bar transfer. The Earth diameter label is offset 65 screen pixels above the midpoint so it does not overlap the small comparison bar. Reduced motion reveals the scene and bar without animation.

## 3. Earth and Moon

Use the NASA/JPL mean lunar distance (mean semimajor axis) 384,400 km as the reference center-to-center separation, not a current ephemeris. The mean lunar diameter is 3,474.8 km (NASA LADEE press kit); retain Earth's 12,742 km spherical diameter. Normalize the separation to 10 units, with centers at X=−5 and +5 and midpoint origin. Both physical spheres use the same normalization with no size or distance exaggeration. Orientation, placement and illumination are illustrative; the Moon has a uniform gray surface without terrain. Reuse Earth's local NASA texture and credit it.

The main bar parallels the center-to-center line, offset downward by 10% of the separation. A yellow auxiliary bar is centered parallel to it at Y = −10% and Z = −10% of the separation, at the same world-space height as the main bar and slightly behind it in the initial +Z camera view (adopted display placement): exactly 299,792,458 m, the distance light travels in one SI second in vacuum (BIPM defining constant). Its bilingual label identifies this meaning; it follows bar visibility and is not a bridge carrier. The Earth-diameter bar stands parallel to Y beside Earth, centered at Y=0, 1.8 Earth radii from its center. Earth → Earth and Moon transfers the Earth reference bar into this small bar over one second. Returning removes the system and its main distance bar, then enlarges the Earth-diameter bar after 180 ms. Both directions wait for actual camera projection, respect camera memory and reduced motion, and require one explicit navigation action. Direct axis links do not replay the transition.

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

Reference 8 pc (a comparison length, independent of the 10 pc sampled diameter); default star-area extent 12 pc with a 110 CSS-pixel right gutter for ruler labels; 1 pc per render unit. Display the 62 HYG v4.1 entries with catalog distance ≤5 pc, including the Sun. This older, incomplete catalog is not a complete local stellar census. Preserve binary components at their catalog coordinates, including overlaps. The Sun is exactly at the origin (override HYG's tiny plotting offset). Epoch/equinox J2000; source equatorial (x,y,z) becomes scene (x,z,−y), Y toward celestial north, X toward the vernal equinox. Convert input parsecs to canonical SI meters before normalization. No proper-motion propagation. The small committed subset is CC BY-SA 4.0, David Nash / Astronexus, reproduced by `scripts/prepare-nearby-stars.py` from the documented HYG CSV. Source metadata lives in `stellarData.ts`.

Use additive Gaussian core/halo points like the unresolved solar display, with a fixed 24 CSS-pixel footprint at every zoom. They mark positions, not physical stellar diameters. Adopt an approximate B−V display palette, falling back to spectral class and then solar-like neutral color. Compress absolute V magnitudes monotonically for visible brightness; do not claim flux calibration, spectral integration, extinction, or a view from a physical observer. The shader and display mapping are shared by both stellar scenes.

Sun has a persistent annotation. Stable SVG nodes are projected every rendered frame after updating the camera matrices, without throttled React position state. The Sun receives first placement priority so hover/selection of other names does not displace it. Hover/tap identifies all catalog entries within 10 CSS pixels (including close binaries). A checkbox enables every in-view name; screen-space leader endpoints remain at true positions while label placement avoids collisions. An accessible select offers all catalog names independently of pointer precision. The all-names checkbox and selector sit inside the lower-left information box. Sibling navigation sits immediately below the upper-left title card. In the distance table, hovering or keyboard-focusing Proxima Centauri, Sirius or Procyon temporarily adds that model annotation without replacing the selected star; leaving, closing or disabling the table clears the preview. Names outside the viewport are not pinned to invented positions. Default camera faces +Z toward the Sun; common controls support rotation, pan, zoom and reset.

Two physical Y-parallel rulers lie beside the sampled sphere in the XY plane, centered on Y=0: the 8 pc reference at X=5.2 pc and the 20,000 AU comparison at X=5.6 pc. Their orientation is derived from the default camera’s screen-up basis, perpendicular to its viewing direction, and then fixed in world coordinates. Interactive orbiting never rotates the rulers to face the camera. Both numeric labels sit to the right of their rulers, away from the star sample in the default view. The host fits the star area and reserves a right gutter at startup/reset, so labels fit on mobile; both siblings share this framing. The smaller length is a user-adopted exact 20,000 AU comparison (1:200 from 100 AU). Solar System ↔ neighborhood now has only one standalone comparison (100 AU → 20,000 AU). Next transfers that same bar into the neighborhood over 1000 ms and reveals the stars/reference bar; reverse restores the comparison, removes the scene, and enlarges it back into the bridge. Other bridge edges retain their own lengths. Reduced motion skips visual delays. Arrival snapshots are consumed after the reveal, so a later lateral return never replays a bridge transfer.

### Galactic bulge sibling

Keep the stable `galactic-center-neighborhood` ID, but display “銀河系バルジ内 / Inside the Galactic bulge”; the lateral button names its destination. This is an independent same-scale scene, not a main hierarchy level or a physical continuation of the local star map. Preserve camera memory, projection, zoom, viewport, sampled radius, shader, photometric display convention, and both 3D rulers.

Adopt (x,y,z)=(1,0,0) kpc in the analytic model axes of Balbi, Hami & Kovačević (2020), §3.2, equations 2–5, DOI 10.3390/life10080132. The bulge-plus-disk number density is ~12.4 stars/pc³; approximate it as constant over the 5 pc radius sample. Render round(density × volume)=6,476 stars using fixed-seed uniform-volume sampling (cube-root radius), one point per modeled star without thinning. Random positions are not observed stars. Reuse nearby-catalog colors/magnitudes as explicitly disclosed display templates, not as a measured bulge luminosity function. The older local catalog's raw count must not be presented as a measured density ratio. This volume is not a physical star cluster boundary.

This location is distinct from the nuclear star cluster at Sagittarius A*. A third sibling centered on Sagittarius A* is feasible but remains unimplemented: it needs a separately sourced nuclear-cluster density profile, explicit sampling weights and treatment of unknown line-of-sight coordinates; the black hole itself would be a labeled subpixel position at this scale. Do not reuse this bulge density as the nuclear density.

## 8. Milky Way

Implemented as an independent orthographic Galactic model: origin at Galactic center, X toward the Sun, Y toward Galactic north, disk in XZ; 1 kpc per render unit. Adopt a 30 kpc stellar disk diameter, 0.3 kpc full thin-disk thickness and 3 kpc central bar half-length, rounded from ESA’s Guide to our galaxy. These are representative extents, not unique boundaries or scale heights. The Sun uses GRAVITY (2019) R0 = 8,178 pc (±13 statistical, ±22 systematic pc), with solar height approximated as zero.

The default camera is (0,32,40) looking at the origin, about 39° above the plane, with a 40 kpc short-side viewport extent. X-parallel rulers sit in the Galactic plane: 30 kpc at Z=17 kpc and the ~490 pc comparison at Z=19 kpc, both centered on X=0. Thus both are horizontal and below the disk at reset, fixed in world space through orbiting. Physical ruler lengths and disk thickness are not exaggerated. The prior 8 pc → 30 kpc interval has one standalone bridge, 8 pc → sqrt(8 pc × 30 kpc); the second comparison happens within the galaxy. Both directions use the existing sequential transfer, hidden-bar restoration and reduced-motion behavior, including entry from the bulge sibling. Local Group remains a placeholder.

A deterministic 18,000 disk samples and 6,000 bulge samples paint a schematic morphology, not a star census or calibrated density proxy. Four logarithmic arms (14° pitch), their phase/spread, central bar orientation (25°), bulge minor/vertical semiaxes (1.2/0.9 kpc), radial profiles, colors and brightness are illustrative display conventions. The source-backed center/Sun annotations anchor to their positions; bilingual summary and details distinguish these from the modeled arms. The full disk thickness is 0.3 kpc, with no vertical exaggeration; screen-sized light footprints can broaden its apparent edge. No halo, gas, dust, warp or named arm catalog is claimed. Point footprints adapt to viewport width to reduce mobile saturation, without thinning the samples. Labels fit within the viewport and use short translations on mobile. Source metadata is centralized in `sources.ts`; data, SI normalization/model and rendering are separate modules.

QA covers deterministic samples, disk dimensions, adopted Sun distance, ruler length/plane/default projection and the single bridge. Browser checks cover desktop, 390/320 px, exact camera reset, both transition directions, hidden departure, reduced motion and runtime errors.

### OpenSpace volume alternative (prototype)

The OpenSpace volume renderer is the default; the simple renderer remains selectable. “Galaxy display model” in the HUD switches only the galaxy renderer to a lazily loaded `Data3DTexture`/ray-marching variant. The same Canvas, camera snapshot, annotations, physical rulers and bridge routing remain mounted. Selection is local to the scene visit; navigating away restores the volume default on return. A loading or failed request keeps the simple model visible with a translated status and retry instructions. Switching back aborts the request and disposes the GPU texture; no 512 MiB file, OFF points or halo PNG is requested by the browser.

The committed asset is 256×256×32 RGBA8, exactly 8 MiB (1/64 of the original). `scripts/prepare-milky-way-volume.py` processes 4×4×4 blocks as byte normalization → square → mean → sqrt → rounded byte, independently for all four channels. Tests cover decoded averaging including alpha, voxel order, constant blocks and the committed hash. See `public/models/milky-way/README.md`, manifest and MIT notice for provenance, reproducibility, rendering limits and coordinate details.

Keep OpenSpace’s physical support 1.2e21×1.2e21×0.15e21 m (about 38.9×38.9×4.86 kpc), distinct from the unchanged 30 kpc reference. Apply OpenSpace Rx(pi) Ry(3.1248) Rz(4.45741), then Galactic-to-scene (-gX,gZ,gY), preserving handedness and its slight tilt. Do not recenter on an image brightness peak. The existing Sun annotation is a comparison position, not an identified simulation particle. The shader decodes samples by squaring, uses dust-tinted absorption and emission, and retains the OpenSpace radial mask. Adopt step 0.5/256 (half a voxel) in units of physical box width, absorption 200 and emission 250, bounded to 768 steps. Exponential display mapping, full Canvas resolution and no distance fading are prototype differences from OpenSpace, not a claim of identical output. Transparent ruler/volume intersection is approximate; the box does not write opaque depth.

The downsampled model is softer than the procedural points. Thin dust features are lost at 32 layers, and close/edge-on views can show blur or bands. Runtime memory adds about 8 MiB CPU plus 8 MiB GPU, excluding browser download caches. Shader parameters and all dimensions are centralized outside components. Both desktop/mobile layouts, unchanged camera at switch, repeated disposal, failed-fetch fallback, scene transfers and reduced motion are browser-checked. Mobile viewport checks use desktop Chrome, not a mobile GPU benchmark.

Before Milky Way → Previous, restore the default framing over 650 ms if the view has changed, keeping the galaxy visible during the camera movement. This recovers an offscreen/edge-on ~490 pc ruler before restoring hidden bars and removing other scene content. Then use the existing 1000 ms ruler transfer to the single bridge; Previous there transfers the 8 pc bar to the Solar neighborhood. Camera gestures and repeated navigation are locked during departure. Already-default framing skips the camera animation; reduced motion skips visual delays. On arrival, wait for the selected volume to load (or fail into the simple fallback) before revealing the scene, avoiding a simple→volume flash after the bridge.

For stable camera motion, update the inverse model-view uniform in the mesh's `onBeforeRender` using the renderer-current world/camera matrices. March on a galaxy-centered fixed physical lattice with half-voxel spacing; do not redivide the entire ray when the sample count changes. Clip the two end cells and analytically integrate constant emission/absorption within every cell. At 12 nearby camera inclinations, the new half-voxel renderer's error against a quarter-voxel reference was about 3.7% of the 0.01-step renderer's error (160×160 offscreen test; not a photometric accuracy claim). Apple M2 Chrome: normal view ~60 fps; enlarged edge-on view ~30 fps with the denser sampling. This replaces the earlier coarse-renderer performance measurements. Matrix consistency during an actual mouse orbit, complete backward/forward traversal, hidden bars, extreme pan/zoom, simple selection, 320 px and reduced motion were browser-checked.

Bridge entry explicitly matches the physical endpoint of the standalone comparison list: first length on upward travel, last length on downward travel. In particular, Milky Way Previous expands the ~490 pc scene bar to the ~490 pc bridge main bar; it must never look for the absent 30 kpc reference inside the bridge. The 8 pc bar and labels reveal only after the 1000 ms expansion. Regression tests check the actual animation target, keyframes, reveal and busy-state completion for Milky Way, stellar-neighborhood and Earth reverse entries.

Galactic center/Sun annotations retain fixed SVG nodes and update their physical anchor and text placement every rendered frame, after controls and current camera matrix updates. They do not use the previous 20 Hz React-state update path. Offscreen annotations are hidden in place, so removing the Sun from view never reassigns its node to the center. Browser QA measures exact agreement between the Sun's current projection and the SVG leader during orbit, as well as the visible ~490 pc bar growing into the bridge.

## 9. Local Group

Implemented as an independent orthographic world, normalized at 100 kpc per unit.
The 3 Mpc reference is an adopted comparison span, independent of the 2.4 Mpc
short-side viewport and without claiming a unique group boundary. Origin is the
geometric MW–M31 midpoint, not a mass barycenter; axes match the Milky Way scene.
Astronomy Engine EQJ→Galactic transforms the catalog J2000 directions, adds the
existing 8,178 pc solar offset, and shifts the origin. No orbital propagation.

The fixed McConnachie (2012) CDS tables 1–3 subset contains all 75 G/A/L-tagged
entries, including uncertain candidates; it is explicitly neither a current
complete census nor a volume-complete sample. Distances and asymmetric errors,
PA, ellipticity, half-light radii, flags and original reference numbers are retained.
72 entries have physical model geometry; Canis Major, Bootes III and Andromeda XX
have no catalog radius and use position markers only. See
[the scene's data/model notes](../src/scenes/local-group/README.md) for sources,
reproduction and detailed caveats.

Milky Way reuses its exact simple model. M31 and M33 use representative optical/
stellar extents and sourced PA/inclination; only M31 has a central bulge. LMC uses
a sourced inclined disk approximation, SMC a disclosed spherical envelope.
Dwarfs preserve measured sky ellipticity, PA and semimajor half-light radius with
a Gaussian envelope truncated at 3 half-light radii. Their unknown depth adopts
the projected minor radius; missing PA adopts zero and missing ellipticity a
sphere. Disk near/far tilt sign, thickness, arm pattern, color and sampling are
explicit assumptions. No dark halos, tidal debris, resolved stars or calibrated
brightness are implied. The model does not reconstruct unknown 3D morphology.

All center rings are fixed CSS-pixel markers, never physical diameters. Hovering a center (8 px tolerance) or a rendered point cloud (6 px ray-picking tolerance at the current zoom) temporarily prioritizes its name; pointer leave, drag start and wheel clear the hover. Selected/all-name settings are preserved. Stable
SVG names follow real positions every frame, prioritizing the selection and
suppressing overlaps. A bilingual keyboard-accessible catalog selector provides
per-object measurements/caveats and an explicit close-view button, with no
hierarchy change. Common orbit, pan, cursor zoom, camera memory and Reset remain.
Focus and departure respect reduced motion; mobile uses the common flow layout.
Drag-start pivot depth follows the nearest resolved galaxy to the screen center,
using the same projection-preserving depth helpers as the solar world. Major
labels use longer leaders and prefer the object's left/right screen half.

World-fixed 3 Mpc and 30 kpc X-parallel rulers at Y=−0.65 and −0.75 Mpc use common
bar visibility and projection carriers. MW ↔ Local Group transfers 30 kpc directly
(ratio 100). The current frame is retained when the connecting ruler is wholly
in view (including depth) and at least 0.5 px long; otherwise restore the default
frame first. Hidden bars use the same physical endpoint test.
Arrival waits for scene readiness. Virgo remains a placeholder with explicit
navigation. Unit tests check catalog integrity, independent coordinate fixtures,
solar offset and midpoint, unchanged MW geometry, PA/ellipticity, disk inclination,
deterministic bounded clouds and scale hierarchy.

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
