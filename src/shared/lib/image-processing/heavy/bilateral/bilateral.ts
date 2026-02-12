import { getPixelIndex } from "../../helpers";
import type { FilterProcessFn } from "../../types";

export const applyBilateral: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 2;
  const sigmaS = radius / 2; // Spatial sigma
  const sigmaR = 30; // Range sigma (intensity diff)
  const output = new Uint8ClampedArray(pixels.length);

  // Precompute spatial constants
  const gaussSCoeff = 1 / (2 * sigmaS * sigmaS);
  const gaussRCoeff = 1 / (2 * sigmaR * sigmaR);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIdx = getPixelIndex(x, y, width, height);
      const r0 = pixels[centerIdx];
      const g0 = pixels[centerIdx + 1];
      const b0 = pixels[centerIdx + 2];

      let sumR = 0,
        sumG = 0,
        sumB = 0;
      let sumWeight = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = getPixelIndex(x + kx, y + ky, width, height);

          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Spatial distance squared
          const distSq = kx * kx + ky * ky;

          // Intensity diff squared
          const dr = r - r0;
          const dg = g - g0;
          const db = b - b0;
          const diffSq = dr * dr + dg * dg + db * db;

          // Combined weight
          const weight = Math.exp(-distSq * gaussSCoeff - diffSq * gaussRCoeff);

          sumR += r * weight;
          sumG += g * weight;
          sumB += b * weight;
          sumWeight += weight;
        }
      }

      const dest = (y * width + x) * 4;
      output[dest] = sumR / sumWeight;
      output[dest + 1] = sumG / sumWeight;
      output[dest + 2] = sumB / sumWeight;
      output[dest + 3] = pixels[dest + 3];
    }
  }
  return output;
};
