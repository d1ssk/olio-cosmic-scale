import { VIRGO_SOURCES } from "../scenes/virgo/virgoData";
import { LOCAL_GROUP_GALAXIES, LOCAL_GROUP_SOURCES } from "../scenes/local-group/localGroupData";
import { LocalGroupControls } from "../scenes/local-group/LocalGroupControls";
import { StarDistanceTable } from "./StarDistanceTable";
import type { GalaxyVariant, VolumeStatus } from "../scenes/milky-way/volumeData";
import { MILKY_WAY_SOURCES } from "../scenes/milky-way/milkyWayData";
import {
  BULGE_DENSITY_PER_PC3,
  BULGE_STAR_COUNT,
  NEARBY_STARS,
  STELLAR_SOURCES,
} from "../scenes/stellar-neighborhood/stellarData";
import { lazy, Suspense } from "react";
import { SUN_TEXTURE } from "../scenes/sun/sunData";
const VirgoControls = lazy(() => import("../scenes/virgo/VirgoControls"));
const BaoControls = lazy(() => import("../scenes/bao/BaoControls"));
const EphemerisControls = lazy(() => import("../scenes/earth-sun/EphemerisControls"));
import { EARTH_MOON_SOURCES } from "../scenes/earth-moon/earthMoonData";
import { hierarchyPosition, MAIN_SCENE_ORDER } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import type { BaoLayerMode, SceneDefinition } from "../scenes/types";
import { EARTH_TEXTURE } from "../scenes/earth/earthData";
import { HACHIKO_MODEL } from "../scenes/human/humanData";
import { ScaleReadout } from "./ScaleReadout";

type SceneHUDProps = {
  baoLayerMode?: BaoLayerMode;
  onBaoLayerModeChange?: (mode: BaoLayerMode) => void;
  baoReveal?: boolean;
  onBaoRevealChange?: (value: boolean) => void;
  baoSliceFraction?: number;
  onBaoSliceFractionChange?: (value: number) => void;
  representativeDepths?: boolean;
  onRepresentativeDepthsChange?: (value: boolean) => void;
  colorByCatalog?: boolean;
  onColorByCatalogChange?: (value: boolean) => void;
  onPreviewStarChange?: (id: number | null) => void;
  selectedGalaxyId?: number | null;
  onSelectedGalaxyIdChange?: (id: number | null) => void;
  showAllGalaxyLabels?: boolean;
  onShowAllGalaxyLabelsChange?: (value: boolean) => void;
  onGalaxyFocus?: () => void;
  galaxyVariant?: GalaxyVariant;
  volumeStatus?: VolumeStatus;
  onGalaxyVariantChange?: (variant: GalaxyVariant) => void;
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
  baoLayerMode = "both",
  onBaoLayerModeChange,
  baoReveal = false,
  onBaoRevealChange,
  baoSliceFraction = 0.5,
  onBaoSliceFractionChange,
  representativeDepths,
  onRepresentativeDepthsChange,
  colorByCatalog,
  onColorByCatalogChange,
  onPreviewStarChange,
  selectedGalaxyId,
  onSelectedGalaxyIdChange,
  showAllGalaxyLabels,
  onShowAllGalaxyLabelsChange,
  onGalaxyFocus,
  galaxyVariant = "volume",
  volumeStatus = "idle",
  onGalaxyVariantChange,
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
        {scene.lateralSibling && (
          <button
            className="stellar-sibling-navigation"
            type="button"
            disabled={transitioning}
            onClick={onLateral}
          >
            {translate(
              locale,
              scene.id === "galactic-center-neighborhood" ? "action.return" : "action.compare",
            )}
          </button>
        )}
      </div>

      <ScaleReadout
        meters={scene.referenceLengthMeters}
        primaryUnit={scene.preferredPrimaryUnit}
        secondaryUnits={scene.secondaryUnits}
        locale={locale}
      />

      <div
        className={`scene-status ${["human", "earth", "earth-moon", "sun", "earth-sun", "solar-system", "solar-neighborhood", "galactic-center-neighborhood", "milky-way", "local-group", "virgo", "bao"].includes(scene.id) ? "human-status" : ""}`}
      >
        {scene.id === "bao" && (
          <Suspense fallback={null}>
            <BaoControls
              locale={locale}
              layerMode={baoLayerMode}
              onLayerModeChange={onBaoLayerModeChange}
              reveal={baoReveal}
              onRevealChange={onBaoRevealChange}
              sliceFraction={baoSliceFraction}
              onSliceFractionChange={onBaoSliceFractionChange}
              disabled={transitioning}
            />
          </Suspense>
        )}
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
        {scene.id === "virgo" && (
          <Suspense fallback={null}>
            <VirgoControls
              locale={locale}
              representativeDepths={representativeDepths}
              onRepresentativeDepthsChange={onRepresentativeDepthsChange}
              colorByCatalog={colorByCatalog}
              onColorByCatalogChange={onColorByCatalogChange}
              disabled={transitioning}
            />
          </Suspense>
        )}
        {scene.id === "local-group" && (
          <>
            <p className="stellar-summary">
              {translate(locale, "localGroup.summary", { count: LOCAL_GROUP_GALAXIES.length })}
            </p>
            <LocalGroupControls
              locale={locale}
              selected={selectedGalaxyId}
              onSelect={onSelectedGalaxyIdChange}
              all={showAllGalaxyLabels}
              onAll={onShowAllGalaxyLabelsChange}
              onFocus={onGalaxyFocus}
              disabled={transitioning}
            />
          </>
        )}
        {scene.id === "milky-way" && (
          <>
            <label className="galaxy-version-control">
              {translate(locale, "milkyWay.version")}
              <select
                value={galaxyVariant}
                disabled={transitioning}
                onChange={(event) => onGalaxyVariantChange?.(event.target.value as GalaxyVariant)}
              >
                <option value="simple">{translate(locale, "milkyWay.simple")}</option>
                <option value="volume">{translate(locale, "milkyWay.volume")}</option>
              </select>
            </label>
            <p className="stellar-summary">
              {translate(
                locale,
                galaxyVariant === "volume" ? "milkyWay.volumeSummary" : "milkyWay.summary",
              )}
            </p>
            {galaxyVariant === "volume" && (
              <p className="volume-load-status" role="status">
                {translate(
                  locale,
                  volumeStatus === "ready"
                    ? "milkyWay.volumeReady"
                    : volumeStatus === "error"
                      ? "milkyWay.volumeError"
                      : "milkyWay.volumeLoading",
                )}
              </p>
            )}
          </>
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
                    {" · "}
                    <a href={EARTH_MOON_SOURCES.lightSecond} target="_blank" rel="noreferrer">
                      BIPM (SI)
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
            ) : scene.id === "bao" ? (
              <>
                <span>{translate(locale, "bao.details")}</span>
                <span>{translate(locale, "bao.caveats")}</span>
                <span>
                  <a
                    href={`${import.meta.env.BASE_URL}data/bao/manifest.json`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    manifest.json
                  </a>
                  {" · "}
                  <a
                    href={`${import.meta.env.BASE_URL}data/bao/provenance.json`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    provenance.json
                  </a>
                </span>
              </>
            ) : scene.id === "virgo" ? (
              <>
                <span>{translate(locale, "virgo.details")}</span>
                <span>{translate(locale, "virgo.uncertainty")}</span>
                {VIRGO_SOURCES.map((source) => (
                  <span key={source.id}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  </span>
                ))}
              </>
            ) : scene.id === "local-group" ? (
              <>
                <span>{translate(locale, "localGroup.details")}</span>
                <span>{translate(locale, "localGroup.catalog")}</span>
                {LOCAL_GROUP_SOURCES.map((source) => (
                  <span key={source.id}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  </span>
                ))}
              </>
            ) : scene.id === "milky-way" ? (
              <>
                <span>
                  {translate(
                    locale,
                    galaxyVariant === "volume"
                      ? "milkyWay.volumeConvention"
                      : "milkyWay.convention",
                  )}
                </span>
                {galaxyVariant === "volume" && (
                  <span>
                    <a href="https://openspaceproject.com" target="_blank" rel="noreferrer">
                      OpenSpace Team
                    </a>
                    {" · "}
                    <a
                      href={`${import.meta.env.BASE_URL}models/milky-way/LICENSE-OpenSpace.md`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      MIT License
                    </a>
                  </span>
                )}
                {MILKY_WAY_SOURCES.filter(
                  (source) =>
                    galaxyVariant === "volume" || source.id !== "openspace-milky-way-volume",
                ).map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                ))}
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

      {scene.id === "solar-neighborhood" && (
        <StarDistanceTable
          locale={locale}
          disabled={transitioning}
          onPreviewStarChange={onPreviewStarChange}
        />
      )}

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
          <button type="button" disabled={transitioning} onClick={onReset}>
            {translate(locale, "action.reset")}
          </button>
        </div>
      </div>
    </aside>
  );
}
