import { describe, expect, it } from "vitest";
import { metersToSceneUnits, physicalPointToScene } from "../src/physics/coordinates";

describe("scene coordinate normalization", () => {
  it("keeps physical data separate from render units", () => {
    expect(metersToSceneUnits(1e12, 1e11)).toBe(10);
    expect(physicalPointToScene([1e12, -2e12, 0], 1e11)).toEqual([10, -20, 0]);
  });

  it("rejects an invalid scene scale", () => {
    expect(() => metersToSceneUnits(10, 0)).toThrow(RangeError);
  });
});
