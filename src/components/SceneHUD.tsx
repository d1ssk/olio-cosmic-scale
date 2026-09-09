import { EARTH_MOON_SOURCES } from "../scenes/earth-moon/earthMoonData";
import { hierarchyPosition, MAIN_SCENE_ORDER } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import type { SceneDefinition } from "../scenes/types";
import { EARTH_TEXTURE } from "../scenes/earth/earthData";
import { HACHIKO_MODEL } from "../scenes/human/humanData";
import { ScaleReadout } from "./ScaleReadout";

type SceneHUDProps = {
  scene: SceneDefinition;
  locale: Locale;
  onLateral: () => void;
  onReset: () => void;
  barsHidden: boolean;
  onBarsHiddenChange: (hidden: boolean) => void;
  transitioning?: boolean;
};

export function SceneHUD({
  scene,
  locale,
  onLateral,
  onReset,
  barsHidden,
  onBarsHiddenChange,
  transitioning,
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

      <div
        className={`scene-status ${scene.id === "human" || scene.id === "earth" || scene.id === "earth-moon" ? "human-status" : ""}`}
      >
        {scene.id === "human" ? (
          <>
            <span>{translate(locale, "human.calibration")}</span>
            <span>
              <a href={HACHIKO_MODEL.sourceUrl} target="_blank" rel="noreferrer">
                {HACHIKO_MODEL.title}
              </a>
              {" · "}
              <a href={HACHIKO_MODEL.authorUrl} target="_blank" rel="noreferrer">
                {HACHIKO_MODEL.author}
              </a>
              {" · "}
              <a href={HACHIKO_MODEL.licenseUrl} target="_blank" rel="noreferrer">
                {HACHIKO_MODEL.license}
              </a>
            </span>
          </>
        ) : scene.id === "earth" || scene.id === "earth-moon" ? (
          <>
            <span>
              {translate(
                locale,
                scene.id === "earth-moon" ? "earthMoon.convention" : "earth.convention",
              )}
            </span>
            {scene.id === "earth-moon" && (
              <span>
                <a href={EARTH_MOON_SOURCES.distance} target="_blank" rel="noreferrer">
                  {translate(locale, "earthMoon.sources")}
                </a>
                {" · "}
                <a href={EARTH_MOON_SOURCES.radius} target="_blank" rel="noreferrer">
                  LADEE
                </a>
              </span>
            )}
            <span>
              <a href={EARTH_TEXTURE.sourceUrl} target="_blank" rel="noreferrer">
                {EARTH_TEXTURE.credit} · Blue Marble
              </a>
            </span>
          </>
        ) : (
          <span>{translate(locale, "hud.placeholder")}</span>
        )}
        <span>{translate(locale, "hud.controls")}</span>
      </div>

      <div className="scene-actions">
        <label className="hide-scale-bars">
          <input
            type="checkbox"
            checked={barsHidden}
            disabled={transitioning}
            onChange={(event) => onBarsHiddenChange(event.target.checked)}
          />
          {translate(locale, "action.hideScaleBars")}
        </label>
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
