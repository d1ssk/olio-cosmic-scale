import { lazy, Suspense, useState } from "react";
import { ScaleBridge } from "../bridges/ScaleBridge";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { SceneHUD } from "../components/SceneHUD";
import { translate } from "../i18n";
import { useAppState } from "./appState";
import { sceneRegistry } from "./sceneRegistry";

const SceneHost = lazy(() =>
  import("../scenes/shared/SceneHost").then((module) => ({ default: module.SceneHost })),
);

export function App(): React.JSX.Element {
  const state = useAppState();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <strong>{translate(state.locale, "app.name")}</strong>
          <span>{translate(state.locale, "app.subtitle")}</span>
        </div>
        <LanguageSwitch locale={state.locale} onChange={state.setLocale} />
      </header>

      <main className="app-main">
        {state.mode.kind === "scene" ? (
          <SceneView key={state.mode.sceneId} />
        ) : (
          <ScaleBridge
            key={`${state.mode.originSceneId}-${state.mode.targetSceneId}`}
            originSceneId={state.mode.originSceneId}
            targetSceneId={state.mode.targetSceneId}
            locale={state.locale}
            onCancel={state.cancelBridge}
            onComplete={state.completeBridge}
          />
        )}
      </main>
    </div>
  );
}

function SceneView(): React.JSX.Element {
  const state = useAppState();
  const [ready, setReady] = useState(false);
  if (state.mode.kind !== "scene") throw new Error("SceneView requires scene mode.");

  const scene = sceneRegistry[state.mode.sceneId];
  const Scene = scene.component;

  return (
    <section className="scene-view">
      <Suspense
        fallback={<div className="loading-state">{translate(state.locale, "loading.scene")}</div>}
      >
        <SceneHost metadata={scene} locale={state.locale} resetVersion={state.resetVersion}>
          <Scene active locale={state.locale} metadata={scene} onReady={() => setReady(true)} />
        </SceneHost>
      </Suspense>
      {!ready && <div className="loading-state">{translate(state.locale, "loading.scene")}</div>}
      <SceneHUD
        scene={scene}
        locale={state.locale}
        onPrevious={() => state.navigateMain("previous")}
        onNext={() => state.navigateMain("next")}
        onLateral={state.navigateLateral}
        onReset={state.resetCamera}
      />
    </section>
  );
}
