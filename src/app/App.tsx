import { mainNavigationMode } from "./navigation";
import { BarVisibilityContext, type BarKind } from "../scenes/shared/barVisibility";
import { BAR_TIMING, transitionDelay } from "../bridges/transitionTiming";
import {
  lazy,
  Suspense,
  useCallback,
  useRef,
  useState,
  useImperativeHandle,
  useEffect,
  type Ref,
} from "react";
import { EARTH_COMPARISON_METERS } from "../bridges/humanEarthBridge";
import { ScaleBridge, type BridgeControls } from "../bridges/ScaleBridge";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { NavigationControls } from "../components/NavigationControls";
import { ScaleAxis } from "../components/ScaleAxis";
import { captureBridgeBar, captureReferenceBar, type BarSnapshot } from "../bridges/barTransition";
import type { SceneId } from "../scenes/types";
import { ReferenceBarOverlay } from "../components/ReferenceBarOverlay";
import { SceneHUD } from "../components/SceneHUD";
import { translate } from "../i18n";
import { useAppState } from "./appState";
import { sceneRegistry } from "./sceneRegistry";

const SceneHost = lazy(() =>
  import("../scenes/shared/SceneHost").then((module) => ({ default: module.SceneHost })),
);

export function App(): React.JSX.Element {
  const state = useAppState();
  const sceneRef = useRef<SceneControls>(null);
  const [busy, setBusy] = useState(false);
  const navigationLock = useRef(false);
  const release = useCallback(() => {
    navigationLock.current = false;
    setBusy(false);
  }, []);
  const bridgeRef = useRef<BridgeControls>(null);
  const [sceneEntry, setSceneEntry] = useState<{
    sceneId: SceneId;
    bar: BarSnapshot;
    kind: "reference" | "comparison";
    delay?: number;
  } | null>(null);
  const finishBridge = (complete: boolean) => {
    if (state.mode.kind !== "bridge") return;
    const sceneId = complete ? state.mode.targetSceneId : state.mode.originSceneId;
    const bar =
      sceneId === "earth" || sceneId === "human"
        ? captureBridgeBar(
            sceneId === "earth"
              ? EARTH_COMPARISON_METERS
              : sceneRegistry[sceneId].referenceLengthMeters,
          )
        : null;
    setBusy(Boolean(bar));
    setSceneEntry(
      bar ? { sceneId, bar, kind: sceneId === "earth" ? "comparison" : "reference" } : null,
    );
    if (complete) state.completeBridge();
    else state.cancelBridge();
  };
  const [entryBar, setEntryBar] = useState<BarSnapshot | null>(null);
  const navigate = async (direction: "previous" | "next") => {
    if (busy || navigationLock.current) return;
    if (state.mode.kind === "bridge") bridgeRef.current?.navigate(direction);
    else {
      const from = state.mode.sceneId;
      const target = sceneRegistry[from][direction];
      const connected =
        (from === "earth" && target === "earth-moon") ||
        (from === "earth-moon" && target === "earth");
      if (!target) return;
      navigationLock.current = true;
      setBusy(true);
      const keep: BarKind | "none" = !(
        connected || mainNavigationMode(from, direction).kind === "bridge"
      )
        ? "none"
        : (from === "earth" && direction === "previous") ||
            (from === "earth-moon" && direction === "previous")
          ? "comparison"
          : "reference";
      if (!(await sceneRef.current?.prepareDeparture(keep))) {
        release();
        return;
      }
      const bar = connected
        ? captureReferenceBar(from === "earth" ? "reference" : "comparison")
        : null;
      setSceneEntry(
        bar && target
          ? {
              sceneId: target,
              bar,
              kind: target === "earth" ? "reference" : "comparison",
              delay: 0,
            }
          : null,
      );
      setEntryBar(captureReferenceBar(state.mode.sceneId === "earth" ? "comparison" : "reference"));
      state.navigateMain(direction);
      if (!bar) release();
    }
  };

  const currentId = state.mode.kind === "scene" ? state.mode.sceneId : state.mode.originSceneId;
  const current = sceneRegistry[currentId];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <strong>{translate(state.locale, "app.name")}</strong>
          <span>{translate(state.locale, "app.subtitle")}</span>
        </div>
        <LanguageSwitch locale={state.locale} onChange={state.setLocale} />
      </header>

      <ScaleAxis
        sceneId={currentId}
        locale={state.locale}
        onNavigate={(id) => {
          if (busy) return;
          setSceneEntry(null);
          state.navigateToScene(id);
        }}
      />
      <main className="app-main">
        {state.mode.kind === "scene" ? (
          <SceneView
            ref={sceneRef}
            onArrivalComplete={release}
            key={state.mode.sceneId}
            sceneId={state.mode.sceneId}
            entryKind={sceneEntry?.kind}
            entryDelay={sceneEntry?.delay}
            entryBar={sceneEntry?.sceneId === state.mode.sceneId ? sceneEntry.bar : null}
          />
        ) : (
          <ScaleBridge
            key={`${state.mode.originSceneId}-${state.mode.targetSceneId}`}
            originSceneId={state.mode.originSceneId}
            targetSceneId={state.mode.targetSceneId}
            locale={state.locale}
            entryBar={entryBar}
            ref={bridgeRef}
            onBusyChange={setBusy}
            onCancel={() => finishBridge(false)}
            onComplete={() => finishBridge(true)}
          />
        )}
      </main>
      <NavigationControls
        locale={state.locale}
        canPrevious={!busy && (state.mode.kind === "bridge" || Boolean(current.previous))}
        canNext={!busy && (state.mode.kind === "bridge" || Boolean(current.next))}
        onPrevious={() => navigate("previous")}
        onNext={() => navigate("next")}
      />
    </div>
  );
}

type SceneControls = { prepareDeparture: (kind: BarKind | "none") => Promise<boolean> };

function SceneView({
  ref,
  onArrivalComplete: release,
  sceneId,
  entryBar,
  entryKind,
  entryDelay,
}: {
  ref?: Ref<SceneControls>;
  onArrivalComplete: () => void;
  sceneId: SceneId;
  entryBar?: BarSnapshot | null;
  entryKind?: "reference" | "comparison";
  entryDelay?: number;
}): React.JSX.Element {
  const state = useAppState();
  const [ready, setReady] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [barsHidden, setBarsHidden] = useState(false);
  const [onlyBar, setOnlyBar] = useState<BarKind | "none" | null>(null);
  const [departing, setDeparting] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const onArrivalComplete = useCallback(() => {
    setArrived(true);
    void transitionDelay(BAR_TIMING.reveal).then(release);
  }, [release]);
  useImperativeHandle(
    ref,
    () => ({
      async prepareDeparture(kind) {
        setDeparting(true);
        setOnlyBar(kind);
        if (barsHidden && kind !== "none") {
          setBarsHidden(false);
          await transitionDelay(BAR_TIMING.reveal);
        }
        await transitionDelay(BAR_TIMING.remove);
        return mounted.current;
      },
    }),
    [barsHidden],
  );

  const scene = sceneRegistry[sceneId];
  const Scene = scene.component;

  return (
    <section className={`scene-view ${sceneId}-view ${entryBar && arrived ? "is-arriving" : ""}`}>
      <Suspense
        fallback={<div className="loading-state">{translate(state.locale, "loading.scene")}</div>}
      >
        <SceneHost metadata={scene} locale={state.locale} resetVersion={state.resetVersion}>
          <BarVisibilityContext
            value={{ hidden: barsHidden || Boolean(entryBar && !arrived), only: onlyBar }}
          >
            <Scene
              active
              locale={state.locale}
              metadata={scene}
              onReady={() => setReady(true)}
              entryBarKind={entryKind}
              referenceBarVisible={!entryBar || arrived}
            />
          </BarVisibilityContext>
        </SceneHost>
      </Suspense>
      {(scene.id === "human" || scene.id === "earth" || scene.id === "earth-moon") && (
        <ReferenceBarOverlay
          kind={entryKind ?? (scene.id === "human" ? "reference" : "comparison")}
          delay={entryDelay}
          locale={state.locale}
          entryBar={entryBar}
          ready={ready}
          onArrivalComplete={onArrivalComplete}
        />
      )}
      {!ready && <div className="loading-state">{translate(state.locale, "loading.scene")}</div>}
      <SceneHUD
        scene={scene}
        locale={state.locale}
        onLateral={state.navigateLateral}
        onReset={state.resetCamera}
        barsHidden={barsHidden}
        onBarsHiddenChange={setBarsHidden}
        transitioning={departing || Boolean(entryBar && !arrived)}
      />
    </section>
  );
}
