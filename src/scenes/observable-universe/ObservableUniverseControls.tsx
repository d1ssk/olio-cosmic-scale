import { translate, type Locale } from "../../i18n";
import type { CmbDisplayMode } from "../types";

export default function ObservableUniverseControls({
  locale,
  mode,
  onModeChange,
  disabled,
}: {
  locale: Locale;
  mode: CmbDisplayMode;
  onModeChange?: (mode: CmbDisplayMode) => void;
  disabled?: boolean;
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
      <p>{translate(locale, "observable.realizationNote")}</p>
    </div>
  );
}
