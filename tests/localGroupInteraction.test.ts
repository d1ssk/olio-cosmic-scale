import { describe, expect, it } from "vitest";
import { Group, OrthographicCamera, Scene, Vector3 } from "three";
import { Line2, LineGeometry, LineMaterial } from "three-stdlib";
import { projectPhysicalBar, wholeBarInView } from "../src/scenes/shared/barProjection";
import { placeGalaxyLabel } from "../src/scenes/local-group/localGroupLabels";
import { focusDepth } from "../src/scenes/solar-system/solarCamera";
import { galaxyPosition } from "../src/scenes/local-group/localGroupModel";
import {
  LOCAL_GROUP_GALAXIES,
  LOCAL_GROUP_RULER_Y_METERS,
  LOCAL_GROUP_VIEW_METERS,
} from "../src/scenes/local-group/localGroupData";

describe("galaxy interaction contracts", () => {
  it("accepts a hidden but wholly framed physical ruler, rejects clipping and edge-on projections", () => {
    const scene = new Scene(),
      group = new Group();
    group.name = "physical-comparison-bar";
    const geometry = new LineGeometry().setPositions([-1, 0, 0, 1, 0, 0]);
    const material = new LineMaterial();
    group.add(new Line2(geometry, material));
    scene.add(group);
    const camera = new OrthographicCamera(-5, 5, 5, -5, 1, 20);
    camera.position.z = 10;
    camera.lookAt(0, 0, 0);
    const check = () =>
      wholeBarInView(projectPhysicalBar(scene, camera, { width: 500, height: 500 }, group.name));
    expect(check()).toBe(true);
    group.visible = false;
    expect(check()).toBe(true);
    group.position.x = 5;
    expect(check()).toBe(false);
    group.position.x = 0;
    group.position.z = 11;
    expect(check()).toBe(false);
    group.position.z = 0;
    group.rotation.y = Math.PI / 2;
    expect(check()).toBe(false);
    geometry.dispose();
    material.dispose();
  });
  it("keeps zoomed galaxy projections fixed while moving the orbit pivot to their depth", () => {
    const g = LOCAL_GROUP_GALAXIES.find((g) => g.name === "Andromeda")!;
    const position = new Vector3(...galaxyPosition(g));
    const camera = new OrthographicCamera(-5, 5, 5, -5, 0.01, 2000);
    const target = new Vector3(position.x, position.y, 0);
    camera.position.copy(target).add(new Vector3(0, 0, 40));
    camera.lookAt(target);
    camera.zoom = 10;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const sample = position.clone().add(new Vector3(0.1, 0.2, 0.3));
    const before = sample.clone().project(camera);
    focusDepth(camera, target, position);
    expect(target.distanceTo(position)).toBeLessThan(1e-12);
    const after = sample.clone().project(camera);
    expect(after.x).toBeCloseTo(before.x, 12);
    expect(after.y).toBeCloseTo(before.y, 12);
    camera.position.copy(target).add(new Vector3(30, 10, 20));
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const rotated = position.clone().project(camera);
    expect(rotated.x).toBeCloseTo(0, 12);
    expect(rotated.y).toBeCloseTo(0, 12);
  });
  it("places long default leaders on both sides with collision avoidance", () => {
    const left = placeGalaxyLabel(400, 300, 100, 1000, 600, [], true)!;
    const right = placeGalaxyLabel(600, 300, 100, 1000, 600, [], true)!;
    expect(left.side).toBe(-1);
    expect(left.x + left.width).toBeLessThanOrEqual(300);
    expect(right.side).toBe(1);
    expect(right.x).toBeGreaterThanOrEqual(700);
    const neighbor = placeGalaxyLabel(402, 301, 100, 1000, 600, [left], true)!;
    expect(Math.abs(neighbor.y - left.y)).toBeGreaterThanOrEqual(19);
    const edge = placeGalaxyLabel(30, 200, 140, 320, 400, [], true)!;
    expect(edge.side).toBe(1);
    expect(edge.x + edge.width).toBeLessThan(320);
  });
  it("keeps both ruler heights within the tighter default short-side viewport", () => {
    for (const y of Object.values(LOCAL_GROUP_RULER_Y_METERS))
      expect(Math.abs(y)).toBeLessThan(LOCAL_GROUP_VIEW_METERS / 2);
  });
});
