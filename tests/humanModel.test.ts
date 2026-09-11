import { describe, expect, it } from "vitest";
import { BoxGeometry, Mesh, Box3, Vector3, Group } from "three";
import { modelPlacement } from "../src/scenes/human/humanModel";
import { captureReferenceBar } from "../src/bridges/barTransition";

import { HACHIKO_MODEL, HUMAN_REFERENCE_METERS } from "../src/scenes/human/humanData";

describe("human scene calibration", () => {
  it("preserves proportions and places an offset model on the ground at the adopted SI height", () => {
    const model = new Mesh(new BoxGeometry(2, 4, 3));
    model.position.set(7, 12, -4);
    const placement = modelPlacement(model, HACHIKO_MODEL.displayHeightMeters, 0.17);
    const group = new Group();
    group.scale.setScalar(placement.scale);
    group.position.set(...placement.position);
    group.add(model);
    const bounds = new Box3().setFromObject(group);
    const size = bounds.getSize(new Vector3());
    expect(size.y * 0.17).toBeCloseTo(2.17);
    expect(HUMAN_REFERENCE_METERS).toBe(1.7);
    expect(HUMAN_REFERENCE_METERS / (size.y * 0.17)).toBeCloseTo(1.7 / 2.17);
    expect((placement.referenceBarBase[2] - bounds.max.z) * 0.17).toBeCloseTo(0.25);
    expect(placement.referenceBarBase.slice(0, 2)).toEqual([0, 0]);
    expect(bounds.min.y).toBeCloseTo(0);
    expect(bounds.getCenter(new Vector3()).x).toBeCloseTo(0);
    expect(size.x / size.y).toBeCloseTo(2 / 4);
    expect(size.z / size.y).toBeCloseTo(3 / 4);
  });
  it("captures the orientation and length of the projected scene bar", () => {
    document.body.innerHTML =
      '<svg><line data-scene-reference-bar x1="10" y1="120" x2="10" y2="20" /></svg>';
    expect(captureReferenceBar()).toEqual({ x: 10, y: 120, length: 100, angle: -Math.PI / 2 });
    document.body.innerHTML = "";
    expect(captureReferenceBar()).toBeNull();
  });
});
