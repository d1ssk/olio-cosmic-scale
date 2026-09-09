import { describe, expect, it } from "vitest";
import { sceneFromSearch, urlWithState } from "../src/app/navigation";
import {
  canonicalBridgeEndpoints,
  hierarchyPosition,
  MAIN_SCENE_ORDER,
  sceneRegistry,
} from "../src/app/sceneRegistry";

describe("scene graph", () => {
  it("contains eleven vertical levels and one lateral sibling", () => {
    expect(MAIN_SCENE_ORDER).toHaveLength(11);
    expect(MAIN_SCENE_ORDER).not.toContain("galactic-center-neighborhood");
    expect(sceneRegistry["solar-neighborhood"].lateralSibling).toBe("galactic-center-neighborhood");
    expect(sceneRegistry["galactic-center-neighborhood"].lateralSibling).toBe("solar-neighborhood");
    expect(hierarchyPosition("galactic-center-neighborhood")).toBe(6);
  });

  it("normalizes the lateral sibling when finding bridge metadata", () => {
    const [lower, upper] = canonicalBridgeEndpoints("galactic-center-neighborhood", "milky-way");
    expect([lower.id, upper.id]).toEqual(["solar-neighborhood", "milky-way"]);
  });
});

describe("deep links", () => {
  it("loads valid scenes and falls back from invalid ones", () => {
    expect(sceneFromSearch("?scene=virgo")).toBe("virgo");
    expect(sceneFromSearch("?scene=unknown")).toBe("human");
  });

  it("updates scene and language without losing other query state", () => {
    expect(
      urlWithState("https://example.test/app?embed=1#view", {
        sceneId: "sun",
        locale: "en",
      }),
    ).toBe("/app?embed=1&scene=sun&lang=en#view");
  });
});
