export type BarSnapshot = { x: number; y: number; length: number; angle: number };

/** Capture projected endpoints before the scene canvas unmounts. */
export function captureReferenceBar(
  kind: "reference" | "comparison" = "reference",
): BarSnapshot | null {
  const line = document.querySelector<SVGLineElement>(`[data-scene-${kind}-bar]`);
  const svg = line?.ownerSVGElement;
  if (!line || !svg) return null;
  const rect = svg.getBoundingClientRect();
  const x1 = Number(line.getAttribute("x1"));
  const y1 = Number(line.getAttribute("y1"));
  const x2 = Number(line.getAttribute("x2"));
  const y2 = Number(line.getAttribute("y2"));
  const length = Math.hypot(x2 - x1, y2 - y1);
  return length > 0
    ? { x: rect.left + x1, y: rect.top + y1, length, angle: Math.atan2(y2 - y1, x2 - x1) }
    : null;
}

/** Capture the actual screen bar, including an in-flight CSS transform. */
export function captureBridgeBar(meters?: number): BarSnapshot | null {
  const bar =
    meters === undefined
      ? document.querySelector<HTMLElement>("[data-bridge-main-bar]")
      : [...document.querySelectorAll<HTMLElement>("[data-bridge-meters]")].find(
          (element) => Number(element.dataset.bridgeMeters) === meters,
        );
  if (!bar) return null;
  const rect = bar.getBoundingClientRect();
  return rect.width > 0
    ? { x: rect.left, y: rect.top + rect.height / 2, length: rect.width, angle: 0 }
    : null;
}

export function barTransform(bar: BarSnapshot): string {
  return `translate(${bar.x}px, ${bar.y}px) rotate(${bar.angle}rad) scaleX(${bar.length})`;
}
