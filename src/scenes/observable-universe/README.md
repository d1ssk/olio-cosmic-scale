# Observable Universe scene

The radial reference is an adopted rounded 14 Gpc present-day comoving radius to
the last-scattering surface. The geometry is normalized at 1.4 Gpc per render
unit. This radius is neither a light-travel time nor the observable-universe
diameter.

The ruler uses a deterministic numerical flat-ΛCDM background with H0 = 67.4
km/s/Mpc, Ωm = 0.315, Ωr = 9.2e-5 and ΩΛ set by flatness. Its calculated
last-scattering distance is rescaled by less than 1% to the adopted 14 Gpc
display endpoint. The same integration is continued toward a = 0 to define the
outer particle-horizon radius. The finite shell between these radii is not the
physical width of recombination: it is the user-requested visual span from last
scattering to the particle horizon.

The warm-white inner surface represents the approximately 3000 K blackbody at
emission after an adopted display white balance; its observed temperature today
is 2.7255 K. The orange sidewalls are an emissive-style plasma cue. All geometry
colors are false color.

CMB overlays now read the supplied joint T/E realization from
`public/models/cmb/metadata.json` and its unmodified raw Float32 assets. The
manifest owns filenames, NSIDE, NPIX, units, ordering, bandlimits and statistics.
All supplied resolutions are preserved for provenance; only requested standard
fields are fetched (T/E 256, Q/U 64). Cached promises deduplicate simultaneous
loads and survive toggle changes and scene remounts. Failure is logged and hides
that field, without synthetic fallback; reload the page to retry failed requests.
No overlay delays the uniform shell or scene readiness.

`cmbAssets.ts` validates schema conventions, bytes, pixels, finite values and
population mean/std (tolerance max(1e-6 uK, 1e-4 sigma)). Physical Float32 values
remain in uK_CMB. Tests additionally compare every file's SHA-256 with metadata.
`cmbRendering.ts` reprojects T/E once onto the unchanged tangent-plane angular patch UV, using
HEALPix angular-to-NESTED lookup; this is not row-major HEALPix indexing. Texture
size follows NSIDE (4N by 3N). The texture is linearly filtered nearest-pixel
resampling, not a spherical-harmonic interpolation. Colors clamp value/(3 sigma)
to [-1,1] using the existing diverging palettes and tint. Temperature and
polarization can be enabled independently. The existing polarization-only E
scalar background uses E; combined display uses T colors and Q/U sticks.

`healpix.ts` decodes Morton bits into the 12 HEALPix faces and computes their
pixel-center angles. Adopted Galactic orientation: (l,b)=(0,0) -> +X,
(90,0) -> -Z, north -> +Y; theta=pi/2-b, phi=l. The rotation
(X,Y,Z)sky -> (X,Z,-Y)world has determinant +1. The southward e_theta and
eastward e_phi are rotated by the same matrix. Following the HEALPix COSMO
convention, psi=atan2(U,Q)/2 and d=cos(psi)e_theta+sin(psi)e_phi.
No U negation, 90-degree angle offset, camera-dependent change, UV flip or random
rotation is applied. Looking from the inside changes the projection, not the
physical tangent vector. The material remains DoubleSide as before.

One batched LineSegments2 draw contains black, 2 CSS-pixel-wide headless Q/U tangent segments at each visible
NESTED center selected by a fixed face-coordinate checkerboard (Morton children
1 and 2 per parent). Half of NSIDE=64 yields approximately twice the former
NSIDE=32 density, without interpolating or inventing Q/U values. Its supplied
effective bandlimit also increases from 95 to 191. Full length is
0.6 × selected-pixel spacing × P/P_rms, with P_rms derived from the metadata
means and standard deviations of Q/U. Length is proportional to amplitude,
without a floor or clipping; the shared spatial scale is a display convention. A 0.2%
inward display offset avoids occlusion by the unchanged faceted inner shell.
Both endpoints must pass the exact same four radial cut planes defined by the
patch; convexity then keeps the entire segment inside. Surface colors are on the
existing mesh only. No shader noise, random fields, Fourier generator or per-pixel
Three.js objects remain. There are no per-frame HEALPix transforms.

`tests/fixtures/cmb-healpy.json` contains independent healpy center/inverse
fixtures and inspectable real-pixel records (pixel, sky/world direction, Q, U,
psi, e_theta, e_phi, final line direction). Reproduce with
`python scripts/cmb-healpy-references.py` in an environment with healpy/numpy.
Tests check handedness, tensor principal axes, headless symmetry, cut boundaries,
physical-array preservation, cache behavior, failures and independent toggles.

Provenance limitation: supplied metadata identifies seed, source_spectra and
B=0, but does not include the input spectrum, generating pipeline or license.
The user identifies these as a healpy joint T/E realization; this is not claimed
to be a particular Planck observed map or independently verified cosmology.
T/E and Q/U have different declared effective bandlimits. No LOD UI is added.
The shell crop remains a display convention.

The 3 Gpc comparison ruler is the exact incoming Cosmic Web reference. It is
parallel to the radial ruler and lies in the light-cone slice plane, offset far
enough from the sector not to overlap it.

Sources:

- Planck Collaboration VI (2018), cosmological parameters:
  <https://arxiv.org/abs/1807.06209>
- Fixsen (2009), CMB temperature:
  <https://ui.adsabs.harvard.edu/abs/2009ApJ...707..916F/abstract>

- HEALPix coordinate and COSMO polarization conventions (checked 2026-09-11):
  <https://healpix.sourceforge.io/html/intro_HEALPix_conventions.htm>
- HEALPix angular coordinate definitions:
  <https://healpix.sourceforge.io/html/csub_Conventions.htm>

Validation on 2026-09-11: `npm run check` passed 151 tests in 28 files;
`npm run build` passed with the existing large-chunk warning. The independent
healpy fixtures cover 228 centers, 126 inverse directions and nine real Q/U
records. Chrome/SwiftShader browser checks covered default, T, E+Q/U, T+Q/U,
OFF, cache reuse, a 390 px viewport and reduced motion. Pending T loading and
turning OFF before its completion retained the uniform canvas. Injected T and Q
HTTP 503 failures also retained the uniform canvas and emitted clear CMB errors. The browser also
reported the unrelated existing favicon 404. No real-device GPU performance
claim is made by the software-rendered smoke test.

The radial-ruler hover target is an invisible radius-0.3 scene-unit cylinder
(the visible ruler is unchanged). Readout disappearance waits 150 ms and re-entry
cancels that delay. All scene Html wrappers pass pointer events through, including
the tooltip wrapper, so labels cannot interrupt the underlying ruler hover.
Chrome QA traversed 41 projected axis positions with ±6 CSS-pixel jitter and
verified continuous readout updates, brief leave/re-entry, and final dismissal.

## Asset-based light-cone wedge

Source: user-supplied `tmp/observable_universe_wedge`, integrated
2026-09-11. The metadata and both binaries are copied unchanged to
`public/models/observable-universe-wedge/`. Metadata retains Planck18 radial
ticks and generation seed/parameters. This replaces the nearby-boost variant;
the current metadata does not declare the previous nearby display compensation.
This is a synthetic density / biased luminous-tracer model, not an observed
catalog; no generating script or license was supplied. A user-requested observer-side tracer display boost is applied as described below.
No random resampling or new cosmology lookup is introduced.

The metadata loader validates coordinate conventions, count/stride/field
agreement, little-endian encoding, byte length and finite values. Coordinates
and sizes remain in source Gpc buffers; the common group applies the centralized
SI Gpc-to-scene conversion and right-handed basis (SIDE, UP, AXIS). Thus 14 Gpc
maps to the unchanged adopted CMB radius 10; the metadata's 13.886 Gpc Planck18
last-scattering tick is retained without rewriting the existing ruler convention.
Point centers outside the spherical CMB radius are visually clipped. A double-sided dark midplane sits at local Y=0. A closed translucent sector
restores the volume boundary. Both point layers, the sector and debug bounds
share a local-Y display scale of 0.25: the source 0.196 Gpc thickness appears as
0.049 Gpc. This is an explicitly labeled visualization compression, not a
change to the source data. The central plane depth-occludes the far half on
either side, providing the same contrast when viewed from above or below.

Matter and tracers each use one Points draw and stable GPU buffers. Only screen
size uniforms update per frame. Matter uses premultiplied normal alpha; tracers
use additive blending and render afterward. Circular, edge-tapered Gaussians
have CSS-pixel diameter clamps, not physical galaxy diameters. All exposure and
size tuning is centralized in `wedgeRendering.ts → WEDGE_RENDER`; the midplane is a display aid.
Use `thicknessScale` for all volume thickness, `matterOpacityScale`
for matter strength, `tracerBrightnessScale` for galaxy strength, and
`sectorOpacity` (0.105) for the translucent sector. Increasing these makes the
respective representation thicker/brighter; sprite sizes have separate scales.
Independent default-on checkboxes preserve the CMB mode. Async cached loading
does not block scene readiness; errors log explicitly while the CMB continues.
Reload to retry a failed asset. Development-only `?wedgeDebug&scene=observable-universe`
shows both volume boundaries, observer cross and the source +Z radial extent.

Wedge validation: all 160 tests in 29 files pass, along with formatting, lint,
type checking and production build (existing large-chunk warning). Tests inspect
all 62,000 records against the binaries and metadata geometry, reject truncation,
nonfinite values and incompatible conventions, and check the right-handed SI
transform. The central plane, closed sector, symmetric compressed bounds and sphere containment also have targeted coverage. Above/below Chrome previews confirm contrast on both sides. Source files match their copies byte-for-byte; hashes are recorded in
the asset README. Chrome/SwiftShader previews cover separate layers, independent
toggles with exactly three asset requests, camera rotation, both CMB modes,
390 px reduced-motion layout and debug boundaries. Injected wedge HTTP 503
logs the failure and leaves the temperature-enabled CMB usable. Software
rendering does not establish real-device GPU performance.

### Observer-side tracer gradient

User-requested display emphasis now increases tracer size and brightness toward
the observer (redshift z=0). Source XZ radial distance, independent of viewing
camera, wedge angle and compressed thickness, supplies a smoothstep weight:
`w = 1 - smoothstep(0, radius × tracerBoostRadiusFraction, hypot(x,z))`.
Cartesian Z is not interpreted as redshift. The smooth comoving-distance ramp
follows the near-to-far direction without introducing another cosmology table.

`WEDGE_RENDER.tracerNearSizeBoost = 1.4` and
`tracerNearBrightnessBoost = 1.5` are maximum multipliers at the observer.
Both taper to 1 at `tracerBoostRadiusFraction = 0.6` of the metadata radius
(8.4 Gpc for this asset). Set both boost multipliers to 1 to disable the effect.
Weights are computed once into one GPU attribute; positions, source sizes,
brightness, counts, matter and CMB remain unchanged.
Size emphasis applies after the baseline pixel clamp so the user's existing
large tracerSizeScale cannot erase the gradient: the current 3.5 CSS-pixel cap
becomes at most 4.9 near the observer. Brightness emphasis multiplies additive RGB
after the base alpha clamp, preserving the gradient even for bright source points.
It is an explicitly disclosed visualization choice, not a physical flux law.

### Radial annotations

Each default radial label is anchored at its exact 3D ruler tick via Html,
with a screen-space bent leader and a high-contrast dot at the actual tick.
Label boxes alternate sides and have a dark opaque background and pale border;
leader under-strokes remain visible across both dark structure and the CMB.
Pixel offsets keep leaders readable during zoom and rotation. Mobile retains
distance and redshift, omits only lookback time, and places the observer label
above its anchor to avoid clipping at the canvas bottom. Pointer events pass
through all annotation elements; ruler hover, orbit and hidden-bar behavior are
preserved. Scientific tick distances are unchanged.

The independent “Hide annotations” checkbox is initially off. It hides radial
labels and leaders, the CMB description, the light-cone callout and the 3 Gpc
bar's numeric label while retaining the physical ruler
lines, ticks, observer and all scientific layers. It does not change CMB or
matter/tracer toggles. The light-cone label has no leader. It uses a fixed scene-basis position
(0.77 CMB radius along AXIS, -2.95 units SIDE, -0.55 units UP), near the
previous default-view label location. Html transform + sprite billboards only
its orientation toward the camera; no pixel offset moves its anchor as the
view rotates. Perspective controls its apparent size. It remains omitted
on mobile as before.

Axis hover readouts remain available while fixed annotations are hidden.
Hiding the scale bars still hides the axis and its hover interaction.

On this workstation, the exhaustive CMB fixture test can exceed the default
5-second timeout under concurrent browser load; rerunning that test with one
worker and a 30-second timeout passes. Browser QA also verifies that hiding
fixed annotations preserves axis hover updates, dismissal and re-entry.
