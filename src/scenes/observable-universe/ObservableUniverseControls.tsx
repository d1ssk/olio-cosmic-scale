import { WEDGE_RENDER } from "./wedgeRendering";
import { translate, type Locale } from "../../i18n";
import type { CmbDisplayMode } from "../types";

export default function ObservableUniverseControls({
  locale,
  mode,
  onModeChange,
  disabled,
  annotationsHidden = false,
  onAnnotationsHiddenChange,
  matter = true,
  galaxies = true,
  onMatterChange,
  onGalaxiesChange,
}: {
  locale: Locale;
  mode: CmbDisplayMode;
  onModeChange?: (mode: CmbDisplayMode) => void;
  disabled?: boolean;
  annotationsHidden?: boolean;
  onAnnotationsHiddenChange?: (value: boolean) => void;
  matter?: boolean;
  galaxies?: boolean;
  onMatterChange?: (value: boolean) => void;
  onGalaxiesChange?: (value: boolean) => void;
}): React.JSX.Element {
  return (
    <div className="observable-controls">
      <label>
        <input
          type="checkbox"
          checked={mode === "temperature" || mode === "both"}
          disabled={disabled}
          onChange={(event) =>
            onModeChange?.(
              event.target.checked
                ? mode === "polarization"
                  ? "both"
                  : "temperature"
                : mode === "both"
                  ? "polarization"
                  : "uniform",
            )
          }
        />
        {translate(locale, "observable.temperatureFluctuations")}
      </label>
      <label>
        <input
          type="checkbox"
          checked={mode === "polarization" || mode === "both"}
          disabled={disabled}
          onChange={(event) =>
            onModeChange?.(
              event.target.checked
                ? mode === "temperature"
                  ? "both"
                  : "polarization"
                : mode === "both"
                  ? "temperature"
                  : "uniform",
            )
          }
        />
        {translate(locale, "observable.eModePolarization")}
      </label>
      <label>
        <input
          type="checkbox"
          checked={matter}
          disabled={disabled}
          onChange={(e) => onMatterChange?.(e.target.checked)}
        />
        {translate(locale, "observable.matter")}
      </label>
      <label>
        <input
          type="checkbox"
          checked={galaxies}
          disabled={disabled}
          onChange={(e) => onGalaxiesChange?.(e.target.checked)}
        />
        {translate(locale, "observable.galaxies")}
      </label>
      <label>
        <input
          type="checkbox"
          checked={annotationsHidden}
          disabled={disabled}
          onChange={(e) => onAnnotationsHiddenChange?.(e.target.checked)}
        />
        {translate(locale, "observable.hideAnnotations")}
      </label>
      <p>{translate(locale, "observable.wedgeNote")}</p>
      <p>
        {translate(locale, "observable.wedgeThickness", { factor: WEDGE_RENDER.thicknessScale })}
      </p>
      <p>{translate(locale, "observable.realizationNote")}</p>
    </div>
  );
}
