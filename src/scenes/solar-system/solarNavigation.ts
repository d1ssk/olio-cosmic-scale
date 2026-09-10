/** Clip a projected physical segment against the NDC view volume (including depth). */
export function visibleSegmentFraction(a: readonly number[], b: readonly number[]) {
  let lo = 0,
    hi = 1;
  for (let axis = 0; axis < 3; axis++) {
    const d = b[axis] - a[axis];
    if (Math.abs(d) < 1e-12) {
      if (Math.abs(a[axis]) > 1) return 0;
    } else {
      const t1 = (-1 - a[axis]) / d,
        t2 = (1 - a[axis]) / d;
      lo = Math.max(lo, Math.min(t1, t2));
      hi = Math.min(hi, Math.max(t1, t2));
    }
  }
  return Math.max(0, hi - lo);
}
export function solarExitIntent(
  direction: "previous" | "next",
  solarFraction: number,
  solarOpacity: number,
  solarPixels: number,
  outerVisiblePixels: number,
  auFraction = 0,
  auPixels = 0,
) {
  if (direction === "previous" && solarFraction > 0.999 && solarOpacity > 0.2 && solarPixels >= 0.5)
    return "sun";
  if (direction === "previous" && auFraction * auPixels >= 2) return "inner-preset";
  if (direction === "next" && outerVisiblePixels >= 2) return "outer-exit";
  if (direction === "next" && auFraction > 0.999 && auPixels >= 2) return "outer-preset";
  return null;
}

/** Hysteresis keeps the shared world's label stable around the scale boundary. */
export function solarViewLabel(current: "earth-sun" | "solar-system", extentAu: number) {
  if (current === "earth-sun" && extentAu >= 20) return "solar-system";
  if (current === "solar-system" && extentAu <= 14) return "earth-sun";
  return current;
}
export function visibleBarPair(lengths: number[]) {
  const unique = [...new Set(lengths)].sort((a, b) => a - b);
  return unique.length >= 2 ? ([unique[0], unique[1]] as const) : null;
}
