import { LOCAL_GROUP_LABEL_LAYOUT as layout } from "./localGroupData";
export type LabelBox = { x: number; y: number; width: number };
/** Prefer the object's own screen half; try the opposite side when space is exhausted. */
export function placeGalaxyLabel(
  x: number,
  y: number,
  width: number,
  screenWidth: number,
  screenHeight: number,
  occupied: LabelBox[],
  prominent: boolean,
) {
  const distance = prominent
    ? screenWidth < 600
      ? layout.mobileLeaderPixels
      : layout.desktopLeaderPixels
    : 30;
  const preferredSide = x < screenWidth / 2 ? -1 : 1;
  const vertical = prominent ? layout.verticalOffsetPixels : 20;
  for (const side of [preferredSide, -preferredSide]) {
    const labelX = side < 0 ? x - distance - width : x + distance;
    const tx = Math.max(8, Math.min(screenWidth - width - 8, labelX));
    // Don't put a clamped label on top of its own object.
    if (side < 0 ? tx + width > x - 14 : tx < x + 14) continue;
    for (const shift of [
      -vertical,
      vertical,
      -vertical - 24,
      vertical + 24,
      -vertical - 48,
      vertical + 48,
      -vertical - 72,
      vertical + 72,
    ]) {
      const ty = y + shift;
      if (
        ty < 16 ||
        ty > screenHeight - 12 ||
        occupied.some(
          (o) => Math.abs(o.y - ty) < 19 && tx < o.x + o.width + 10 && tx + width + 10 > o.x,
        )
      )
        continue;
      return { x: tx, y: ty, width, side, endpointX: side < 0 ? tx + width + 4 : tx - 4 };
    }
  }
  return null;
}
