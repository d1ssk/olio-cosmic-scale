# Scene specifications

Human, Earth, and Earth and Moon below describe implemented behavior; sections 4–12 and the Galactic-center sibling describe future scientific scenes currently represented by development placeholders. Establish the exact reference length, viewport, authoritative sources, coordinate frame, and representation mode before implementing each remaining scene.

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

Show solar diameter at the correct scale. Its previous neighbor is Earth and Moon, not Earth. The current reference ratio to that scene is below 200, so no standalone bridge is planned. Define the direct shared-bar comparison when implementing Sun, following the existing sequential transfer pattern; do not add a decorative nearby Earth or restore an obsolete Earth–Sun bridge. An initially simple visual is acceptable.

## 5. Earth–Sun system

Show 1 AU as real separation with Sun and Earth on one spatial scale. The Sun is true-sized; Earth may be subpixel. A visible Earth marker must be distinct from its physical radius. An orbit guide is allowed. Orthographic projection is a strong default.

## 6. Solar System

Preserve real relative orbital distances on one linear scale. Small planets may be points, labels, or leader lines; physical disks can disappear when subpixel. A later size-exaggeration toggle must disclose its factor. Initially simplified circular/planar orbits are acceptable only when documented. Decide the provisional 100 AU reference span when implementing.

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
