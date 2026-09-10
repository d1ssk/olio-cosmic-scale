import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ScaleBridge } from "../src/bridges/ScaleBridge";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it.each([
  ["milky-way", "solar-neighborhood"],
  ["solar-neighborhood", "solar-system"],
  ["earth", "human"],
] as const)(
  "animates %s's in-scene comparison into the bridge main bar",
  (originSceneId, targetSceneId) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 20,
      y: 50,
      left: 20,
      top: 50,
      right: 870,
      bottom: 54,
      width: 850,
      height: 4,
      toJSON: () => ({}),
    });
    const animations: { cancel: ReturnType<typeof vi.fn>; onfinish: null | (() => void) }[] = [];
    const animate = vi.fn(() => {
      const animation = { cancel: vi.fn(), onfinish: null as null | (() => void) };
      animations.push(animation);
      return animation as unknown as Animation;
    });
    vi.stubGlobal("Animation", class {});
    // jsdom has no Web Animations implementation.
    const prior = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "animate");
    Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: animate });
    try {
      const busy = vi.fn();
      const { container } = render(
        <ScaleBridge
          originSceneId={originSceneId}
          targetSceneId={targetSceneId}
          locale="en"
          entryBar={{ x: 300, y: 700, length: 9, angle: 0 }}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
          onBusyChange={busy}
        />,
      );
      expect(animate).toHaveBeenCalled();
      const main = container.querySelector<HTMLElement>("[data-bridge-main-bar]")!;
      expect(main.style.visibility).toBe("hidden");
      expect(animate.mock.calls[0]).toEqual([
        [
          { transform: "translate(300px, 700px) rotate(0rad) scaleX(9)" },
          { transform: "translate(20px, 52px) rotate(0rad) scaleX(850)" },
        ],
        expect.objectContaining({ duration: 1000 }),
      ]);
      expect(busy).toHaveBeenLastCalledWith(true);
      act(() => animations.at(-1)!.onfinish?.());
      expect(main.style.visibility).toBe("");
      const rows = container.querySelectorAll<HTMLElement>(".length-bar-row");
      expect([...rows].filter((row) => row.style.opacity === "1")).toHaveLength(2);
      act(() => vi.advanceTimersByTime(180));
      expect(busy).toHaveBeenLastCalledWith(false);
      expect(screen.getByRole("status")).toHaveTextContent("of");
    } finally {
      if (prior) Object.defineProperty(HTMLElement.prototype, "animate", prior);
      else Reflect.deleteProperty(HTMLElement.prototype, "animate");
    }
  },
);
