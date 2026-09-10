import catalog from "./catalog.json";
import manifest from "./manifest.json";
import { translate, type Locale } from "../../i18n";
import {
  CATALOG_STYLES,
  DISTANCE_STYLES,
  galaxyCatalogStyle,
  type DisplayDistanceKind,
  type VirgoGalaxy,
  displayDistanceKind,
} from "./virgoData";

const catalogCounts = CATALOG_STYLES.map(
  (style) => catalog.filter((g) => galaxyCatalogStyle(g).id === style.id).length,
);
export default function VirgoControls({
  locale,
  colorByCatalog = false,
  representativeDepths = false,
  onRepresentativeDepthsChange,
  onColorByCatalogChange,
  disabled,
}: {
  locale: Locale;
  colorByCatalog?: boolean;
  representativeDepths?: boolean;
  onRepresentativeDepthsChange?: (value: boolean) => void;
  onColorByCatalogChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="local-group-controls virgo-controls">
      <p className="stellar-summary">
        {translate(locale, "virgo.summary", { count: manifest.count.toLocaleString(locale) })}
      </p>
      <p>{translate(locale, "virgo.coverage")}</p>
      <label className="hide-scale-bars virgo-catalog-toggle">
        <input
          type="checkbox"
          checked={representativeDepths}
          disabled={disabled}
          onChange={(e) => onRepresentativeDepthsChange?.(e.target.checked)}
        />
        {translate(locale, "virgo.representativeDepths")}
      </label>
      <p>
        {translate(
          locale,
          representativeDepths ? "virgo.depthCollapsed" : "virgo.depthStatistical",
        )}
      </p>
      <label className="hide-scale-bars virgo-catalog-toggle">
        <input
          type="checkbox"
          checked={colorByCatalog}
          disabled={disabled}
          onChange={(e) => onColorByCatalogChange?.(e.target.checked)}
        />
        {translate(locale, "virgo.colorByCatalog")}
      </label>
      {colorByCatalog && (
        <>
          <div className="virgo-legend">
            {CATALOG_STYLES.map((style, i) => (
              <span key={style.id}>
                <span style={{ color: style.color }}>●</span> {translate(locale, style.key)} ·{" "}
                {catalogCounts[i].toLocaleString(locale)}
              </span>
            ))}
          </div>
          <p>{translate(locale, "virgo.catalogPriority")}</p>
        </>
      )}
      <div className="virgo-legend">
        {(Object.keys(DISTANCE_STYLES) as DisplayDistanceKind[]).map((kind) => (
          <span key={kind}>
            <span style={{ color: colorByCatalog ? "inherit" : DISTANCE_STYLES[kind].color }}>
              {DISTANCE_STYLES[kind].symbol}
            </span>{" "}
            {translate(locale, DISTANCE_STYLES[kind].key)} ·{" "}
            {(catalog as VirgoGalaxy[])
              .filter((g) => displayDistanceKind(g, representativeDepths) === kind)
              .length.toLocaleString(locale)}
          </span>
        ))}
      </div>
    </div>
  );
}
