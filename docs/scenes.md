# Scene specifications

These are implementation targets, not license to add decorative content. Before implementing a scene, agree on its exact reference length, viewport, authoritative sources, coordinate frame, and representation mode for each object class.

## 1. Human

Establish a representative 1.7 m human height and the first physical reference bar. A simple representation is enough; do not spend disproportionate effort on photorealism.

## 2. Earth

Show a 3D Earth and make its diameter concrete with orbit controls. An oblate spheroid, atmosphere, and equatorial/polar annotations may come later. Never exaggerate atmosphere thickness without saying so.

## 3. Sun

Show solar diameter at the correct scale. The bridge, rather than a decorative nearby Earth, carries the Earth/Sun comparison. An initially simple visual is acceptable.

## 4. Earth–Sun system

Show 1 AU as real separation with Sun and Earth on one spatial scale. The Sun is true-sized; Earth may be subpixel. A visible Earth marker must be distinct from its physical radius. An orbit guide is allowed. Orthographic projection is a strong default.

## 5. Solar System

Preserve real relative orbital distances on one linear scale. Small planets may be points, labels, or leader lines; physical disks can disappear when subpixel. A later size-exaggeration toggle must disclose its factor. Initially simplified circular/planar orbits are acceptable only when documented. Decide the provisional 100 AU reference span when implementing.

## 6. Solar neighborhood

Use documented catalog-derived 3D positions around the Sun where practical, making parsec-scale separations tangible. Named systems (for example Alpha Centauri, Barnard's Star, or Sirius) are selected from a source, not a handwritten decorative list. This scene owns the lateral comparison described below.

### Galactic-center neighborhood sibling

Compare stellar number density at exactly the same scale. Preserve viewport, camera, projection, zoom, orientation, point sizes, sampling, labels, and scale bar. Use no bridge; a short lateral slide/crossfade is acceptable. Apply all density-honesty requirements in the scientific guidelines.

## 7. Milky Way

Show the Sun in relation to disk diameter/thickness, bulge/bar, and Galactic center. Make direct constraints versus modeled spiral structure clear, using styling and explanatory labels rather than presenting illustrative arms as exact.

## 8. Local Group

Show Milky Way, Andromeda, M33, and major satellites/groups on one spatial scale, including the Milky Way–Andromeda separation. Use real relative centers where known; supported visible/stellar extents can be approximately to scale. Small galaxies need explicit markers and labels.

## 9. Virgo environment

Extend from the Local Group to the nearby large-scale environment and Virgo Cluster, optionally including selected groups/galaxies only when they improve spatial understanding. The provisional reference is the 16.5 Mpc Local Group–Virgo distance. Avoid decorative unsourced points; show cluster extent at the same scale where useful.

## 10. BAO scale

Teach a roughly 147 Mpc-class statistical clustering scale, not an object size. A 3D density sample or carefully labeled schematic may show a reference point and BAO-radius sphere, while explaining the two-point-correlation/pair-separation meaning. Never render literal visible shells around every galaxy.

## 11. Observable Universe

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
