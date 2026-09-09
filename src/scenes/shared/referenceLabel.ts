import { CanvasTexture, SRGBColorSpace } from "three";

/** A small local text texture: no remote fonts or sprite assets. */
export function referenceLabel(text: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas text rendering is unavailable.");
  context.font = "28px system-ui, sans-serif";
  canvas.width = Math.ceil(context.measureText(text).width) + 16;
  canvas.height = 48;
  context.font = "28px system-ui, sans-serif";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  const style = getComputedStyle(document.documentElement);
  context.strokeStyle = style.getPropertyValue("--canvas").trim();
  context.lineWidth = 6;
  context.strokeText(text, 8, 24);
  context.fillStyle = style.getPropertyValue("--ink").trim();
  context.fillText(text, 8, 24);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, width: canvas.width / 2, height: canvas.height / 2 };
}
