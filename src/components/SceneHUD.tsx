import { hierarchyPosition, MAIN_SCENE_ORDER } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import type { SceneDefinition } from "../scenes/types";
import { NavigationControls } from "./NavigationControls";
import { ScaleReadout } from "./ScaleReadout";

type SceneHUDProps = {
  scene: SceneDefinition;
  locale: Locale;
  onPrevious: () => void;
  onNext: () => void;
  onLateral: () => void;
  onReset: () => void;
};

export function SceneHUD({
  scene,
  locale,
  onPrevious,
  onNext,
  onLateral,
  onReset,
}: SceneHUDProps): React.JSX.Element {
  const level = hierarchyPosition(scene.id);
  return (
    <aside className="scene-hud">
      <div className="scene-heading">
        <span className="eyebrow">
          {translate(locale, "hud.level", { current: level, total: MAIN_SCENE_ORDER.length })}
        </span>
        <h1>{translate(locale, scene.titleKey)}</h1>
        <p>{translate(locale, scene.originDescriptionKey)}</p>
      </div>

      <ScaleReadout
        meters={scene.referenceLengthMeters}
        primaryUnit={scene.preferredPrimaryUnit}
        secondaryUnits={scene.secondaryUnits}
        locale={locale}
      />

      <div className="scene-status">
        <span>{translate(locale, "hud.placeholder")}</span>
        <span>{translate(locale, "hud.controls")}</span>
      </div>

      <div className="scene-actions">
        <NavigationControls
          locale={locale}
          canPrevious={Boolean(scene.previous)}
          canNext={Boolean(scene.next)}
          onPrevious={onPrevious}
          onNext={onNext}
        />
        <div className="utility-actions">
          {scene.lateralSibling && (
            <button type="button" onClick={onLateral}>
              {translate(
                locale,
                scene.id === "galactic-center-neighborhood" ? "action.return" : "action.compare",
              )}
            </button>
          )}
          <button type="button" onClick={onReset}>
            {translate(locale, "action.reset")}
          </button>
        </div>
      </div>
    </aside>
  );
}
