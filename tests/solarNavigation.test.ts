import { describe, expect, it } from "vitest";
import {
  visibleSegmentFraction,
  solarExitIntent,
  solarViewLabel,
  visibleBarPair,
} from "../src/scenes/solar-system/solarNavigation";
import { solarPointOpacity, SOLAR_PSF_DIAMETER_PIXELS } from "../src/scenes/sun/sunDisplay";
describe("solar ruler-driven exits", () => {
  it("switches solar labels with hysteresis and deduplicates physical bar lengths", () => {
    expect(solarViewLabel("earth-sun", 20)).toBe("solar-system");
    expect(solarViewLabel("solar-system", 17)).toBe("solar-system");
    expect(solarViewLabel("earth-sun", 17)).toBe("earth-sun");
    expect(solarViewLabel("solar-system", 14)).toBe("earth-sun");
    expect(visibleBarPair([100, 1, 1])).toEqual([1, 100]);
    expect(visibleBarPair([1, 1])).toBe(null);
    expect(solarExitIntent("previous", 0, 0, 0, 0, 0.5, 20)).toBe("inner-preset");
  });
  it("clips whole, partial, absent and edge-on segments including depth", () => {
    expect(visibleSegmentFraction([-0.5, 0, 0], [0.5, 0, 0])).toBe(1);
    expect(visibleSegmentFraction([-2, 0, 0], [2, 0, 0])).toBe(0.5);
    expect(visibleSegmentFraction([-2, 2, 0], [2, 2, 0])).toBe(0);
    expect(visibleSegmentFraction([0, 0, 2], [0.5, 0, 2])).toBe(0);
    expect(visibleSegmentFraction([-2, -2, 0], [2, 2, 0])).toBe(0.5);
  });
  it("exits only when the matching world ruler is sufficiently visible", () => {
    expect(solarExitIntent("previous", 1, 1, 2, 0)).toBe("sun");
    expect(solarExitIntent("previous", 0.9, 1, 2, 0)).toBe(null);
    expect(solarExitIntent("previous", 1, 0.05, 2, 0)).toBe(null);
    expect(solarExitIntent("previous", 1, 1, 0.01, 0)).toBe(null);
    expect(solarExitIntent("next", 1, 1, 2, 40)).toBe("outer-exit");
    expect(solarExitIntent("next", 1, 1, 2, 0)).toBe(null);
    expect(solarExitIntent("next", 0, 0, 0, 0, 1, 60)).toBe("outer-preset");
    expect(solarExitIntent("next", 0, 0, 0, 10, 1, 60)).toBe("outer-exit");
    expect(solarExitIntent("next", 0, 0, 0, 0, 0.5, 60)).toBe(null);
  });
  it("fades in a fixed display PSF only when the physical Sun becomes unresolved", () => {
    expect(SOLAR_PSF_DIAMETER_PIXELS).toBe(24);
    expect(solarPointOpacity(100)).toBe(0);
    expect(solarPointOpacity(6)).toBe(0);
    expect(solarPointOpacity(4)).toBe(0.5);
    expect(solarPointOpacity(2)).toBe(1);
    expect(solarPointOpacity(0.01)).toBe(1);
  });
});
