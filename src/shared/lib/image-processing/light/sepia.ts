import type { FilterProcessFn } from "../types";

export const applySepia: FilterProcessFn = (pixels) => {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    pixels[i] = r * 0.393 + g * 0.769 + b * 0.189;
    pixels[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
    pixels[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
  }
  return pixels;
};
