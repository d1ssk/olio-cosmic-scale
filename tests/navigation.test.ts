import { describe, expect, it } from "vitest";
import { mainNavigationMode, sceneFromSearch, urlWithState } from "../src/app/navigation";
import {
  canonicalBridgeEndpoints,
  hierarchyPosition,
  MAIN_SCENE_ORDER,
  sceneRegistry,
} from "../src/app/sceneRegistry";

describe("scene graph", () => {
  it("contains twelve vertical levels and one lateral sibling", () => {
    expect(MAIN_SCENE_ORDER).toHaveLength(12);
    expect(MAIN_SCENE_ORDER).not.toContain("galactic-center-neighborhood");
    expect(sceneRegistry["solar-neighborhood"].lateralSibling).toBe("galactic-center-neighborhood");
    expect(sceneRegistry["galactic-center-neighborhood"].lateralSibling).toBe("solar-neighborhood");
    expect(hierarchyPosition("galactic-center-neighborhood")).toBe(7);
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

describe("main navigation bridge bypass", () => {
  it.each([
    ["earth", "earth-moon"],
    ["earth-moon", "sun"],
    ["sun", "earth-sun"],
    ["earth-sun", "solar-system"],
    ["milky-way", "local-group"],
    ["local-group", "virgo"],
    ["virgo", "bao"],
    ["bao", "observable-universe"],
  ] as const)("skips the bridge between %s and %s in both directions", (lower, upper) => {
    expect(mainNavigationMode(lower, "next")).toEqual({ kind: "scene", sceneId: upper });
    expect(mainNavigationMode(upper, "previous")).toEqual({ kind: "scene", sceneId: lower });
  });
  it("preserves multi-step bridges and graph endpoints", () => {
    expect(mainNavigationMode("human", "next").kind).toBe("bridge");
    expect(mainNavigationMode("earth", "previous").kind).toBe("bridge");
    expect(mainNavigationMode("solar-system", "next").kind).toBe("bridge");
    expect(mainNavigationMode("galactic-center-neighborhood", "next")).toEqual({
      kind: "bridge",
      originSceneId: "galactic-center-neighborhood",
      targetSceneId: "milky-way",
    });
    expect(mainNavigationMode("human", "previous")).toEqual({ kind: "scene", sceneId: "human" });
    expect(mainNavigationMode("observable-universe", "next")).toEqual({
      kind: "scene",
      sceneId: "observable-universe",
    });
  });
});
