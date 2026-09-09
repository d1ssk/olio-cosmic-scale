import { en } from "./en";

export type Locale = "ja" | "en";
export type TranslationKey = keyof typeof en;

const LOCALE_STORAGE_KEY = "cosmic-scale-locale";

export function translate(
  locale: Locale,
  key: TranslationKey,
  values: Record<string, string | number> = {},
): string {
  const dictionary = locale === "ja" ? getJapaneseDictionary() : en;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    dictionary[key],
  );
}

// Kept behind a function to avoid an eager circular type import between the dictionaries.
function getJapaneseDictionary(): Record<TranslationKey, string> {
  return japaneseDictionary;
}

import { ja as japaneseDictionary } from "./ja";

export function isLocale(value: string | null): value is Locale {
  return value === "ja" || value === "en";
}

export function resolveInitialLocale({
  search = typeof window === "undefined" ? "" : window.location.search,
  savedLocale = readSavedLocale(),
  browserLanguage = typeof navigator === "undefined" ? "" : navigator.language,
}: {
  search?: string;
  savedLocale?: string | null;
  browserLanguage?: string;
} = {}): Locale {
  const urlLocale = new URLSearchParams(search).get("lang");
  if (isLocale(urlLocale)) return urlLocale;
  if (isLocale(savedLocale)) return savedLocale;
  if (browserLanguage.toLowerCase().startsWith("en")) return "en";
  return "ja";
}

export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable in privacy modes; URL state still works.
  }
}

function readSavedLocale(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}
