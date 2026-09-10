import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { StarDistanceTable } from "../src/components/StarDistanceTable";
import { FAMOUS_STAR_DISTANCES } from "../src/scenes/stellar-neighborhood/famousStarDistances";
import { PARSEC_METERS, LIGHT_YEAR_METERS } from "../src/physics/constants";
import { translate } from "../src/i18n";

afterEach(cleanup);
describe("famous-star distances", () => {
  it("keeps 17 distinct sourced distances in SI and nearest-first order", () => {
    expect(FAMOUS_STAR_DISTANCES).toHaveLength(17);
    expect(new Set(FAMOUS_STAR_DISTANCES.map((s) => s.id)).size).toBe(17);
    expect(
      FAMOUS_STAR_DISTANCES.filter((s) => s.distanceMeters <= 5 * PARSEC_METERS).map((s) => s.id),
    ).toEqual([70666, 32263, 37173]);
    expect(FAMOUS_STAR_DISTANCES.some((s) => s.id === 8087)).toBe(false);
    expect(FAMOUS_STAR_DISTANCES.filter((s) => s.approximate)).toHaveLength(6);
    const values = FAMOUS_STAR_DISTANCES.map((s) => s.distanceMeters);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    const sirius = FAMOUS_STAR_DISTANCES.find((s) => s.id === 32263)!;
    expect(sirius.distanceMeters / PARSEC_METERS).toBeCloseTo(2.6371, 6);
    expect(sirius.distanceMeters / LIGHT_YEAR_METERS).toBeCloseTo(8.601, 2);
    for (const star of FAMOUS_STAR_DISTANCES) {
      expect(translate("en", star.nameKey)).toBeTruthy();
      expect(translate("ja", star.nameKey)).toBeTruthy();
    }
  });
  it("previews only modeled stars on hover/focus and clears on leave, close and disable", () => {
    expect(
      FAMOUS_STAR_DISTANCES.filter((s) => s.sceneStarId !== null).map((s) => s.sceneStarId),
    ).toEqual([70666, 32263, 37173]);
    const preview = vi.fn();
    const view = render(<StarDistanceTable locale="en" onPreviewStarChange={preview} />);
    fireEvent.click(screen.getByRole("button", { name: "Distances to stars" }));
    const sirius = screen.getByRole("button", { name: "Sirius" });
    fireEvent.pointerEnter(sirius);
    expect(preview).toHaveBeenLastCalledWith(32263);
    fireEvent.pointerLeave(sirius);
    expect(preview).toHaveBeenLastCalledWith(null);
    const procyon = screen.getByRole("button", { name: "Procyon" });
    fireEvent.focus(procyon);
    expect(preview).toHaveBeenLastCalledWith(37173);
    fireEvent.blur(procyon);
    expect(preview).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole("button", { name: "Vega" })).not.toBeInTheDocument();
    fireEvent.pointerEnter(sirius);
    fireEvent.keyDown(sirius, { key: "Escape" });
    expect(preview).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "Distances to stars" }));
    fireEvent.pointerEnter(sirius);
    view.rerender(<StarDistanceTable locale="en" onPreviewStarChange={preview} disabled />);
    expect(preview).toHaveBeenLastCalledWith(null);
  });
  it("toggles a bilingual table with both units and supports Escape", () => {
    const view = render(<StarDistanceTable locale="ja" />);
    const button = screen.getByRole("button", { name: "恒星までの距離" });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("row")).toHaveLength(18);
    const sirius = screen.getByRole("rowheader", { name: "シリウス" }).closest("tr")!;
    expect(
      within(sirius)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["8.6", "2.64"]);
    expect(screen.getByRole("rowheader", { name: "プロキオン" })).toBeVisible();
    for (const name of [
      "カノープス",
      "ベテルギウス",
      "アンタレス",
      "リゲル",
      "ポラリス",
      "デネブ",
    ]) {
      const row = screen.getByRole("rowheader", { name }).closest("tr")!;
      expect(
        within(row)
          .getAllByRole("cell")
          .every((cell) => cell.textContent?.startsWith("約")),
      ).toBe(true);
    }
    view.rerender(<StarDistanceTable locale="en" />);
    expect(screen.getByRole("rowheader", { name: "Procyon" })).toBeVisible();
    fireEvent.keyDown(button, { key: "Escape" });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
