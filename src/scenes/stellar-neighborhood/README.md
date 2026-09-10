# Nearby-star subset

`nearby-stars.json` is derived from **HYG v4.1**, David Nash / Astronexus, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The derived subset retains this license. Source accessed 2026-09-10:

- [Catalog documentation and field definitions](https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md)
- [Original CSV](https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv)

Changes: select all 62 rows with `dist <= 5` pc, retain ID, common/catalog name, XYZ, absolute V magnitude, spectral type and B−V; omit other columns. Raw catalog XYZ remain in input parsecs. `stellarData.ts` converts lengths to SI meters and places the Sun exactly at the origin, overriding HYG's nonzero plotting position. `stellarModel.ts` rotates coordinates to Y-up and normalizes to render units. No proper-motion updates or artificial binary separation.

Reproduce with `python3 scripts/prepare-nearby-stars.py /path/to/hygdata_v41.csv`, then format the JSON with Prettier. No download is needed at build time or runtime.

The bulge source and adopted location are recorded in `stellarData.ts` and `docs/scenes.md`. This subset is incomplete and must not be used as a current complete census or a direct measured density benchmark.

## Famous-star distance table

`famous-star-distances.json` has 17 editorially selected stars, sorted by adopted distance. Within the rendered 5 pc sample, only Proxima Centauri, Sirius and Procyon are listed; Tau Ceti and the other formerly listed local stars were removed from this table. The 3D catalog itself is unchanged.

Most distances retain HYG v4.1 `dist` in pc and HYG IDs, under the same David Nash / Astronexus CC BY-SA 4.0 provenance as the nearby-star subset. Canopus (94.7867 pc), Antares (169.7793 pc), Rigel (264.5503 pc) and Polaris (132.626 pc) are retained historical catalog estimates, not claims to the latest measurement. Their displayed values use two significant digits and “約” / “≈”.

Two rows replace HYG distances with explicitly adopted published estimates, accessed 2026-09-10; their star names link to the source:

- Betelgeuse: 168 pc from [Joyce et al. (2020)](https://arxiv.org/abs/2006.09837), a model-based estimate with reported +27/−15 pc uncertainty. Other methods differ; display approximately 550 ly / 170 pc, not an exact distance.
- Deneb: 802 pc from [Schiller & Przybilla (2008), Table 2](https://arxiv.org/abs/0712.0040), reported ±66 pc with the adopted Cyg OB7 association distance. Display approximately 2,600 ly / 800 pc. This is an adopted estimate, not a definitive parallax distance.

The runtime model converts input pc to canonical SI meters, then converts to ly using the Julian-year convention. The other rows use three significant digits. Earth–Sun baseline differences are negligible at this precision. Stars beyond 5 pc are table entries only; no scene geometry or live data requests are added.
