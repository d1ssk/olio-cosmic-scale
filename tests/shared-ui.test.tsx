import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScaleBridge, type BridgeControls } from "../src/bridges/ScaleBridge";
import { ScaleAxis } from "../src/components/ScaleAxis";
import { ScaleReadout } from "../src/components/ScaleReadout";
import { sceneRegistry } from "../src/app/sceneRegistry";
import { formatLength, length } from "../src/physics/length";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("shared scale UI", () => {
  it("returns from Milky Way through one manual bridge and retains the 8 pc connecting bar", () => {
    vi.useFakeTimers();
    const ref = createRef<BridgeControls>();
    const complete = vi.fn();
    const cancel = vi.fn();
    const view = render(
      <ScaleBridge
        ref={ref}
        originSceneId="milky-way"
        targetSceneId="solar-neighborhood"
        locale="en"
        onComplete={complete}
        onCancel={cancel}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("1 of 1");
    act(() => ref.current?.navigate("previous"));
    const rows = [...view.container.querySelectorAll<HTMLElement>(".length-bar-row")];
    const retained = rows.find((row) => row.style.opacity === "1");
    expect(
      Number(retained?.querySelector<HTMLElement>("[data-bridge-meters]")?.dataset.bridgeMeters),
    ).toBe(sceneRegistry["solar-neighborhood"].referenceLengthMeters);
    act(() => vi.advanceTimersByTime(180));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
  });
  it("shows all four base units for every scene", () => {
    for (const scene of Object.values(sceneRegistry)) {
      const view = render(
        <ScaleReadout
          meters={scene.referenceLengthMeters}
          primaryUnit={scene.preferredPrimaryUnit}
          secondaryUnits={scene.secondaryUnits}
          locale="ja"
        />,
      );
      for (const unit of ["m", "pc", "AU", "ly"] as const) {
        const value = formatLength(length(scene.referenceLengthMeters), { unit, locale: "ja" });
        expect(
          value.includes("E") ? screen.getByLabelText(value) : screen.getByText(value),
        ).toBeInTheDocument();
      }
      expect(
        view.container.querySelectorAll(".secondary-lengths > .formatted-length"),
      ).toHaveLength(
        scene.preferredPrimaryUnit === "m" ||
          scene.preferredPrimaryUnit === "pc" ||
          scene.preferredPrimaryUnit === "AU" ||
          scene.preferredPrimaryUnit === "ly"
          ? 3
          : 4,
      );
      view.unmount();
    }
  });
  it("places sibling scenes at the same logarithmic position and navigates directly", () => {
    const navigate = vi.fn();
    render(<ScaleAxis sceneId="human" locale="en" onNavigate={navigate} />);
    const solar = screen.getByRole("button", { name: /^Solar neighborhood/ });
    const center = screen.getByRole("button", { name: /^Inside the Galactic bulge/ });
    expect(solar.style.left).toBe(center.style.left);
    expect(parseFloat(solar.style.left)).toBeCloseTo(
      (Math.log10(sceneRegistry["solar-neighborhood"].referenceLengthMeters) / 27) * 100,
    );
    fireEvent.click(center);
    expect(navigate).toHaveBeenCalledWith("galactic-center-neighborhood");
  });
  it("does not advance again during resizing and removes the old bar before exiting", () => {
    vi.useFakeTimers();
    const ref = createRef<BridgeControls>();
    const complete = vi.fn();
    render(
      <ScaleBridge
        ref={ref}
        originSceneId="human"
        targetSceneId="earth"
        locale="en"
        onComplete={complete}
        onCancel={vi.fn()}
      />,
    );
    act(() => ref.current?.navigate("next"));
    expect(screen.getByRole("status")).toHaveTextContent("2 of 2");
    act(() => {
      vi.advanceTimersByTime(800);
      ref.current?.navigate("next");
    });
    expect(complete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(280));
    act(() => ref.current?.navigate("next"));
    expect(complete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(179));
    expect(complete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it.each([
    ["human", "earth"],
    ["earth", "human"],
  ] as const)(
    "moves %s → %s only on user actions and preserves physical direction",
    (origin, target) => {
      vi.useFakeTimers();
      const complete = vi.fn();
      const cancel = vi.fn();
      const ref = createRef<BridgeControls>();
      render(
        <ScaleBridge
          ref={ref}
          originSceneId={origin}
          targetSceneId={target}
          locale="en"
          onComplete={complete}
          onCancel={cancel}
        />,
      );
      const initial = screen.getByRole("status").textContent;
      expect(initial).toContain("of 2");
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      expect(screen.getByRole("status").textContent).toBe(initial);
      expect(complete).not.toHaveBeenCalled();
      const forward = origin === "human" ? "next" : "previous";
      const backward = origin === "human" ? "previous" : "next";
      act(() => {
        ref.current?.navigate(forward);
        vi.advanceTimersByTime(1100);
      });
      expect(screen.getByRole("status").textContent).not.toBe(initial);
      act(() => {
        ref.current?.navigate(backward);
        vi.advanceTimersByTime(1100);
      });
      expect(screen.getByRole("status").textContent).toBe(initial);
      act(() => {
        ref.current?.navigate(backward);
        vi.advanceTimersByTime(1100);
      });
      expect(cancel).toHaveBeenCalledTimes(1);
      for (let i = 0; i < 30 && !complete.mock.calls.length; i++) {
        act(() => {
          ref.current?.navigate(forward);
          vi.advanceTimersByTime(1100);
        });
      }
      expect(complete).toHaveBeenCalledTimes(1);
    },
  );
});

it.each([
  ["solar-system", "solar-neighborhood", "next"],
  ["solar-neighborhood", "solar-system", "previous"],
  ["galactic-center-neighborhood", "solar-system", "previous"],
] as const)("has just one reversible stellar bridge for %s → %s", (origin, target, direction) => {
  vi.useFakeTimers();
  const complete = vi.fn();
  const ref = createRef<BridgeControls>();
  render(
    <ScaleBridge
      ref={ref}
      originSceneId={origin}
      targetSceneId={target}
      locale="en"
      onComplete={complete}
      onCancel={vi.fn()}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("1 of 1");
  expect(screen.getByText("20,000 AU")).toBeInTheDocument();
  act(() => ref.current?.navigate(direction));
  act(() => vi.advanceTimersByTime(180));
  expect(complete).toHaveBeenCalledOnce();
});
