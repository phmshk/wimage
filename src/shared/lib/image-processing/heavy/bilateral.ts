import type { FilterProcessFn } from "../types";

let cachedRadius = -1;
let spatialLUT: Float32Array;
let rangeLUT: Float32Array;

export const applyBilateral: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 2;
  if (radius < 1) return pixels;
  if (radius !== cachedRadius) {
    const sigmaS = radius / 2;
    const sigmaR = 30; // Range sigma

    // Precompute spatial constants
    const gaussSCoeff = 1 / (2 * sigmaS * sigmaS);
    const gaussRCoeff = 1 / (2 * sigmaR * sigmaR);

    // (Spatial LUT)
    const maxDistSq = 2 * radius * radius;
    spatialLUT = new Float32Array(maxDistSq + 1);
    for (let i = 0; i <= maxDistSq; i++) {
      spatialLUT[i] = Math.exp(-i * gaussSCoeff);
    }

    // (Range LUT)
    const maxDiffSq = 255 * 255 * 3;
    rangeLUT = new Float32Array(maxDiffSq + 1);
    for (let i = 0; i <= maxDiffSq; i++) {
      rangeLUT[i] = Math.exp(-i * gaussRCoeff);
    }

    cachedRadius = radius;
  }

  const output = new Uint8ClampedArray(pixels.length);

  for (let y = 0; y < height; y++) {
    const rowBase = y * width;

    for (let x = 0; x < width; x++) {
      const centerIdx = (rowBase + x) << 2; // << 2 = * 4
      const r0 = pixels[centerIdx];
      const g0 = pixels[centerIdx + 1];
      const b0 = pixels[centerIdx + 2];

      let sumR = 0,
        sumG = 0,
        sumB = 0,
        sumWeight = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        // inline clamp by Y
        let py = y + ky;
        if (py < 0) py = 0;
        else if (py >= height) py = height - 1;
        const pRowBase = py * width;

        for (let kx = -radius; kx <= radius; kx++) {
          // inline clamp by X
          let px = x + kx;
          if (px < 0) px = 0;
          else if (px >= width) px = width - 1;

          const idx = (pRowBase + px) << 2;

          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          const distSq = kx * kx + ky * ky;

          const dr = r - r0;
          const dg = g - g0;
          const db = b - b0;
          const diffSq = dr * dr + dg * dg + db * db;

          const weight = spatialLUT[distSq] * rangeLUT[diffSq];

          sumR += r * weight;
          sumG += g * weight;
          sumB += b * weight;
          sumWeight += weight;
        }
      }

      output[centerIdx] = sumR / sumWeight;
      output[centerIdx + 1] = sumG / sumWeight;
      output[centerIdx + 2] = sumB / sumWeight;
      output[centerIdx + 3] = pixels[centerIdx + 3];
    }
  }

  return output;
};
