import {
  AU_METERS,
  GIGAPARSEC_METERS,
  LIGHT_YEAR_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
} from "./constants";

export type Length = Readonly<{ meters: number }>;

export type UnitId =
  | "cm"
  | "m"
  | "km"
  | "Mm"
  | "Gm"
  | "Tm"
  | "Pm"
  | "Em"
  | "Zm"
  | "Ym"
  | "AU"
  | "ly"
  | "kly"
  | "Mly"
  | "Gly"
  | "pc"
  | "kpc"
  | "Mpc"
  | "Gpc";

const UNITS: Record<UnitId, number> = {
  cm: 1e-2,
  m: 1,
  km: 1e3,
  Mm: 1e6,
  Gm: 1e9,
  Tm: 1e12,
  Pm: 1e15,
  Em: 1e18,
  Zm: 1e21,
  Ym: 1e24,
  AU: AU_METERS,
  ly: LIGHT_YEAR_METERS,
  kly: LIGHT_YEAR_METERS * 1e3,
  Mly: LIGHT_YEAR_METERS * 1e6,
  Gly: LIGHT_YEAR_METERS * 1e9,
  pc: PARSEC_METERS,
  kpc: PARSEC_METERS * 1e3,
  Mpc: MEGAPARSEC_METERS,
  Gpc: GIGAPARSEC_METERS,
};

export function length(meters: number): Length {
  if (!Number.isFinite(meters) || meters <= 0) {
    throw new RangeError("A physical length must be a finite positive number of meters.");
  }
  return { meters };
}

export function fromUnit(value: number, unit: UnitId): Length {
  return length(value * UNITS[unit]);
}

export function inUnit(value: Length, unit: UnitId): number {
  return value.meters / UNITS[unit];
}

export type LengthFormatOptions = {
  unit: UnitId;
  locale: "ja" | "en";
  significantDigits?: number;
};

export function formatLength(
  value: Length,
  { unit, locale, significantDigits = 3 }: LengthFormatOptions,
): string {
  const numericValue = inUnit(value, unit);
  const useScientific = Math.abs(numericValue) >= 1e7 || Math.abs(numericValue) < 1e-3;
  const formatted = new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US", {
    maximumSignificantDigits: significantDigits,
    notation: useScientific ? "scientific" : "standard",
    useGrouping: true,
  }).format(numericValue);

  return `${formatted} ${unit}`;
}

export function formatLengthSet(
  value: Length,
  primaryUnit: UnitId,
  secondaryUnits: readonly UnitId[],
  locale: "ja" | "en",
): { primary: string; secondary: string[] } {
  return {
    primary: formatLength(value, { unit: primaryUnit, locale }),
    secondary: secondaryUnits.map((unit) => formatLength(value, { unit, locale })),
  };
}

export function chooseNaturalUnit(value: Length): UnitId {
  const meters = value.meters;
  if (meters >= 0.1 * GIGAPARSEC_METERS) return "Gpc";
  if (meters >= 0.1 * MEGAPARSEC_METERS) return "Mpc";
  if (meters >= 100 * PARSEC_METERS) return "kpc";
  if (meters >= 0.5 * PARSEC_METERS) return "pc";
  if (meters >= AU_METERS) return "AU";
  if (meters >= 1e9) return "Gm";
  if (meters >= 1e6) return "Mm";
  if (meters >= 1e3) return "km";
  return "m";
}
