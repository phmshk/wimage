import { getPixelIndex } from "../helpers";
import type { FilterProcessFn } from "../types";

export const applyKuwahara: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 6;
  const output = new Uint8ClampedArray(pixels.length);

  const getStats = (x1: number, y1: number, x2: number, y2: number) => {
    let rSum = 0,
      gSum = 0,
      bSum = 0;
    let rSqSum = 0,
      gSqSum = 0,
      bSqSum = 0;
    let count = 0;

    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const idx = getPixelIndex(x, y, width, height);
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        rSum += r;
        gSum += g;
        bSum += b;
        rSqSum += r * r;
        gSqSum += g * g;
        bSqSum += b * b;
        count++;
      }
    }

    const rMean = rSum / count;
    const gMean = gSum / count;
    const bMean = bSum / count;

    // Variance = Mean(Square) - (Mean)^2
    const variance =
      rSqSum / count -
      rMean * rMean +
      (gSqSum / count - gMean * gMean) +
      (bSqSum / count - bMean * bMean);

    return { variance, r: rMean, g: gMean, b: bMean };
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const q1 = getStats(x - radius, y - radius, x, y);
      const q2 = getStats(x, y - radius, x + radius, y);
      const q3 = getStats(x - radius, y, x, y + radius);
      const q4 = getStats(x, y, x + radius, y + radius);

      let minVar = q1.variance;
      let bestRegion = q1;

      if (q2.variance < minVar) {
        minVar = q2.variance;
        bestRegion = q2;
      }
      if (q3.variance < minVar) {
        minVar = q3.variance;
        bestRegion = q3;
      }
      if (q4.variance < minVar) {
        minVar = q4.variance;
        bestRegion = q4;
      }

      const dest = (y * width + x) * 4;
      output[dest] = bestRegion.r;
      output[dest + 1] = bestRegion.g;
      output[dest + 2] = bestRegion.b;
      output[dest + 3] = pixels[dest + 3];
    }
  }

  return output;
};
