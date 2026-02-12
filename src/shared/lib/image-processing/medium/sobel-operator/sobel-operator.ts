import { getPixelIndex } from "../../helpers";
import type { FilterProcessFn } from "../../types";

export const applySobel: FilterProcessFn = (pixels, width, height) => {
  const output = new Uint8ClampedArray(pixels.length);

  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rx = 0,
        gx = 0,
        bx = 0;
      let ry = 0,
        gy = 0,
        by = 0;

      // 3x3
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const idx = getPixelIndex(x + kx - 1, y + ky - 1, width, height);
          const weightX = kernelX[ky * 3 + kx];
          const weightY = kernelY[ky * 3 + kx];

          rx += pixels[idx] * weightX;
          gx += pixels[idx + 1] * weightX;
          bx += pixels[idx + 2] * weightX;

          ry += pixels[idx] * weightY;
          gy += pixels[idx + 1] * weightY;
          by += pixels[idx + 2] * weightY;
        }
      }

      const dest = (y * width + x) * 4;
      // Magnitude = sqrt(x^2 + y^2)
      output[dest] = Math.sqrt(rx * rx + ry * ry);
      output[dest + 1] = Math.sqrt(gx * gx + gy * gy);
      output[dest + 2] = Math.sqrt(bx * bx + by * by);
      output[dest + 3] = 255;
    }
  }
  return output;
};
