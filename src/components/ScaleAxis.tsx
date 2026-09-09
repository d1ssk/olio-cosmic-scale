import { MAIN_SCENE_ORDER, sceneRegistry } from "../app/sceneRegistry";
import { translate, type Locale } from "../i18n";
import { formatLength, length } from "../physics/length";
import type { SceneId } from "../scenes/types";

export function ScaleAxis({
  sceneId,
  locale,
  onNavigate,
}: {
  sceneId: SceneId;
  locale: Locale;
  onNavigate: (id: SceneId) => void;
}): React.JSX.Element {
  const scenes = [...MAIN_SCENE_ORDER, "galactic-center-neighborhood" as const];
  return (
    <nav className="scale-axis" aria-label={translate(locale, "axis.label")}>
      <span className="axis-caption">{translate(locale, "axis.label")}</span>
      <div className="axis-scroll">
        <div className="axis-track">
          {Array.from({ length: 28 }, (_, i) => i).map((power) => (
            <span
              className={`axis-tick ${power % 3 === 0 ? "axis-tick-major" : ""}`}
              key={power}
              style={{ left: `${(power / 27) * 100}%` }}
            >
              {power % 3 === 0 && (
                <span>
                  10<sup>{power}</sup>
                </span>
              )}
            </span>
          ))}
          {scenes.map((id) => {
            const scene = sceneRegistry[id];
            const title = translate(locale, scene.titleKey);
            return (
              <button
                key={id}
                type="button"
                className={`axis-marker ${id === "galactic-center-neighborhood" ? "axis-sibling" : ""}`}
                style={{ left: `${(Math.log10(scene.referenceLengthMeters) / 27) * 100}%` }}
                aria-current={id === sceneId ? "step" : undefined}
                aria-label={`${title} · ${formatLength(length(scene.referenceLengthMeters), { unit: scene.preferredPrimaryUnit, locale })}`}
                title={title}
                onClick={() => onNavigate(id)}
              >
                <span className="axis-dot" aria-hidden="true" />
                <span className="axis-name">{title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
