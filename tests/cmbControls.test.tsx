import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";
import ObservableUniverseControls from "../src/scenes/observable-universe/ObservableUniverseControls";
import type { CmbDisplayMode } from "../src/scenes/types";

it("allows independent T and polarization toggles, combined display, and both OFF", () => {
  function Controls() {
    const [mode, setMode] = useState<CmbDisplayMode>("uniform");
    return (
      <>
        <ObservableUniverseControls locale="en" mode={mode} onModeChange={setMode} />
        <output>{mode}</output>
      </>
    );
  }
  render(<Controls />);
  const [temperature, polarization] = screen.getAllByRole("checkbox");
  expect(screen.getByRole("status")).toHaveTextContent("uniform");
  fireEvent.click(temperature);
  expect(screen.getByRole("status")).toHaveTextContent("temperature");
  fireEvent.click(polarization);
  expect(screen.getByRole("status")).toHaveTextContent("both");
  fireEvent.click(temperature);
  expect(screen.getByRole("status")).toHaveTextContent("polarization");
  fireEvent.click(temperature);
  fireEvent.click(polarization);
  expect(screen.getByRole("status")).toHaveTextContent("temperature");
  fireEvent.click(temperature);
  expect(screen.getByRole("status")).toHaveTextContent("uniform");
});
