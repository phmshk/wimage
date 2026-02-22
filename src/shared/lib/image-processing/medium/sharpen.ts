import type { FilterProcessFn } from "../types";

export const applySharpen: FilterProcessFn = (pixels, width, height) => {
  const output = new Uint8ClampedArray(pixels.length);
  const rowBytes = width * 4;

  for (let y = 1; y < height - 1; y++) {
    let idx = (y * width + 1) * 4;
    for (let x = 1; x < width - 1; x++, idx += 4) {
      // c = 0 (Red), 1 (Green), 2 (Blue)
      for (let c = 0; c < 3; c++) {
        // kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
        const sum =
          pixels[idx - rowBytes + c] * -1 + // top
          pixels[idx - 4 + c] * -1 + // left
          pixels[idx + c] * 5 + // center
          pixels[idx + 4 + c] * -1 + // right
          pixels[idx + rowBytes + c] * -1; // bottom

        // inline clamp
        output[idx + c] = sum < 0 ? 0 : sum > 255 ? 255 : sum;
      }
      output[idx + 3] = pixels[idx + 3];
    }
  }
  return output;
};
