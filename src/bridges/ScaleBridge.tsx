import { MILKY_WAY_BRIDGE_VALUES } from "../scenes/milky-way/milkyWayData";
import {
  STELLAR_BRIDGE_VALUES,
  STELLAR_COMPARISON_METERS,
} from "../scenes/stellar-neighborhood/stellarData";
import { BAR_TIMING, reducedMotion } from "./transitionTiming";
import {
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  type Ref,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { canonicalBridgeEndpoints, sceneRegistry } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import { chooseNaturalUnit, formatLength, length } from "../physics/length";
import type { SceneId } from "../scenes/types";
import { DEFAULT_BRIDGE_CONFIG } from "./bridgeTypes";
import type { BarSnapshot } from "./barTransition";
import { HUMAN_EARTH_BRIDGE_VALUES } from "./humanEarthBridge";
import { planBridge } from "./bridgePlanner";

export type BridgeControls = { navigate: (direction: "previous" | "next") => void };

export function ScaleBridge({
  originSceneId,
  targetSceneId,
  locale,
  onComplete,
  onCancel,
  ref,
  entryBar,
  onBusyChange,
}: {
  originSceneId: SceneId;
  targetSceneId: SceneId;
  locale: Locale;
  onComplete: () => void;
  onCancel: () => void;
  ref?: Ref<BridgeControls>;
  entryBar?: BarSnapshot | null;
  onBusyChange?: (busy: boolean) => void;
}): React.JSX.Element {
  const [entryPending, setEntryPending] = useState(Boolean(entryBar));
  const [leavingMeters, setLeavingMeters] = useState<number | null>(null);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const entryRef = useRef<HTMLDivElement>(null);
  const entryTargetRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  const entryAnimation = useRef<Animation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(containerRef);
  const [lower, upper] = canonicalBridgeEndpoints(originSceneId, targetSceneId);
  const travelingUp =
    sceneRegistry[originSceneId].referenceLengthMeters <
    sceneRegistry[targetSceneId].referenceLengthMeters;
  const values = useMemo(() => {
    if (lower.id === "human" && upper.id === "earth") return HUMAN_EARTH_BRIDGE_VALUES;
    if (lower.id === "solar-system" && upper.id === "solar-neighborhood")
      return STELLAR_BRIDGE_VALUES;
    if (lower.id === "solar-neighborhood" && upper.id === "milky-way")
      return MILKY_WAY_BRIDGE_VALUES;
    const plan = planBridge({
      fromSceneId: lower.id,
      toSceneId: upper.id,
      fromMeters: lower.referenceLengthMeters,
      toMeters: upper.referenceLengthMeters,
      availableWidthPx: width,
      milestones: lower.bridgeMilestonesToNext,
    });
    return [plan.steps[0].fromMeters, ...plan.steps.map((step) => step.toMeters)];
  }, [lower, upper, width]);
  const [frame, setFrame] = useState<number | null>(null);
  const index = Math.max(
    1,
    Math.min(frame ?? (travelingUp ? 1 : values.length - 1), values.length - 1),
  );
  useImperativeHandle(
    ref,
    () => ({
      navigate(direction) {
        if (locked.current) return;
        const exiting = direction === "next" ? index === values.length - 1 : index === 1;
        if (exiting) {
          const complete = direction === "next" ? travelingUp : !travelingUp;
          const meters = direction === "next" ? values[index] : values[index - 1];
          setLeavingMeters(meters);
          locked.current = true;
          onBusyChange?.(true);
          const finish = () => {
            locked.current = false;
            (complete ? onComplete : onCancel)();
          };
          if (reducedMotion()) finish();
          else timer.current = setTimeout(finish, BAR_TIMING.remove);
          return;
        }
        if (!reducedMotion()) {
          locked.current = true;
          onBusyChange?.(true);
          timer.current = setTimeout(
            () => {
              locked.current = false;
              onBusyChange?.(false);
            },
            BAR_TIMING.remove + BAR_TIMING.resize + BAR_TIMING.reveal,
          );
        }
        entryAnimation.current?.cancel();
        if (entryRef.current) entryRef.current.style.display = "none";
        if (entryTargetRef.current) entryTargetRef.current.style.visibility = "";
        if (direction === "next") {
          if (index === values.length - 1) (travelingUp ? onComplete : onCancel)();
          else setFrame(index + 1);
        } else {
          if (index === 1) (travelingUp ? onCancel : onComplete)();
          else setFrame(index - 1);
        }
      },
    }),
    [index, values, travelingUp, onComplete, onCancel, onBusyChange],
  );
  useLayoutEffect(() => {
    if (animated.current || !entryBar || !entryRef.current || !entryTargetRef.current) return;
    const overlay = entryRef.current;
    const target = entryTargetRef.current;
    if (!overlay.animate || reducedMotion()) {
      setEntryPending(false);
      return;
    }
    locked.current = true;
    onBusyChange?.(true);
    animated.current = true;
    const rect = target.getBoundingClientRect();
    overlay.style.display = "block";
    target.style.visibility = "hidden";
    const animation = overlay.animate(
      [
        {
          transform: `translate(${entryBar.x}px, ${entryBar.y}px) rotate(${entryBar.angle}rad) scaleX(${entryBar.length})`,
        },
        {
          transform: `translate(${rect.left}px, ${rect.top + rect.height / 2}px) rotate(0rad) scaleX(${rect.width})`,
        },
      ],
      {
        delay: 0,
        duration: 1000,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );
    const finish = () => {
      target.style.visibility = "";
      setEntryPending(false);
      timer.current = setTimeout(() => {
        overlay.style.display = "none";
        locked.current = false;
        onBusyChange?.(false);
      }, BAR_TIMING.reveal);
    };
    entryAnimation.current = animation;
    animation.onfinish = finish;
    return () => {
      animation.cancel();
      overlay.style.display = "none";
      target.style.visibility = "";
      locked.current = false;
      animated.current = false;
    };
  }, [entryBar, width, onBusyChange]);
  const ratio = index > 0 ? values[index] / values[index - 1] : null;
  return (
    <section className="bridge">
      <div ref={entryRef} className="bridge-entry-bar" aria-hidden="true" />
      <div className="bridge-heading">
        <span className="eyebrow">{translate(locale, "bridge.title")}</span>
        <h1>
          {translate(locale, sceneRegistry[originSceneId].titleKey)} →{" "}
          {translate(locale, sceneRegistry[targetSceneId].titleKey)}
        </h1>
        <p>{translate(locale, "bridge.caption")}</p>
      </div>
      <div className="bridge-comparison" ref={containerRef}>
        <p className="bridge-progress" role="status">
          {translate(locale, "bridge.step", {
            current: index,
            total: values.length - 1,
          })}
        </p>
        <div className="bridge-bars">
          {values.map((meters, i) => {
            const visible = i === index || i === index - 1;
            return (
              <div
                key={meters}
                className="length-bar-row"
                aria-hidden={!visible}
                style={{
                  opacity:
                    !entryPending && (leavingMeters !== null ? meters === leavingMeters : visible)
                      ? 1
                      : 0,
                  transform: `translateY(${(index - i) * 90}px)`,
                  transitionDelay: `180ms, ${leavingMeters !== null || frame === null ? 0 : visible ? 900 : 0}ms`,
                  transitionDuration: "720ms, 180ms",
                }}
              >
                <div className="length-bar-label">
                  <strong>
                    {formatLength(length(meters), {
                      unit:
                        meters === STELLAR_COMPARISON_METERS
                          ? "AU"
                          : chooseNaturalUnit(length(meters)),
                      locale,
                    })}
                  </strong>
                </div>
                <div
                  className="length-bar-track"
                  style={{ width: `${DEFAULT_BRIDGE_CONFIG.mainBarFraction * 100}%` }}
                >
                  <div
                    data-bridge-main-bar={i === index ? "" : undefined}
                    data-bridge-meters={meters}
                    ref={
                      meters ===
                      ((originSceneId === "earth" && lower.id === "human") ||
                      (upper.id === "solar-neighborhood" && !travelingUp)
                        ? values.at(-1)
                        : sceneRegistry[originSceneId].referenceLengthMeters)
                        ? entryTargetRef
                        : undefined
                    }
                    className="length-bar-fill"
                    style={{ transform: `scaleX(${Math.min(1, meters / values[index])})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <span className="bridge-ratio">
          {ratio !== null &&
            translate(locale, "bridge.ratio", {
              ratio: new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 }).format(ratio),
            })}
        </span>
      </div>
    </section>
  );
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
