import { translate, type Locale } from "../../i18n";
import type { LocalGalaxy } from "./localGroupData";
export function galaxyName(g: LocalGalaxy, locale: Locale) {
  const key = {
    "The Galaxy": "localGroup.mw",
    Andromeda: "localGroup.m31",
    Triangulum: "localGroup.m33",
    LMC: "localGroup.lmc",
    SMC: "localGroup.smc",
  } as const;
  return g.name in key ? translate(locale, key[g.name as keyof typeof key]) : g.name;
}
