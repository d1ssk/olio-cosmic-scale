import { useEffect, useId, useState } from "react";
import { translate, type Locale } from "../i18n";
import { LIGHT_YEAR_METERS, PARSEC_METERS } from "../physics/constants";
import { FAMOUS_STAR_DISTANCES } from "../scenes/stellar-neighborhood/famousStarDistances";
import { STELLAR_SOURCES } from "../scenes/stellar-neighborhood/stellarData";

export function StarDistanceTable({
  locale,
  onPreviewStarChange,
  disabled = false,
}: {
  locale: Locale;
  onPreviewStarChange?: (id: number | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  useEffect(() => {
    if (disabled) onPreviewStarChange?.(null);
    return () => onPreviewStarChange?.(null);
  }, [disabled, onPreviewStarChange]);
  const close = () => {
    setOpen(false);
    onPreviewStarChange?.(null);
  };
  const title = translate(locale, "stellar.distances.title");
  const format = (value: number, approximate: boolean) => {
    const formatted = new Intl.NumberFormat(locale, {
      maximumSignificantDigits: approximate ? 2 : 3,
    }).format(value);
    return approximate
      ? translate(locale, "stellar.distances.approximate", { value: formatted })
      : formatted;
  };
  return (
    <div
      className="star-distance-control"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span aria-hidden="true">{open ? "▼" : "▲"}</span> {title}
      </button>
      <div id={panelId} className="star-distance-panel" hidden={!open || disabled}>
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">{translate(locale, "stellar.distances.star")}</th>
              <th scope="col">ly</th>
              <th scope="col">pc</th>
            </tr>
          </thead>
          <tbody>
            {FAMOUS_STAR_DISTANCES.map((star) => (
              <tr key={star.id}>
                <th scope="row">
                  {star.sceneStarId !== null ? (
                    <button
                      type="button"
                      className="star-distance-name"
                      title={translate(locale, "stellar.distances.highlight")}
                      onPointerEnter={() => onPreviewStarChange?.(star.sceneStarId)}
                      onPointerLeave={() => onPreviewStarChange?.(null)}
                      onFocus={() => onPreviewStarChange?.(star.sceneStarId)}
                      onBlur={() => onPreviewStarChange?.(null)}
                      onClick={() => onPreviewStarChange?.(star.sceneStarId)}
                    >
                      {translate(locale, star.nameKey)}
                    </button>
                  ) : star.sourceUrl ? (
                    <a href={star.sourceUrl} target="_blank" rel="noreferrer">
                      {translate(locale, star.nameKey)}
                    </a>
                  ) : (
                    translate(locale, star.nameKey)
                  )}
                </th>
                <td>{format(star.distanceMeters / LIGHT_YEAR_METERS, star.approximate)}</td>
                <td>{format(star.distanceMeters / PARSEC_METERS, star.approximate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{translate(locale, "stellar.distances.note")}</p>
        <a href={STELLAR_SOURCES[0].url} target="_blank" rel="noreferrer">
          HYG v4.1 · David Nash / Astronexus · CC BY-SA 4.0
        </a>
      </div>
    </div>
  );
}
