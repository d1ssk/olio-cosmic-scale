import { BAR_TIMING, reducedMotion } from "../bridges/transitionTiming";
import { useEffect, useRef } from "react";
import { translate, type Locale } from "../i18n";
import { barTransform, captureReferenceBar, type BarSnapshot } from "../bridges/barTransition";

/** DOM renderer; the scene's projection controller updates the physical endpoints. */
export function ReferenceBarOverlay({
  locale,
  entryBar,
  ready = true,
  onArrivalComplete,
  kind = "reference",
  delay = 0,
}: {
  locale: Locale;
  delay?: number;
  kind?: "reference" | "comparison";
  entryBar?: BarSnapshot | null;
  ready?: boolean;
  onArrivalComplete?: () => void;
}): React.JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const transferRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!entryBar || !ready) return;
    let frameId = 0;
    let animation: Animation | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const svg = svgRef.current;
    const transfer = transferRef.current;
    if (!svg || !transfer) return;
    const finish = () => {
      svg.style.visibility = "visible";
      onArrivalComplete?.();
      if (reducedMotion()) transfer.style.display = "none";
      else
        hideTimer = setTimeout(() => {
          transfer.style.display = "none";
        }, BAR_TIMING.reveal);
    };
    const start = () => {
      const target = captureReferenceBar(kind);
      if (!svg.querySelector(`[data-scene-${kind}-bar][data-projected="true"]`) || !target) {
        frameId = requestAnimationFrame(start);
        return;
      }
      if (!transfer.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }
      animation = transfer.animate(
        [{ transform: barTransform(entryBar) }, { transform: barTransform(target) }],
        { delay, duration: 1000, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
      );
      animation.onfinish = finish;
    };
    frameId = requestAnimationFrame(start);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(hideTimer);
      animation?.cancel();
    };
  }, [entryBar, ready, onArrivalComplete, kind, delay]);
  return (
    <div id="scene-reference-overlay">
      {entryBar && (
        <div
          ref={transferRef}
          className="scene-entry-bar"
          style={{ transform: barTransform(entryBar) }}
          aria-hidden="true"
        />
      )}
      <svg
        ref={svgRef}
        className="scene-reference-svg"
        aria-label={translate(locale, "hud.reference")}
        style={{ visibility: entryBar ? "hidden" : "visible" }}
      >
        <line data-scene-reference-bar stroke="none" />
        <line data-scene-comparison-bar stroke="none" />
      </svg>
    </div>
  );
}
