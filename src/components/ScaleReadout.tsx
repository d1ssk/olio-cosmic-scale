import type { Locale } from "../i18n";
import { translate } from "../i18n";
import { formatLengthSet, length, type UnitId } from "../physics/length";

type ScaleReadoutProps = {
  meters: number;
  primaryUnit: UnitId;
  secondaryUnits: readonly UnitId[];
  locale: Locale;
};

export function ScaleReadout({
  meters,
  primaryUnit,
  secondaryUnits,
  locale,
}: ScaleReadoutProps): React.JSX.Element {
  const formatted = formatLengthSet(length(meters), primaryUnit, secondaryUnits, locale);
  return (
    <section className="scale-readout" aria-label={translate(locale, "hud.reference")}>
      <span className="eyebrow">{translate(locale, "hud.reference")}</span>
      <strong>{formatted.primary}</strong>
      {formatted.secondary.length > 0 && <span>{formatted.secondary.join(" · ")}</span>}
    </section>
  );
}
