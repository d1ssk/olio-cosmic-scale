import { translate, type Locale } from "../i18n";

type LanguageSwitchProps = {
  locale: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageSwitch({ locale, onChange }: LanguageSwitchProps): React.JSX.Element {
  return (
    <div className="language-switch" role="group" aria-label={translate(locale, "language.label")}>
      {(["ja", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          className={option === locale ? "is-active" : undefined}
          aria-pressed={option === locale}
          onClick={() => onChange(option)}
        >
          {translate(locale, `language.${option}`)}
        </button>
      ))}
    </div>
  );
}
