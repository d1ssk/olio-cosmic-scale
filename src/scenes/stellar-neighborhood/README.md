# Nearby-star subset

`nearby-stars.json` is derived from **HYG v4.1**, David Nash / Astronexus, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The derived subset retains this license. Source accessed 2026-09-10:

- [Catalog documentation and field definitions](https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md)
- [Original CSV](https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv)

Changes: select all 62 rows with `dist <= 5` pc, retain ID, common/catalog name, XYZ, absolute V magnitude, spectral type and B−V; omit other columns. Raw catalog XYZ remain in input parsecs. `stellarData.ts` converts lengths to SI meters and places the Sun exactly at the origin, overriding HYG's nonzero plotting position. `stellarModel.ts` rotates coordinates to Y-up and normalizes to render units. No proper-motion updates or artificial binary separation.

Reproduce with `python3 scripts/prepare-nearby-stars.py /path/to/hygdata_v41.csv`, then format the JSON with Prettier. No download is needed at build time or runtime.

The bulge source and adopted location are recorded in `stellarData.ts` and `docs/scenes.md`. This subset is incomplete and must not be used as a current complete census or a direct measured density benchmark.
