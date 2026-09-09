import { HUMAN_REFERENCE_METERS } from "../scenes/human/humanData";
import { EARTH_DIAMETER_METERS } from "../scenes/earth/earthData";
import { planBridge } from "./bridgePlanner";

// Keep the physical comparison lengths stable across scene and viewport changes.
const plan = planBridge({
  fromSceneId: "human",
  toSceneId: "earth",
  fromMeters: HUMAN_REFERENCE_METERS,
  toMeters: EARTH_DIAMETER_METERS,
  availableWidthPx: 900,
});
export const HUMAN_EARTH_BRIDGE_VALUES = [
  HUMAN_REFERENCE_METERS,
  ...plan.steps.slice(0, -1).map((step) => step.toMeters),
];
export const EARTH_COMPARISON_METERS = HUMAN_EARTH_BRIDGE_VALUES.at(-1)!;
