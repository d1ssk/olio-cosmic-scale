import catalog from "./nearby-stars.json";
import { PARSEC_METERS, AU_METERS } from "../../physics/constants";

export const STELLAR_REFERENCE_METERS = 8 * PARSEC_METERS;
export const STELLAR_RADIUS_METERS = 5 * PARSEC_METERS;
// User-adopted comparison: the standalone 100 AU → 20,000 AU step is exactly 1:200.
export const STELLAR_COMPARISON_METERS = 20_000 * AU_METERS;
// Adopted display clearances to the right of the 5 pc sample, in the default view.
export const STELLAR_RULER_OFFSETS_METERS = [5.2 * PARSEC_METERS, 5.6 * PARSEC_METERS] as const;
export const STELLAR_BRIDGE_VALUES = [100 * AU_METERS, STELLAR_COMPARISON_METERS];
export const STELLAR_SOURCES = [
  {
    id: "hyg41",
    title: "HYG v4.1 · David Nash / Astronexus",
    url: "https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md",
    accessed: "2026-09-10",
    notes:
      "62 entries with dist <= 5 pc, including Sun. Epoch/equinox J2000. Incomplete census; catalog components retained. Derived subset: CC BY-SA 4.0.",
  },
  {
    id: "bulge2020",
    title: "Balbi, Hami & Kovačević (2020), §3.2",
    url: "https://doi.org/10.3390/life10080132",
    accessed: "2026-09-10",
    notes:
      "Equations 2–5; adopt (x,y,z)=(1,0,0) kpc in model axes, locally uniform within 5 pc. Includes bulge and disk; not the nuclear cluster.",
  },
] as const;

export const NEARBY_STARS = catalog.map(({ xyzPc, ...star }) => ({
  ...star,
  sourceId: "hyg41",
  // HYG assigns Sol a tiny plotting offset; define the actual solar origin exactly.
  positionMeters: (star.id === 0 ? [0, 0, 0] : xyzPc.map((v) => v * PARSEC_METERS)) as [
    number,
    number,
    number,
  ],
}));

// Balbi et al. equations 2–5, lengths stored in SI before evaluating dimensionless ratios.
export const BULGE_LOCATION_METERS = 1000 * PARSEC_METERS;
export const BULGE_DENSITY_PER_PC3 =
  13.7 * Math.exp(-0.5 * (BULGE_LOCATION_METERS / (1590 * PARSEC_METERS)) ** 2) +
  0.14 * Math.exp(-(BULGE_LOCATION_METERS - 8300 * PARSEC_METERS) / (3500 * PARSEC_METERS));
export const STELLAR_VOLUME_PC3 = (4 / 3) * Math.PI * (STELLAR_RADIUS_METERS / PARSEC_METERS) ** 3;
export const BULGE_STAR_COUNT = Math.round(BULGE_DENSITY_PER_PC3 * STELLAR_VOLUME_PC3);
export const STELLAR_PSF_PIXELS = 24;

// Adopted display palette: B−V color anchors, not a spectral integration or calibrated RGB.
export const BV_PALETTE = [
  [-0.3, "#a6bdff"],
  [0, "#d4e0ff"],
  [0.4, "#f5f3ff"],
  [0.65, "#fff2cf"],
  [1.0, "#ffd29c"],
  [1.5, "#ffb075"],
  [2.1, "#ff975d"],
] as const;
export const SPECTRAL_BV: Record<string, number> = {
  O: -0.3,
  B: -0.15,
  A: 0,
  F: 0.4,
  G: 0.65,
  K: 1.1,
  M: 1.7,
  D: 0,
};
