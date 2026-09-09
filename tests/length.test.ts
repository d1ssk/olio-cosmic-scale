import { describe, expect, it } from "vitest";
import { AU_METERS, PARSEC_METERS } from "../src/physics/constants";
import { chooseNaturalUnit, formatLength, fromUnit, inUnit, length } from "../src/physics/length";

describe("canonical lengths", () => {
  it("round-trips astronomical units through SI meters", () => {
    const oneAu = fromUnit(1, "AU");
    expect(oneAu.meters).toBe(AU_METERS);
    expect(inUnit(oneAu, "AU")).toBe(1);
  });

  it("uses the conventional parsec conversion", () => {
    expect(inUnit(length(PARSEC_METERS), "ly")).toBeCloseTo(3.26156, 4);
  });

  it("formats with locale-aware grouping and controlled precision", () => {
    expect(formatLength(length(12_742_000), { unit: "km", locale: "en" })).toBe("12,700 km");
  });

  it("selects astronomical units for interplanetary bridge values", () => {
    expect(chooseNaturalUnit(fromUnit(10_000, "AU"))).toBe("AU");
    expect(chooseNaturalUnit(fromUnit(1, "pc"))).toBe("pc");
  });

  it("rejects non-physical lengths", () => {
    expect(() => length(0)).toThrow(RangeError);
  });
});
