import { getPixelIndex } from "../../helpers";
import type { FilterProcessFn } from "../../types";

export const applySharpen: FilterProcessFn = (pixels, width, height) => {
  const output = new Uint8ClampedArray(pixels.length);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const idx = getPixelIndex(x + kx - 1, y + ky - 1, width, height);
          const weight = kernel[ky * 3 + kx];

          r += pixels[idx] * weight;
          g += pixels[idx + 1] * weight;
          b += pixels[idx + 2] * weight;
        }
      }

      const dest = (y * width + x) * 4;
      output[dest] = r;
      output[dest + 1] = g;
      output[dest + 2] = b;
      output[dest + 3] = pixels[dest + 3]; // Copy original alpha
    }
  }
  return output;
};
