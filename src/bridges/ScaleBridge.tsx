import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { canonicalBridgeEndpoints, sceneRegistry } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import { chooseNaturalUnit, formatLength, length } from "../physics/length";
import type { SceneId } from "../scenes/types";
import { NavigationControls } from "../components/NavigationControls";
import { planBridge, reverseBridgePlan } from "./bridgePlanner";

type ScaleBridgeProps = {
  originSceneId: SceneId;
  targetSceneId: SceneId;
  locale: Locale;
  onCancel: () => void;
  onComplete: () => void;
};

export function ScaleBridge({
  originSceneId,
  targetSceneId,
  locale,
  onCancel,
  onComplete,
}: ScaleBridgeProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(containerRef);
  const [index, setIndex] = useState(0);
  const [lower, upper] = canonicalBridgeEndpoints(originSceneId, targetSceneId);
  const travelingUp = sceneReference(originSceneId) < sceneReference(targetSceneId);

  const plan = useMemo(() => {
    const canonical = planBridge({
      fromSceneId: lower.id,
      toSceneId: upper.id,
      fromMeters: lower.referenceLengthMeters,
      toMeters: upper.referenceLengthMeters,
      availableWidthPx: width,
      milestones: lower.bridgeMilestonesToNext,
    });
    return travelingUp ? canonical : reverseBridgePlan(canonical);
  }, [lower, upper, travelingUp, width]);

  const safeIndex = Math.min(index, plan.steps.length - 1);
  const step = plan.steps[safeIndex];
  const maxMeters = Math.max(step.fromMeters, step.toMeters);
  const ratio = maxMeters / Math.min(step.fromMeters, step.toMeters);
  const ratioText = new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US", {
    maximumSignificantDigits: 3,
  }).format(ratio);

  const formatBridgeLength = (meters: number) => {
    const value = length(meters);
    return formatLength(value, { unit: chooseNaturalUnit(value), locale });
  };

  return (
    <section className="bridge" ref={containerRef}>
      <div className="bridge-heading">
        <span className="eyebrow">{translate(locale, "bridge.title")}</span>
        <h1>
          {translate(locale, sceneTitle(originSceneId))} →{" "}
          {translate(locale, sceneTitle(targetSceneId))}
        </h1>
        <p>{translate(locale, "bridge.caption")}</p>
      </div>

      <div className="bridge-comparison" key={`${step.fromMeters}-${step.toMeters}`}>
        <p className="bridge-progress">
          {translate(locale, "bridge.step", { current: safeIndex + 1, total: plan.steps.length })}
        </p>
        <LengthBar
          label={translate(locale, "bridge.from")}
          value={formatBridgeLength(step.fromMeters)}
          fraction={step.fromMeters / maxMeters}
        />
        <LengthBar
          label={translate(locale, "bridge.to")}
          value={formatBridgeLength(step.toMeters)}
          fraction={step.toMeters / maxMeters}
        />
        <strong className="bridge-ratio">
          {translate(locale, "bridge.ratio", { ratio: ratioText })}
        </strong>
      </div>

      <NavigationControls
        locale={locale}
        canPrevious
        canNext
        onPrevious={() => (safeIndex === 0 ? onCancel() : setIndex(safeIndex - 1))}
        onNext={() =>
          safeIndex === plan.steps.length - 1 ? onComplete() : setIndex(safeIndex + 1)
        }
      />
    </section>
  );
}

function LengthBar({
  label,
  value,
  fraction,
}: {
  label: string;
  value: string;
  fraction: number;
}): React.JSX.Element {
  return (
    <div className="length-bar-row">
      <div className="length-bar-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="length-bar-track" aria-hidden="true">
        <div className="length-bar-fill" style={{ width: `${fraction * 100}%` }} />
      </div>
    </div>
  );
}

function sceneReference(sceneId: SceneId): number {
  return sceneRegistry[sceneId].referenceLengthMeters;
}

function sceneTitle(sceneId: SceneId) {
  return sceneRegistry[sceneId].titleKey;
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>): number {
  return useSyncExternalStore(
    (notify) => {
      const element = ref.current;
      if (!element || typeof ResizeObserver === "undefined") return () => undefined;
      const observer = new ResizeObserver(notify);
      observer.observe(element);
      return () => observer.disconnect();
    },
    () => ref.current?.clientWidth ?? 900,
    () => 900,
  );
}
