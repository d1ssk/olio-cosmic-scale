import {
  BULGE_DENSITY_PER_PC3,
  BULGE_STAR_COUNT,
  NEARBY_STARS,
  STELLAR_SOURCES,
} from "../scenes/stellar-neighborhood/stellarData";
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
  showAllStarLabels?: boolean;
  onShowAllStarLabelsChange?: (value: boolean) => void;
  selectedStarId?: number | null;
  onSelectedStarIdChange?: (value: number | null) => void;
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
  showAllStarLabels,
  onShowAllStarLabelsChange,
  selectedStarId,
  onSelectedStarIdChange,
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
  const stellar = scene.id === "solar-neighborhood" || scene.id === "galactic-center-neighborhood";
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
        className={`scene-status ${["human", "earth", "earth-moon", "sun", "earth-sun", "solar-system", "solar-neighborhood", "galactic-center-neighborhood"].includes(scene.id) ? "human-status" : ""}`}
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
        {stellar && (
          <p className="stellar-summary">
            {translate(
              locale,
              scene.id === "solar-neighborhood" ? "stellar.localSummary" : "stellar.bulgeSummary",
              {
                count: (scene.id === "solar-neighborhood"
                  ? NEARBY_STARS.length
                  : BULGE_STAR_COUNT
                ).toLocaleString(locale),
                density: BULGE_DENSITY_PER_PC3.toFixed(1),
              },
            )}
          </p>
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
            ) : stellar ? (
              <>
                <span>{translate(locale, "stellar.display")}</span>
                <span>
                  {translate(
                    locale,
                    scene.id === "solar-neighborhood" ? "stellar.catalog" : "stellar.model",
                  )}
                </span>
                {STELLAR_SOURCES.map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                ))}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer"
                >
                  HYG · CC BY-SA 4.0
                </a>
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
        {scene.id === "solar-neighborhood" && (
          <div className="stellar-label-controls">
            <label className="hide-scale-bars">
              <input
                type="checkbox"
                checked={showAllStarLabels ?? false}
                disabled={transitioning}
                onChange={(event) => onShowAllStarLabelsChange?.(event.target.checked)}
              />
              {translate(locale, "stellar.allLabels")}
            </label>
            <label className="stellar-picker">
              {translate(locale, "stellar.select")}
              <select
                value={selectedStarId ?? ""}
                disabled={transitioning}
                onChange={(event) =>
                  onSelectedStarIdChange?.(
                    event.target.value === "" ? null : Number(event.target.value),
                  )
                }
              >
                <option value="">{translate(locale, "stellar.hover")}</option>
                {NEARBY_STARS.map((star) => (
                  <option key={star.id} value={star.id}>
                    {star.id === 0 ? translate(locale, "scene.sun.title") : star.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
            <button type="button" disabled={transitioning} onClick={onLateral}>
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
