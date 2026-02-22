import type { FilterProcessFn } from "../types";

export const applySepia: FilterProcessFn = (pixels) => {
  const length = pixels.length;
  for (let i = 0; i < length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const tr = (r * 402 + g * 787 + b * 193) >> 10;
    const tg = (r * 357 + g * 702 + b * 172) >> 10;
    const tb = (r * 278 + g * 547 + b * 134) >> 10;

    pixels[i] = tr > 255 ? 255 : tr;
    pixels[i + 1] = tg > 255 ? 255 : tg;
    pixels[i + 2] = tb > 255 ? 255 : tb;
  }
  return pixels;
};
