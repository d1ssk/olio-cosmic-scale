import { LOCAL_GROUP_GALAXIES } from "../scenes/local-group/localGroupData";
import { galaxyPosition } from "../scenes/local-group/localGroupModel";
import type { GalaxyVariant, VolumeStatus } from "../scenes/milky-way/volumeData";
import { MILKY_WAY_COMPARISON_METERS } from "../scenes/milky-way/milkyWayData";
import { STELLAR_COMPARISON_METERS } from "../scenes/stellar-neighborhood/stellarData";
import { isSolarWorld, isContinuousSolarEdge } from "../scenes/solar-system/solarScale";
import { cameraStateStore, cameraStateKey } from "./cameraState";
import type { SceneHostControls } from "../scenes/shared/SceneHost";
import { hasDirectBarTransfer, mainNavigationMode } from "./navigation";
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
import type { BaoLayerMode, SceneId } from "../scenes/types";
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
  const [observationDate, setObservationDate] = useState(
    () => new Date().toISOString().slice(0, 16) + ":00Z",
  );
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
  const completeSceneArrival = useCallback(() => {
    // A bridge snapshot belongs to one arrival, never a later sibling visit.
    setSceneEntry(null);
    release();
  }, [release]);
  const finishBridge = (complete: boolean) => {
    if (state.mode.kind !== "bridge") return;
    const sceneId = complete ? state.mode.targetSceneId : state.mode.originSceneId;
    const galacticArrival = sceneId === "milky-way";
    const stellarArrival =
      ["solar-neighborhood", "galactic-center-neighborhood"].includes(sceneId) &&
      [state.mode.originSceneId, state.mode.targetSceneId].includes("solar-system");
    const bar = [
      "earth",
      "human",
      "solar-system",
      "solar-neighborhood",
      "galactic-center-neighborhood",
      "milky-way",
    ].includes(sceneId)
      ? captureBridgeBar(
          sceneId === "earth"
            ? EARTH_COMPARISON_METERS
            : galacticArrival
              ? MILKY_WAY_COMPARISON_METERS
              : stellarArrival
                ? STELLAR_COMPARISON_METERS
                : sceneRegistry[sceneId].referenceLengthMeters,
        )
      : null;
    setBusy(Boolean(bar));
    setSceneEntry(
      bar
        ? {
            sceneId,
            bar,
            kind:
              sceneId === "earth" || stellarArrival || galacticArrival ? "comparison" : "reference",
          }
        : null,
    );
    if (complete) state.completeBridge();
    else state.cancelBridge();
  };
  const [entryBar, setEntryBar] = useState<BarSnapshot | null>(null);
  const navigate = async (direction: "previous" | "next") => {
    if (busy || navigationLock.current) return;
    if (state.mode.kind === "bridge") bridgeRef.current?.navigate(direction);
    else {
      let from = state.mode.sceneId;
      const exit = isSolarWorld(from) ? sceneRef.current?.exitIntent(direction) : null;
      if (exit === "sun") from = "earth-sun";
      const outerDeparture = exit === "outer-exit" || exit === "outer-direct";
      if (outerDeparture) from = "solar-system";
      const target = sceneRegistry[from][direction];
      const connected = hasDirectBarTransfer(from, target);
      if (!target) return;
      navigationLock.current = true;
      setBusy(true);
      if (exit === "inner-preset") {
        setSceneEntry(null);
        if (await sceneRef.current?.zoomToScene("earth-sun")) state.navigateToScene("earth-sun");
        release();
        return;
      }
      if (exit === "outer-preset") {
        setSceneEntry(null);
        if (await sceneRef.current?.zoomToScene("solar-system"))
          state.navigateToScene("solar-system");
        release();
        return;
      }
      if (outerDeparture) {
        setSceneEntry(null);
        if (exit === "outer-exit" && !(await sceneRef.current?.zoomToScene("solar-system", 650))) {
          release();
          return;
        }
        state.navigateToScene("solar-system");
        // Commit the outer reference carrier before capture, including reduced motion.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        if (exit === "outer-exit") await transitionDelay(220);
      }
      const recovery = !exit && isSolarWorld(from) ? sceneRef.current?.recoveryPreset() : null;
      if (recovery) {
        setSceneEntry(null);
        if (await sceneRef.current?.zoomToScene(recovery)) state.navigateToScene(recovery);
        release();
        return;
      }
      if (isContinuousSolarEdge(from, target)) {
        setSceneEntry(null);
        if (await sceneRef.current?.zoomToScene(target)) state.navigateMain(direction);
        release();
        return;
      }
      if (from === "sun" && target === "earth-sun") cameraStateStore.delete(cameraStateKey(target));
      const keep: BarKind | "none" = !(
        connected || mainNavigationMode(from, direction).kind === "bridge"
      )
        ? "none"
        : (from === "earth" && direction === "previous") ||
            ([
              "earth-moon",
              "sun",
              "earth-sun",
              "solar-neighborhood",
              "galactic-center-neighborhood",
              "milky-way",
              "local-group",
              "virgo",
              "bao",
            ].includes(from) &&
              direction === "previous")
          ? "comparison"
          : "reference";
      if (!(await sceneRef.current?.prepareDeparture(keep))) {
        release();
        return;
      }
      const bar = connected
        ? captureReferenceBar(direction === "next" ? "reference" : "comparison")
        : null;
      setSceneEntry(
        bar && target
          ? {
              sceneId: target,
              bar,
              kind: direction === "previous" ? "reference" : "comparison",
              delay: 0,
            }
          : null,
      );
      setEntryBar(
        captureReferenceBar(
          ["earth", "solar-neighborhood", "galactic-center-neighborhood", "milky-way"].includes(
            state.mode.sceneId,
          ) && direction === "previous"
            ? "comparison"
            : "reference",
        ),
      );
      state.navigateMain(
        direction,
        exit === "sun" ? "earth-sun" : outerDeparture ? "solar-system" : undefined,
      );
      if (!bar) release();
    }
  };

  const currentId = state.mode.kind === "scene" ? state.mode.sceneId : state.mode.originSceneId;
  const current = sceneRegistry[currentId];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <a
            href={`https://d1ssk.github.io/interactive-physics-olio${state.locale === "ja" ? "/ja" : ""}`}
          >
            {translate(state.locale, "app.parentName")}
          </a>
          <strong>{translate(state.locale, "app.name")}</strong>
        </div>
        <LanguageSwitch locale={state.locale} onChange={state.setLocale} />
      </header>

      <ScaleAxis
        sceneId={currentId}
        locale={state.locale}
        onNavigate={(id) => {
          if (busy) return;
          setSceneEntry(null);
          if (isSolarWorld(id)) cameraStateStore.delete(cameraStateKey(id));
          state.navigateToScene(id);
        }}
      />
      <main className="app-main">
        {state.mode.kind === "scene" ? (
          <SceneView
            onFocusBusyChange={(value) => {
              navigationLock.current = value;
              setBusy(value);
            }}
            autoSolarLabel={!busy}
            observationDate={observationDate}
            onObservationDateChange={setObservationDate}
            ref={sceneRef}
            onArrivalComplete={completeSceneArrival}
            key={isSolarWorld(state.mode.sceneId) ? "solar-world" : state.mode.sceneId}
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

type SceneControls = {
  exitIntent: SceneHostControls["exitIntent"];
  recoveryPreset: () => "earth-sun" | "solar-system" | null;
  prepareDeparture: (kind: BarKind | "none") => Promise<boolean>;
  zoomToScene: (id: SceneId, duration?: number) => Promise<boolean>;
};

function SceneView({
  onFocusBusyChange,
  autoSolarLabel,
  observationDate,
  onObservationDateChange,
  ref,
  onArrivalComplete: release,
  sceneId,
  entryBar,
  entryKind,
  entryDelay,
}: {
  onFocusBusyChange: (value: boolean) => void;
  autoSolarLabel: boolean;
  observationDate: string;
  onObservationDateChange: (value: string) => void;
  ref?: Ref<SceneControls>;
  onArrivalComplete: () => void;
  sceneId: SceneId;
  entryBar?: BarSnapshot | null;
  entryKind?: "reference" | "comparison";
  entryDelay?: number;
}): React.JSX.Element {
  const state = useAppState();
  const hostRef = useRef<SceneHostControls>(null);
  const [barPair, setBarPair] = useState<readonly [number, number] | null>(null);
  const [zooming, setZooming] = useState(false);
  const [ready, setReady] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [galaxyVariant, setGalaxyVariant] = useState<GalaxyVariant>("volume");
  const [volumeStatus, setVolumeStatus] = useState<VolumeStatus>("idle");
  const [showAllStarLabels, setShowAllStarLabels] = useState(false);
  const [representativeDepths, setRepresentativeDepths] = useState(false);
  const [colorByCatalog, setColorByCatalog] = useState(false);
  const [selectedGalaxyId, setSelectedGalaxyId] = useState<number | null>(null);
  const [showAllGalaxyLabels, setShowAllGalaxyLabels] = useState(false);
  const [previewStarId, setPreviewStarId] = useState<number | null>(null);
  const [selectedStarId, setSelectedStarId] = useState<number | null>(null);
  const [baoLayerMode, setBaoLayerMode] = useState<BaoLayerMode>("both");
  const [baoReveal, setBaoReveal] = useState(false);
  const [baoSliceFraction, setBaoSliceFraction] = useState(0.5);
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
      exitIntent: (direction) => hostRef.current?.exitIntent(direction) ?? null,
      recoveryPreset: () => hostRef.current?.recoveryPreset() ?? null,
      async zoomToScene(id, duration) {
        setZooming(true);
        setBarsHidden(false);
        setOnlyBar(null);
        const completed = await hostRef.current?.animateTo(sceneRegistry[id], duration);
        if (mounted.current) setZooming(false);
        return Boolean(completed);
      },
      async prepareDeparture(kind) {
        setDeparting(true);
        // Preserve the explored view when the connecting segment is wholly in frame.
        // Hidden bars still have physical endpoints and are restored below.
        if (
          ["milky-way", "local-group", "virgo", "bao"].includes(sceneId) &&
          kind !== "none" &&
          !hostRef.current?.isBarFullyInView(kind)
        ) {
          if (!(await hostRef.current?.animateTo(sceneRegistry[sceneId], 650))) {
            if (mounted.current) setDeparting(false);
            return false;
          }
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          if (!mounted.current) return false;
        }
        setOnlyBar(kind);
        if (barsHidden && kind !== "none") {
          setBarsHidden(false);
          await transitionDelay(BAR_TIMING.reveal);
        }
        await transitionDelay(BAR_TIMING.remove);
        return mounted.current;
      },
    }),
    [barsHidden, sceneId],
  );

  const scene = sceneRegistry[sceneId];
  const Scene = scene.component;

  return (
    <section
      className={`scene-view ${sceneId}-view ${departing ? "is-departing" : ""} ${entryBar && arrived ? "is-arriving" : ""}`}
    >
      <Suspense
        fallback={<div className="loading-state">{translate(state.locale, "loading.scene")}</div>}
      >
        <SceneHost
          ref={hostRef}
          metadata={scene}
          locale={state.locale}
          resetVersion={state.resetVersion}
          onSolarViewChange={autoSolarLabel ? state.navigateToScene : undefined}
          onBarPairChange={setBarPair}
        >
          <BarVisibilityContext
            value={{ hidden: barsHidden || Boolean(entryBar && !arrived), only: onlyBar }}
          >
            <Scene
              baoLayerMode={baoLayerMode}
              baoReveal={baoReveal}
              baoSliceFraction={baoSliceFraction}
              representativeDepths={representativeDepths}
              colorByCatalog={colorByCatalog}
              selectedGalaxyId={selectedGalaxyId}
              showAllGalaxyLabels={showAllGalaxyLabels}
              galaxyVariant={galaxyVariant}
              volumeStatus={volumeStatus}
              onVolumeStatusChange={setVolumeStatus}
              active
              showAllStarLabels={showAllStarLabels}
              previewStarId={previewStarId}
              selectedStarId={selectedStarId}
              observationDate={observationDate}
              locale={state.locale}
              metadata={scene}
              onReady={() => setReady(true)}
              entryBarKind={entryKind}
              referenceBarVisible={!entryBar || arrived}
            />
          </BarVisibilityContext>
        </SceneHost>
      </Suspense>
      {[
        "human",
        "earth",
        "earth-moon",
        "sun",
        "earth-sun",
        "solar-system",
        "solar-neighborhood",
        "galactic-center-neighborhood",
        "milky-way",
        "local-group",
        "virgo",
        "bao",
      ].includes(scene.id) && (
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
        baoLayerMode={baoLayerMode}
        onBaoLayerModeChange={setBaoLayerMode}
        baoReveal={baoReveal}
        onBaoRevealChange={setBaoReveal}
        baoSliceFraction={baoSliceFraction}
        onBaoSliceFractionChange={setBaoSliceFraction}
        representativeDepths={representativeDepths}
        onRepresentativeDepthsChange={setRepresentativeDepths}
        colorByCatalog={colorByCatalog}
        onColorByCatalogChange={setColorByCatalog}
        onPreviewStarChange={setPreviewStarId}
        selectedGalaxyId={selectedGalaxyId}
        onSelectedGalaxyIdChange={setSelectedGalaxyId}
        showAllGalaxyLabels={showAllGalaxyLabels}
        onShowAllGalaxyLabelsChange={setShowAllGalaxyLabels}
        onGalaxyFocus={async () => {
          const galaxy = LOCAL_GROUP_GALAXIES.find((g) => g.id === selectedGalaxyId);
          if (!galaxy || zooming || departing) return;
          const target = galaxyPosition(galaxy, scene.metersPerSceneUnit);
          setZooming(true);
          onFocusBusyChange(true);
          await hostRef.current?.animateTo(
            {
              ...scene,
              defaultViewportExtentMeters: Math.max(
                (galaxy.radiusMeters ?? scene.metersPerSceneUnit * 0.01) * 5,
                scene.metersPerSceneUnit * 0.0001,
              ),
              camera: { ...scene.camera, target, position: [target[0], target[1], target[2] + 40] },
            },
            650,
          );
          if (mounted.current) setZooming(false);
          onFocusBusyChange(false);
        }}
        galaxyVariant={galaxyVariant}
        volumeStatus={volumeStatus}
        onGalaxyVariantChange={(variant) => {
          setVolumeStatus("idle");
          setGalaxyVariant(variant);
        }}
        showAllStarLabels={showAllStarLabels}
        onShowAllStarLabelsChange={setShowAllStarLabels}
        selectedStarId={selectedStarId}
        onSelectedStarIdChange={setSelectedStarId}
        barPair={barPair}
        observationDate={observationDate}
        onObservationDateChange={onObservationDateChange}
        scene={scene}
        locale={state.locale}
        onLateral={state.navigateLateral}
        onReset={state.resetCamera}
        barsHidden={barsHidden}
        onBarsHiddenChange={setBarsHidden}
        transitioning={zooming || departing || Boolean(entryBar && !arrived)}
      />
    </section>
  );
}
