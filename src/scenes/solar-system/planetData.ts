/** Cassini press-kit adopted major-ring radial intervals, meters from Saturn's center.
 * Flat C/B/A annuli; fine structure and optical depths are illustrative. */
export const SATURN_RING_SOURCE_ID = "cassini-major-rings";
export const SATURN_RINGS = [
  { innerMeters: 74_510_000, outerMeters: 92_000_000, opacity: 0.28, color: "#b4a594" },
  { innerMeters: 92_000_000, outerMeters: 117_580_000, opacity: 0.85, color: "#e0ceb0" },
  { innerMeters: 122_170_000, outerMeters: 136_780_000, opacity: 0.65, color: "#c3b69f" },
] as const;
