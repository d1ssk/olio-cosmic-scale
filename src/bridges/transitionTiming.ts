export const BAR_TIMING = { remove: 180, resize: 720, reveal: 180, sceneResize: 1000 } as const;
export function reducedMotion(): boolean {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}
export function transitionDelay(milliseconds: number): Promise<void> {
  return reducedMotion()
    ? Promise.resolve()
    : new Promise((resolve) => setTimeout(resolve, milliseconds));
}
