import { translate, type Locale } from "../i18n";

type NavigationControlsProps = {
  locale: Locale;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function NavigationControls({
  locale,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: NavigationControlsProps): React.JSX.Element {
  return (
    <nav className="navigation-controls" aria-label={translate(locale, "app.name")}>
      <button type="button" onClick={onPrevious} disabled={!canPrevious}>
        <span aria-hidden="true">←</span> {translate(locale, "action.previous")}
      </button>
      <button type="button" onClick={onNext} disabled={!canNext}>
        {translate(locale, "action.next")} <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
