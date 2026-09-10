import { useState } from "react";
import { Body, HelioVector } from "astronomy-engine";
import { translate, type Locale } from "../../i18n";
import { DATE_MIN, DATE_MAX } from "./earthSunData";
import { parseUtcInput } from "./earthSunModel";
export default function EphemerisControls({
  locale,
  value,
  onChange,
  disabled,
}: {
  locale: Locale;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value.slice(0, 16));
  const valid = parseUtcInput(draft);
  const distance = HelioVector(Body.Earth, new Date(value)).Length();
  return (
    <div className="ephemeris-controls">
      <label>
        {translate(locale, "earthSun.datetime")}
        <input
          type="datetime-local"
          value={draft}
          min={DATE_MIN}
          max={DATE_MAX}
          step={60}
          disabled={disabled}
          aria-invalid={!valid}
          onChange={(event) => {
            const input = event.target.value;
            setDraft(input);
            const date = parseUtcInput(input);
            if (date) onChange(date.toISOString());
          }}
        />
      </label>
      {!valid && <span role="status">{translate(locale, "earthSun.invalidDate")}</span>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          const now = new Date().toISOString().slice(0, 16);
          setDraft(now);
          onChange(now + ":00Z");
        }}
      >
        {translate(locale, "earthSun.today")}
      </button>
      <span>
        {translate(locale, "earthSun.distance", {
          distance: distance.toLocaleString(locale, {
            minimumFractionDigits: 5,
            maximumFractionDigits: 5,
          }),
        })}
      </span>
    </div>
  );
}
