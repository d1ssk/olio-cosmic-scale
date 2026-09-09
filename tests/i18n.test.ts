import { describe, expect, it } from "vitest";
import { resolveInitialLocale, translate } from "../src/i18n";

describe("internationalization", () => {
  it("uses URL, saved preference, browser language, then Japanese", () => {
    expect(
      resolveInitialLocale({ search: "?lang=en", savedLocale: "ja", browserLanguage: "ja" }),
    ).toBe("en");
    expect(resolveInitialLocale({ search: "", savedLocale: "en", browserLanguage: "ja" })).toBe(
      "en",
    );
    expect(resolveInitialLocale({ search: "", savedLocale: null, browserLanguage: "en-GB" })).toBe(
      "en",
    );
    expect(resolveInitialLocale({ search: "", savedLocale: null, browserLanguage: "fr" })).toBe(
      "ja",
    );
  });

  it("interpolates translated values", () => {
    expect(translate("ja", "hud.level", { current: 6, total: 11 })).toBe("全11段階中 6");
  });
});
