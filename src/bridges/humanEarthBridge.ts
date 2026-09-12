import { HUMAN_REFERENCE_METERS } from "../scenes/human/humanData";

// User-adopted comparison lengths, fixed across viewports and both directions.
// The 340 m → 70 km step deliberately exceeds the automatic 1:200 cap (~206).
export const HUMAN_EARTH_BRIDGE_VALUES = [HUMAN_REFERENCE_METERS, 340, 70_000];
export const EARTH_COMPARISON_METERS = HUMAN_EARTH_BRIDGE_VALUES.at(-1)!;
