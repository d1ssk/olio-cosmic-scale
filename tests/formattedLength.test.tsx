import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { FormattedLength } from "../src/components/FormattedLength";
import { captureBridgeBar } from "../src/bridges/barTransition";

afterEach(cleanup);

it.each([
  ["5.51E-17 pc", "−17"],
  ["1.27E7 m", "7"],
])("renders %s with a signed superscript", (value, exponent) => {
  const { container } = render(<FormattedLength value={value} />);
  expect(container.querySelector("sup")).toHaveTextContent(exponent);
  expect(screen.getByLabelText(value)).toHaveTextContent("× 10");
});

it("captures the scene's physical bar instead of always selecting the larger one", () => {
  const { container } = render(
    <>
      <div data-bridge-main-bar data-bridge-meters="332" />
      <div data-bridge-meters="1.7" />
    </>,
  );
  const bars = container.querySelectorAll("div");
  bars[0].getBoundingClientRect = () => ({ left: 10, top: 20, width: 900, height: 4 }) as DOMRect;
  bars[1].getBoundingClientRect = () => ({ left: 10, top: 110, width: 4.6, height: 4 }) as DOMRect;
  expect(captureBridgeBar(1.7)).toEqual({ x: 10, y: 112, length: 4.6, angle: 0 });
  expect(captureBridgeBar(332)?.length).toBe(900);
});
