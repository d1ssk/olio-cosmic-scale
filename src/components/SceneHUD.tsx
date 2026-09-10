import { lazy, Suspense } from "react";
import { SUN_TEXTURE } from "../scenes/sun/sunData";
const EphemerisControls = lazy(() => import("../scenes/earth-sun/EphemerisControls"));
import { EARTH_MOON_SOURCES } from "../scenes/earth-moon/earthMoonData";
import { hierarchyPosition, MAIN_SCENE_ORDER } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import type { SceneDefinition } from "../scenes/types";
import { EARTH_TEXTURE } from "../scenes/earth/earthData";
import { HACHIKO_MODEL } from "../scenes/human/humanData";
import { ScaleReadout } from "./ScaleReadout";

type SceneHUDProps = {
  barPair?: readonly [number, number] | null;
  observationDate: string;
  onObservationDateChange: (value: string) => void;
  scene: SceneDefinition;
  locale: Locale;
  onLateral: () => void;
  onReset: () => void;
  barsHidden: boolean;
  onBarsHiddenChange: (hidden: boolean) => void;
  transitioning?: boolean;
};

export function SceneHUD({
  barPair,
  observationDate,
  onObservationDateChange,
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
        className={`scene-status ${["human", "earth", "earth-moon", "sun", "earth-sun", "solar-system"].includes(scene.id) ? "human-status" : ""}`}
      >
        {(scene.id === "earth-sun" || scene.id === "solar-system") && (
          <Suspense fallback={null}>
            <EphemerisControls
              locale={locale}
              value={observationDate}
              onChange={onObservationDateChange}
              disabled={transitioning}
            />
          </Suspense>
        )}
        <details className="scene-description">
          <summary>{translate(locale, "hud.description")}</summary>
          <div className="scene-description-content">
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
            ) : scene.id === "sun" || scene.id === "earth-sun" || scene.id === "solar-system" ? (
              <>
                <span>
                  {translate(locale, scene.id === "sun" ? "sun.convention" : "earthSun.convention")}
                </span>
                <span>
                  <a href="https://arxiv.org/abs/1510.07674" target="_blank" rel="noreferrer">
                    IAU 2015 B3
                  </a>
                  {" · "}
                  <a href={SUN_TEXTURE.sourceUrl} target="_blank" rel="noreferrer">
                    {SUN_TEXTURE.credit}
                  </a>
                  {" · "}
                  <a href={SUN_TEXTURE.licenseUrl} target="_blank" rel="noreferrer">
                    {SUN_TEXTURE.license}
                  </a>
                </span>
                {(scene.id === "earth-sun" || scene.id === "solar-system") && (
                  <span>
                    <a
                      href="https://github.com/cosinekitty/astronomy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Astronomy Engine
                    </a>
                    {" · "}
                    <a
                      href="https://ssd.jpl.nasa.gov/planets/phys_par.html"
                      target="_blank"
                      rel="noreferrer"
                    >
                      NASA / JPL
                    </a>
                    {" · "}
                    <a
                      href="https://www.jpl.nasa.gov/news/press_kits/cassini.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Cassini
                    </a>
                    {" · "}
                    <a href={EARTH_TEXTURE.sourceUrl} target="_blank" rel="noreferrer">
                      NASA · Blue Marble
                    </a>
                  </span>
                )}
              </>
            ) : (
              <span>{translate(locale, "hud.placeholder")}</span>
            )}
            <span>{translate(locale, "hud.controls")}</span>
          </div>
        </details>
      </div>

      <div className="scene-actions">
        {!barsHidden && !transitioning && barPair && (
          <span className="scene-bar-ratio" data-scene-bar-ratio>
            {translate(locale, "hud.barRatio", {
              ratio: (barPair[1] / barPair[0]).toLocaleString(locale, {
                maximumSignificantDigits: 3,
              }),
            })}
          </span>
        )}
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
          <button type="button" disabled={transitioning} onClick={onReset}>
            {translate(locale, "action.reset")}
          </button>
        </div>
      </div>
    </aside>
  );
}
