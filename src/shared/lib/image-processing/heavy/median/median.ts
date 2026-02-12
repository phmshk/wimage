import { getPixelIndex } from "../../helpers";
import type { FilterProcessFn } from "../../types";

export const applyMedian: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 2;
  const output = new Uint8ClampedArray(pixels.length);
  const size = (2 * radius + 1) ** 2;

  const rArr = new Uint8Array(size);
  const gArr = new Uint8Array(size);
  const bArr = new Uint8Array(size);
  const mid = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let count = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = getPixelIndex(x + kx, y + ky, width, height);
          rArr[count] = pixels[idx];
          gArr[count] = pixels[idx + 1];
          bArr[count] = pixels[idx + 2];
          count++;
        }
      }

      rArr.sort();
      gArr.sort();
      bArr.sort();

      const dest = (y * width + x) * 4;
      output[dest] = rArr[mid];
      output[dest + 1] = gArr[mid];
      output[dest + 2] = bArr[mid];
      output[dest + 3] = pixels[dest + 3];
    }
  }
  return output;
};
