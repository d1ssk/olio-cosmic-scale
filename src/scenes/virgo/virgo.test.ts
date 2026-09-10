import evccCsv from "./raw/evcc_table2_with_Mg.csv?raw";
import { buildDepthAssignments, displayGalaxy } from "./virgoDepth";
import { VIRGO_DEPTH_MODEL, displayDistanceKind } from "./virgoData";
import { CATALOG_STYLES, galaxyCatalogStyle } from "./virgoData";
import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import catalog from "./catalog.json";
import manifest from "./manifest.json";
import { SOURCES } from "../../data/sources";
import { MEGAPARSEC_METERS } from "../../physics/constants";
import { sceneRegistry } from "../../app/sceneRegistry";
import { VIRGO_DIRECTION, VIRGO_REFERENCE_METERS, type VirgoGalaxy } from "./virgoData";
import { equatorialSight, markerPixels, uncertaintyEndpoints, virgoPosition } from "./virgoModel";
const galaxies = catalog as VirgoGalaxy[];

describe("Virgo catalog and physical meaning", () => {
  it("retains every EVCC/SBF entry and removes the NGVS II excerpt", () => {
    expect(galaxies.filter((g) => g.sourceIds.includes("ngvs-sbf-2024"))).toHaveLength(278);
    expect(galaxies.some((g) => g.sourceIds.includes("ngvs-members-2026"))).toBe(false);
    expect(galaxies.filter((g) => g.evccId !== null)).toHaveLength(manifest.evccRows);
    expect(new Set(galaxies.filter((g) => g.evccId !== null).map((g) => g.evccId)).size).toBe(1589);
    expect(new Set(galaxies.map((g) => g.name)).size).toBe(galaxies.length);
    for (const kind of ["independent", "estimated", "adopted"] as const)
      expect(galaxies.filter((g) => g.distanceKind === kind)).toHaveLength(
        manifest.distanceCounts[kind],
      );
    for (const g of galaxies) {
      expect(g.distanceMeters).toBeGreaterThanOrEqual(0);
      expect(Math.abs(g.decDegrees)).toBeLessThanOrEqual(90);
      expect(g.raDegrees).toBeGreaterThanOrEqual(0);
      expect(g.raDegrees).toBeLessThan(360);
      expect(virgoPosition(g).every(Number.isFinite)).toBe(true);
      expect(g.sourceIds.every((id) => SOURCES.some((s) => s.id === id))).toBe(true);
    }
  });
  it("uses SBF individual distances and errors instead of flattening background galaxies", () => {
    const m87 = galaxies.find((g) => g.name === "NGC4486")!;
    expect(m87.distanceMeters / MEGAPARSEC_METERS).toBeCloseTo(16.72, 6);
    expect(m87.method).toBe("SBF d_ref");
    expect(m87.sourceIds).toContain("50mgc-2024");
    const w = galaxies.find((g) => g.aliases.includes("VCC220"))!;
    expect(w.distanceMeters / MEGAPARSEC_METERS).toBeCloseTo(31.49, 6);
    expect(w.distanceErrorMeters! / MEGAPARSEC_METERS).toBeCloseTo(2.39, 6);
    const ends = uncertaintyEndpoints(w)!;
    expect(new Vector3(...ends[0]).distanceTo(new Vector3(...ends[1]))).toBeCloseTo(4.78, 6);
  });
  it("rigidly rotates measured sky directions and preserves physical separations", () => {
    const mw = virgoPosition(galaxies[0]);
    expect(mw).toEqual([-8.25, 0, 0]);
    const virgo = virgoPosition({ ...VIRGO_DIRECTION, distanceMeters: VIRGO_REFERENCE_METERS });
    expect(virgo[0]).toBeCloseTo(8.25);
    expect(virgo[1]).toBeCloseTo(0);
    expect(virgo[2]).toBeCloseTo(0);
    const a = galaxies[10],
      b = galaxies[100];
    const physical = equatorialSight(a.raDegrees, a.decDegrees)
      .multiplyScalar(a.distanceMeters)
      .distanceTo(equatorialSight(b.raDegrees, b.decDegrees).multiplyScalar(b.distanceMeters));
    expect(
      new Vector3(...virgoPosition(a)).distanceTo(new Vector3(...virgoPosition(b))),
    ).toBeCloseTo(physical / MEGAPARSEC_METERS, 10);
    const before = galaxies.map(virgoPosition);
    expect(galaxies.map(virgoPosition)).toEqual(before);
  });
  it("assigns one source color per merged galaxy using documented precedence", () => {
    const counts = CATALOG_STYLES.map(
      (style) => galaxies.filter((g) => galaxyCatalogStyle(g).id === style.id).length,
    );
    expect(counts.reduce((a, b) => a + b, 0)).toBe(galaxies.length);
    expect(counts[0]).toBe(278);
    expect(counts[2]).toBe(74);
    expect(galaxies.every((g) => g.aliases.every((alias) => alias.trim().length > 0))).toBe(true);
    expect(galaxies.find((g) => g.name === "Canis Major")!.aliases).not.toContain("Fornax");
    expect(galaxies.find((g) => g.name === "Fornax")).toBeDefined();
    expect(galaxyCatalogStyle({ sourceIds: ["50mgc-2024", "evcc-2014", "ngvs-sbf-2024"] }).id).toBe(
      "ngvs-sbf-2024",
    );
    expect(galaxyCatalogStyle(galaxies.find((g) => g.name === "Andromeda")!).id).toBe(
      "mcconnachie-2012",
    );
    expect(galaxyCatalogStyle(galaxies[0]).id).toBe("virgo-convention");
  });
  it("keeps reference length independent from viewport and luminosity markers bounded", () => {
    expect(sceneRegistry.virgo.referenceLengthMeters).toBe(VIRGO_REFERENCE_METERS);
    expect(sceneRegistry.virgo.defaultViewportExtentMeters).toBeGreaterThan(VIRGO_REFERENCE_METERS);
    expect(VIRGO_REFERENCE_METERS / sceneRegistry["local-group"].referenceLengthMeters).toBeCloseTo(
      5.5,
    );
    expect(markerPixels(-22)).toBeGreaterThan(markerPixels(-10));
    expect(markerPixels(-100)).toBeLessThanOrEqual(7);
    expect(markerPixels(null)).toBe(1.5);
  });
  it("uses the supplied M_g literally for every EVCC galaxy, including SBF overlaps", () => {
    for (const line of evccCsv.trim().split(/\r?\n/).slice(1)) {
      const cells = line.split(","),
        id = Number(cells[0]),
        mag = Number(cells[cells.length - 1]);
      const g = galaxies.find((g) => g.evccId === id)!;
      expect(g.absoluteMagnitude).toBe(mag);
      expect(g.magnitudeBand).toBe("g");
      expect(g.magnitudeSourceId).toBe("evcc-2014");
    }
    expect(galaxies.find((g) => g.evccId === 324)!.name).not.toBe(
      galaxies.find((g) => g.evccId === 2057)!.name,
    );
    expect(galaxies.filter((g) => g.evccMembership === "M")).toHaveLength(1028);
    expect(galaxies.filter((g) => g.evccMembership === "P")).toHaveLength(561);
  });
  it("changes only modeled radial coordinates, retaining measured galaxies and magnitudes", () => {
    const before = JSON.stringify(galaxies),
      assignments = buildDepthAssignments(galaxies);
    let cluster = 0,
      nearby = 0;
    for (const g of galaxies) {
      const model = displayGalaxy(g, assignments, false),
        flat = displayGalaxy(g, assignments, true);
      expect(model.raDegrees).toBe(g.raDegrees);
      expect(model.decDegrees).toBe(g.decDegrees);
      expect(model.absoluteMagnitude).toBe(g.absoluteMagnitude);
      expect(model.distanceMeters).toBeGreaterThanOrEqual(0);
      if (!g.depthModel) {
        expect(model.distanceMeters).toBe(g.distanceMeters);
        expect(flat.distanceMeters).toBe(g.distanceMeters);
      } else {
        expect(flat.distanceMeters).toBe(g.representativeDistanceMeters);
        expect(displayDistanceKind(g, false)).toBe("modeled");
        expect(displayDistanceKind(g, true)).toBe("adopted");
        expect(model.distanceMeters).not.toBe(flat.distanceMeters);
        const donor = galaxies.find((d) => d.name === assignments.get(g.name)!.donorName)!;
        expect(donor.distanceKind).toBe("independent");
        if (g.depthModel === "virgo-sbf") {
          cluster++;
          expect(donor.sourceIds).toContain("ngvs-sbf-2024");
          expect(["q1", "q2"]).toContain(donor.quality);
          expect(model.distanceMeters).toBeGreaterThanOrEqual(VIRGO_DEPTH_MODEL.clusterMinMeters);
          expect(model.distanceMeters).toBeLessThanOrEqual(VIRGO_DEPTH_MODEL.clusterMaxMeters);
          expect(flat.distanceMeters / VIRGO_REFERENCE_METERS).toBeCloseTo(1, 14);
        } else nearby++;
      }
    }
    expect(cluster).toBe(manifest.depthModelCounts["virgo-sbf"]);
    expect(nearby).toBe(manifest.depthModelCounts.nearby);
    expect(JSON.stringify(galaxies)).toBe(before);
    const reversed = buildDepthAssignments([...galaxies].reverse());
    for (const [name, assignment] of assignments) expect(reversed.get(name)).toEqual(assignment);
  });
});
