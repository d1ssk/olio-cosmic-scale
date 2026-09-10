import { CanvasTexture, SRGBColorSpace } from "three";

/** A small local text texture: no remote fonts or sprite assets. */
export function referenceLabel(text: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas text rendering is unavailable.");
  context.font = "28px system-ui, sans-serif";
  const lines = text.split("\n");
  canvas.width = Math.ceil(Math.max(...lines.map((line) => context.measureText(line).width))) + 16;
  canvas.height = 48 + (lines.length - 1) * 36;
  context.font = "28px system-ui, sans-serif";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  const style = getComputedStyle(document.documentElement);
  context.strokeStyle = style.getPropertyValue("--canvas").trim();
  context.lineWidth = 6;
  context.fillStyle = style.getPropertyValue("--ink").trim();
  context.textAlign = lines.length > 1 ? "center" : "left";
  const x = lines.length > 1 ? canvas.width / 2 : 8;
  lines.forEach((line, index) => {
    const y = 24 + index * 36;
    context.strokeText(line, x, y);
    context.fillText(line, x, y);
  });
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, width: canvas.width / 2, height: canvas.height / 2 };
}
