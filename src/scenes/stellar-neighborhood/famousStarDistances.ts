import catalog from "./famous-star-distances.json";
import { PARSEC_METERS } from "../../physics/constants";
import type { TranslationKey } from "../../i18n";

/** HYG v4.1 plus documented published estimates; see README.md for provenance. */
export const FAMOUS_STAR_DISTANCES = catalog.map(({ id, distancePc, approximate, sourceUrl }) => ({
  id,
  nameKey: `stellar.distanceStar.${id}` as TranslationKey,
  approximate: approximate ?? false,
  sourceUrl,
  distanceMeters: distancePc * PARSEC_METERS,
}));
