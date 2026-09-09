import { FormattedLength } from "./FormattedLength";
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
  locale,
}: ScaleReadoutProps): React.JSX.Element {
  const formatted = formatLengthSet(
    length(meters),
    primaryUnit,
    (["m", "pc", "AU", "ly"] as UnitId[]).filter((unit) => unit !== primaryUnit),
    locale,
  );
  return (
    <section className="scale-readout" aria-label={translate(locale, "hud.reference")}>
      <span className="eyebrow">{translate(locale, "hud.reference")}</span>
      <strong>
        <FormattedLength value={formatted.primary} />
      </strong>
      {formatted.secondary.length > 0 && (
        <div className="secondary-lengths">
          {formatted.secondary.map((value) => (
            <FormattedLength key={value} value={value} />
          ))}
        </div>
      )}
    </section>
  );
}
