# Local Group: a fixed, sourced spatial model

The static subset contains **all 75 entries tagged G, A or L** in McConnachie
(2012), AJ 144, 4, [CDS J/AJ/144/4](https://cdsarc.cds.unistra.fr/ftp/J/AJ/144/4/).
This includes candidate/disputed systems (e.g. Canis Major and Willman 1).
It is neither a present-day census nor a geometric volume-complete sample.
The author also distributes a [2021 update](https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/community/nearby/);
this implementation deliberately identifies its reproducible **2012** version.
No live downloads, extra groups, velocities, or simulated trajectories are used.

`catalog.json` preserves the published factual subset: J2000 RA/Dec, rounded
heliocentric distances and asymmetric errors, morphology, semimajor half-light
radius, PA measured east from north, ellipticity (1−b/a), membership, uncertainty
flags, comments, and original numbered reference fields. Cite McConnachie when
reusing this compilation; consult the original tables and references for flags.

Reproduce from the three pipe-delimited tables:

```sh
mkdir -p tmp/local-group
curl -L --fail https://cdsarc.cds.unistra.fr/ftp/J/AJ/144/4/table1.dat -o tmp/local-group/table1.dat
curl -L --fail https://cdsarc.cds.unistra.fr/ftp/J/AJ/144/4/table2.dat -o tmp/local-group/table2.dat
curl -L --fail https://cdsarc.cds.unistra.fr/ftp/J/AJ/144/4/table3.dat -o tmp/local-group/table3.dat
python3 scripts/prepare-local-group.py tmp/local-group
npx prettier --write src/scenes/local-group/catalog.json
```

## Coordinates and extent

`localGroupData.ts` converts source units to canonical SI meters. Astronomy Engine
2.1.19 `Rotation_EQJ_GAL` converts EQJ to the IAU 1958 Galactic frame. Renderer
axes are (−galX, galZ, galY), matching the Milky Way scene's right-handed X toward
the Sun / Y north / Z toward l=90° axes. Translation adds the existing 8,178 pc
solar radius (height approximated zero). Milky Way center is exactly zero before
shifting the origin to the **geometric midpoint** of MW and M31, not a measured
mass barycenter. The resulting center separation is about 789 kpc. Model units
are 100 kpc. Default short-side viewport extent is 2.4 Mpc; the 3 Mpc comparison
ruler is not an asserted Local Group boundary. No cosmological distance or
light-time correction is appropriate to this catalog comparison.

Independent coordinate fixtures allow 1e-4 radians: Astronomy Engine's IAU 1958
conversion differs slightly from modern ICRS Galactic pole coordinates. This
is far below the distance uncertainties, not an astrometric accuracy claim.

## Shape conventions

- **Milky Way:** exactly the existing deterministic simple model, 30 kpc disk
  diameter; physical Galactic plane and same bar/arm display assumptions.
- **M31:** representative 200,000 ly stellar diameter
  ([NASA/JPL](https://www.jpl.nasa.gov/images/pia16682-cool-andromeda/)); PA 38°,
  inclination 77° ([M31 rotation-curve study, 2024](https://academic.oup.com/mnras/article/528/2/2653/7512223)).
  Schematic two-arm disk and central bulge, not traced observed arms/rings.
- **M33:** adopted optical R25 radius 8.6 kpc and inclination 54°
  ([A&A 700 A57, 2025](https://www.aanda.org/articles/aa/pdf/2025/08/aa55408-25.pdf));
  PA 23° from the catalog. Broad, patchy two-arm display, no prominent bulge.
- **LMC:** representative 14,000 ly diameter
  ([ESO](https://www.eso.org/public/images/potw2216a/)); inclination 34.7° and
  line of nodes 122.5° ([van der Marel & Cioni](https://ned.ipac.caltech.edu/level5/March04/Marel/Marel6.html)).
  The model is an irregular disk approximation; no claimed bar reconstruction.
- **SMC:** representative 7,000 ly diameter (same ESO source); spherical
  envelope because this catalog supplies no PA or ellipticity. Its actual
  irregular, elongated, population-dependent depth is **not** reconstructed.
- **Dwarfs:** Gaussian ellipsoidal envelopes. Projected long/short axes use the
  catalog PA and b/a. The unmeasured depth semiaxis is adopted equal to the
  projected minor semiaxis; PA alone is never treated as a measured 3D pole.
  Gaussian sigma = rh / sqrt(2 ln 2); truncate at ellipsoidal radius 3 rh
  (a display support convention, not a physical edge; truncation slightly
  changes the exact half-light fraction). All are envelopes, including dIrr
  classifications; internal clumps, tidal streams and non-elliptical features
  are not observations and are omitted. Unknown PA adopts 0°; unknown b/a
  adopts 1. **Canis Major, Bootes III and Andromeda XX have no radius here and
  get only a center marker**, without invented physical geometry.

Disk bases rotate the local sky minor axis about the PA/line of nodes by the
published inclination. These absolute inclinations alone leave a **near/far
ambiguity**; the +tilt branch is an explicit convention, not a fully inferred
signed disk orientation. Population-dependent warps are omitted. Exponential disk scale radius (one quarter of the adopted support radius), disk full
thickness (2.5% of radius), arm pitch/phase, bulge proportions, color and point
brightness are display conventions. The model does not imply equal stellar
counts, calibrated luminosities, physical stellar diameters, gas or dark halos.

Samples are deterministic, 10,000 per disk and 1,800 per dwarf envelope; MW
retains 24,000. A Gaussian point kernel has physical support diameter 2.2% of
model radius, capped at 12 device pixels. Subpixel kernels reduce alpha by
pixel area. Ring markers remain fixed at 2 CSS pixels (5 selected) and are
explicitly not sizes. Names use exact centers, updated every frame, prioritize
selection, and suppress collisions/offscreen labels. Keyboard selection and
focus remain available even when a small marker cannot be targeted.

## Integration and QA

This is an independent SceneHost world with common rotation, pan, cursor zoom,
camera memory and Reset. Focus uses the existing reduced-motion-aware camera
interpolator, stays in Local Group, and preserves physical scale. The 30 kpc
comparison ruler transfers directly to/from MW's reference (ratio 100); the
3 Mpc ruler stays independent. Departure preserves the current frame if the connecting ruler is wholly inside
the view volume (including depth) and at least 0.5 px long. Otherwise it restores
framing before capture, including hidden-bar departures. A departure with no
connecting ruler does not reframe. Virgo and larger scenes remain placeholders.

## Framing and annotation tuning

`localGroupData.ts` is the adjustment point:

- `LOCAL_GROUP_VIEW_METERS`: initial/reset short-side extent; smaller means more
  zoom. Now 2.4 Mpc (1.5× closer than the original 3.6 Mpc view). The unchanged
  physical 3 Mpc reference can clip on narrow screens; zooming out reveals it.
- `LOCAL_GROUP_RULER_Y_METERS`: reference −0.65 Mpc / comparison −0.75 Mpc.
  Move either closer to zero to bring it toward the group center.
- `LOCAL_GROUP_LABEL_LAYOUT`: preferred horizontal gaps 100 px desktop / 40 px
  mobile, with 38 px vertical offsets for major/selected galaxies. The placement
  helper uses actual text width, left/right screen halves and collision fallback.

`LocalGroupCameraRig.tsx` applies the solar world's `focusDepth`/`fitSolarDepth`
helpers on drag start. The nearest resolved in-view galaxy supplies depth to the
current screen-center pivot, preserving projected positions and zoom. Ordinary
OrbitControls rotation, pan and cursor zoom stay intact; dynamic clipping includes
all physical model extents and rulers. Rotation never changes hierarchy.
