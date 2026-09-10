# Virgo environment: measured directions with mixed distance evidence

One GPU point represents one merged catalog galaxy. The scene is static-first,
with no live APIs, subsampling or invented galaxy identities. `catalog.json` and
its controls load lazily; the registry imports only lightweight constants.

## Inputs and identity

- Ohlson et al. (2024), AJ 167, 31,
  [50MGC](https://github.com/davidohlson/50MGC), `data/catalog.fits`.
  Select chosen catalog positions within 20 Mpc of an adopted midpoint 8.25 Mpc
  toward M87. This spatial cut does not change when switching display modes.
- Cantiello et al. (2024), [NGVS III](https://arxiv.org/abs/2403.16235): all **278**
  SBF targets, including three without VCC IDs. Use `d_ref`, individual errors,
  J2000 coordinates, B_T and q1/q2/q3 quality from the arXiv full TeX tables.
  Keep background galaxies and low-quality q3 measurements at their catalog
  distances in both modes. Article: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Kim et al. (2014), ApJS 215, 22,
  [EVCC Table 2](https://vizier.cfa.harvard.edu/viz-bin/VizieR-3?-source=J/ApJS/215/22/table2).
  All **1,589** rows from the user-supplied `evcc_table2_with_Mg.csv`, copied
  unchanged to `raw/`. `MemIn=M`: 1,028 members; `P`: 561 possible members.
  P is NOT a confirmed non-member classification. Use RAdeg/DEdeg for new entries.
  The CSV supplies radial velocities but no independent distance column; never
  derive a measurement from these velocities or invert M_g to infer distance.
- Existing McConnachie (2012) Local Group subset: all 74 external entries,
  including candidates, plus one distinct Milky Way origin marker.

**The NGVS II 60-row excerpt is removed**, including its source IDs and orphaned
points. Objects independently present in the retained catalogs remain. The final
union is 5,647 galaxies. This is not a uniform or volume-complete census.

Match nonempty normalized IDs first (VCC/NGC/PGC and aliases), then a unique
angular match within 10 arcseconds. Empty aliases never match. Preserve all
supporting source IDs. Two supplied EVCC rows share NGC4257 but have distinct
VCC IDs and sky positions: EVCC324/VCC323 and EVCC2057/VCC321. Exclude that
non-unique NGC alias from matching and retain both objects; original fields
remain in the raw CSV. Assertions require 1,589 unique EVCC associations,
278 SBF targets and 74 separate external Local Group entries.

SBF positions and independent distances win crossmatches. Recognized positive
50MGC zind_dist indicators override flow/group choices (TRGB/TRG, SBF, TF/BTF,
HB, BS, CMD, Cep/Cepheids, RR, SN/SNIa, GCLF, geom); earlier Mei/Cantiello SBF
bestdist stays preferred. This differs deliberately from 50MGC's original
minimum-fractional-error selection. mem/EVCC group distances are adopted;
NAM, CF3-Z, txt and unknown techniques remain catalog estimates.

## Absolute magnitudes

**Use every supplied M_g literally as absolute g-band magnitude**, even for
crossmatched SBF galaxies. It overrides the previous B magnitude. Store the band
and source explicitly. Do not recalculate M_g when distance or display mode
changes. Other entries retain B magnitudes: 50MGC BMag, or B_T converted using
SBF d_ref with no additional extinction correction. No B-to-g transformation
is applied. This mixed-band compressed visual encoding is not calibrated
cross-catalog photometry.

Marker diameter: clamp `1.5 + (-M - 10) × 0.28` to 1.5–5 CSS px. Missing
photometry uses 1.5 px, without inferring low luminosity. The observer origin is
an explicit 7 px marker. Galaxy physical radii are not rendered.

## Default statistical depth and the representative-distance checkbox

`distanceMeters` retains the selected catalog distance/estimate.
`representativeDistanceMeters` records the alternate display convention.
`depthModel` explicitly identifies which objects may move. Synthetic values
are derived separately in `virgoDepth.ts`, not written into measured data.

The **unchecked/default** mode assigns statistical depths to 1,494 galaxies:

- **759 Virgo objects**: no independent distance, and either EVCC M or an
  existing EVCC-based Virgo assignment without a contrary supplied membership
  flag. Resample SBF q1/q2 distances in the adopted 12–23 Mpc main-cluster range.
  Weight donors by a Gaussian angular separation with 2.5° bandwidth, sample
  one donor, add Gaussian smoothing σ=0.25 Mpc, and bound to 12–23 Mpc.
  This preserves angular variation and multimodal radial structure in the
  eligible SBF sample, including the approximately 19.4 Mpc component, without
  assigning distant W/W′ galaxies to the main cluster indiscriminately.
- **735 other objects**: adopted distances without individual measurements,
  including unmatched EVCC P candidates and nearby group assignments. Resample
  independent-distance donors with Gaussian angular weighting (30° bandwidth)
  and a Gaussian prior in ln(distance / representative distance), σ=0.35.
  Apply 5% log-distance smoothing to the sampled donor; distances stay positive.
  Candidates without another distance use 16.5 Mpc as an explicit prior and
  representative convention, not as proven membership. Existing non-Virgo
  flow-based estimates have distance information and remain unchanged.

These bandwidths/cuts are adopted visualization choices, **not fitted physical
cluster parameters**. The empirical SBF distribution includes measurement error
and selection effects; this is not a deconvolved intrinsic cluster shape or a
posterior distance estimate for an individual galaxy. q3 is excluded only from
the Virgo donor pool, not from displayed measurements. Finite log weights handle
outside-footprint targets. A missing donor pool fails explicitly instead of
fabricating a supposedly source-backed distribution.

Sampling is deterministic, seeded by stable galaxy name and model version v1;
sort donors by name so reordering inputs does not change draws. Switching colors,
resetting the camera or toggling modes never resamples the galaxies.

Checking **“Use representative distances for unknown depths”** collapses only
model targets: Virgo to 16.5 Mpc, other groups to their existing representative
value, EVCC-only P to 16.5 Mpc. All independent distances, uncertainties,
unmodeled catalog estimates and the observer origin remain unchanged. Thus this
mode intentionally creates shells/layers. The initial reference length remains
16.5 Mpc and initial short-side view 44 Mpc in both modes.

Only radial distance changes. J2000 angular directions, magnitudes, identities
and camera remain fixed. The raw coordinates use the heliocentric observer,
approximated as the Milky Way origin (about 8 kpc solar offset neglected). A rigid
right-handed rotation uses +X toward M87 (RA 187.70593°, Dec 12.39112°), +Y toward
projected celestial north, +Z=X×Y, and shifts to the adopted 8.25 Mpc midpoint.
Labels and GPU points use the same display model. The 3 Mpc Local Group bridge,
explicit hierarchy navigation and camera memory are unaffected.

## Display and provenance

Distance shapes: circle independent; diamond catalog estimate; open circle
representative/origin; open square statistical model. The UI labels the active
mode and model status. Source colors are optional and use exclusive precedence:
NGVS SBF → EVCC → McConnachie → 50MGC → observer origin. Full source IDs remain
in the data. Changing color mode affects colors only; magnitudes/sizes never
change with either checkbox. Milky Way, M31, M87 and M49 remain annotated.

## Reproduction and validation

From the repository root, Python standard library only:

```sh
mkdir -p tmp/virgo
curl -L --fail https://raw.githubusercontent.com/davidohlson/50MGC/master/data/catalog.fits -o tmp/virgo/50mgc.fits
curl -L --fail https://arxiv.org/src/2403.16235v1 -o tmp/virgo/sbf-source.tar
python3 scripts/prepare-virgo.py tmp/virgo
npx prettier --write src/scenes/virgo/catalog.json src/scenes/virgo/manifest.json
npm run check
npm run build
```

An optional second importer argument overrides the bundled EVCC CSV path. Its
SHA-256, FITS and SBF source hashes, membership counts and model counts live in
`manifest.json`. The original CSV under `tmp/` is not modified. The narrow FITS
reader validates its expected scalar schema and record sizes. The TeX source
archive is read by explicit member name without extracting filesystem paths.

Tests verify all EVCC IDs and exact M_g values against the raw CSV, measured
SBF distances/background retention, nonempty identity matching, separate Local
Group entries, source-color priority, finite statistical depths, eligible donor
provenance, deterministic/order-independent sampling, and representative-mode
reversibility without mutation of measurements or photometry.
