import { translate, type Locale } from "../../i18n";
import { KILOPARSEC_METERS } from "../../physics/constants";
import { galaxyName } from "./galaxyName";
import { DISK_ORIENTATIONS, LOCAL_GROUP_GALAXIES } from "./localGroupData";

export function LocalGroupControls({
  locale,
  selected,
  onSelect,
  all,
  onAll,
  onFocus,
  disabled,
}: {
  locale: Locale;
  selected?: number | null;
  onSelect?: (id: number | null) => void;
  all?: boolean;
  onAll?: (value: boolean) => void;
  onFocus?: () => void;
  disabled?: boolean;
}) {
  const g = LOCAL_GROUP_GALAXIES.find((g) => g.id === selected);
  const format = (meters: number) =>
    (meters / KILOPARSEC_METERS).toLocaleString(locale, { maximumSignificantDigits: 3 });
  const unknown = translate(locale, "localGroup.unknown");
  const disk = g ? DISK_ORIENTATIONS[g.name] : undefined;
  return (
    <div className="local-group-controls">
      <label className="stellar-picker">
        {translate(locale, "localGroup.select")}
        <select
          value={selected ?? ""}
          disabled={disabled}
          onChange={(e) => onSelect?.(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">{translate(locale, "localGroup.overview")}</option>
          {LOCAL_GROUP_GALAXIES.map((g) => (
            <option key={g.id} value={g.id}>
              {galaxyName(g, locale)}
            </option>
          ))}
        </select>
      </label>
      <label className="hide-scale-bars">
        <input
          type="checkbox"
          checked={all ?? false}
          disabled={disabled}
          onChange={(e) => onAll?.(e.target.checked)}
        />
        {translate(locale, "localGroup.labels")}
      </label>
      <button type="button" disabled={disabled || !g} onClick={onFocus}>
        {translate(locale, "localGroup.focus")}
      </button>
      {g && (
        <div className="local-group-facts" aria-live="polite">
          <div>{translate(locale, "localGroup.type", { type: g.morphology })}</div>
          {g.name !== "The Galaxy" && (
            <div>
              {translate(locale, "localGroup.distance", {
                distance: format(g.distanceMeters),
                plus: g.distancePlusMeters === null ? unknown : format(g.distancePlusMeters),
                minus: g.distanceMinusMeters === null ? unknown : format(g.distanceMinusMeters),
              })}
            </div>
          )}
          <div>
            {translate(locale, `localGroup.size.${g.sizeConvention}`, {
              radius: g.radiusMeters === null ? unknown : format(g.radiusMeters),
              rh: g.halfLightRadiusMeters === null ? unknown : format(g.halfLightRadiusMeters),
            })}
          </div>
          <div>
            {g.name === "The Galaxy"
              ? translate(locale, "localGroup.galacticPlane")
              : disk
                ? translate(locale, "localGroup.diskAngles", { pa: disk.pa, i: disk.inclination })
                : translate(locale, "localGroup.projected", {
                    pa: g.positionAngleDegrees ?? unknown,
                    q: g.ellipticity === null ? unknown : (1 - g.ellipticity).toFixed(2),
                  })}
          </div>
          {g.name !== "The Galaxy" && !disk && <div>{translate(locale, "localGroup.depth")}</div>}
          {(g.distanceFlags || g.shapeFlags || g.morphology.includes("?") || g.comment) && (
            <div>{translate(locale, "localGroup.flagged")}</div>
          )}
        </div>
      )}
    </div>
  );
}
