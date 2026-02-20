import { getPixelIndex } from "../../helpers";
import type { FilterProcessFn } from "../../types";

export const applyGaussianBlur: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 3;

  // 1. Cernel generation (1D)
  const sigma = radius / 3;
  const kernelSize = 2 * radius + 1;
  const kernel = new Float32Array(kernelSize);
  let kernelSum = 0;

  // fill with gaussian
  const twoSigmaSq = 2 * sigma * sigma;
  const multiplier = 1 / (Math.sqrt(2 * Math.PI) * sigma);

  // fill with gaussian
  for (let i = 0; i < kernelSize; i++) {
    const x = i - radius;
    const g = multiplier * Math.exp(-(x * x) / twoSigmaSq);
    kernel[i] = g;
    kernelSum += g;
  }

  // normalization
  const invKernelSum = 1 / kernelSum;
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] *= invKernelSum;
  }

  // buffers
  const tempPixels = new Uint8ClampedArray(pixels.length);
  const finalPixels = new Uint8ClampedArray(pixels.length);

  // 2. horizontal (Source -> Temp)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let k = 0; k < kernelSize; k++) {
        const sampleX = x + (k - radius); // X
        // clamp-to-edge by X, Y stays same
        const offset = getPixelIndex(sampleX, y, width, height);

        const weight = kernel[k];
        r += pixels[offset] * weight;
        g += pixels[offset + 1] * weight;
        b += pixels[offset + 2] * weight;
        a += pixels[offset + 3] * weight;
      }

      const destIndex = (y * width + x) * 4;
      tempPixels[destIndex] = r;
      tempPixels[destIndex + 1] = g;
      tempPixels[destIndex + 2] = b;
      tempPixels[destIndex + 3] = a;
    }
  }

  // 3. vertical (Temp -> Final)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let k = 0; k < kernelSize; k++) {
        const sampleY = y + (k - radius); // Y
        // Clamp-to-edge by Y, X stays
        const offset = getPixelIndex(x, sampleY, width, height);

        const weight = kernel[k];
        r += tempPixels[offset] * weight;
        g += tempPixels[offset + 1] * weight;
        b += tempPixels[offset + 2] * weight;
        a += tempPixels[offset + 3] * weight;
      }

      const destIndex = (y * width + x) * 4;
      finalPixels[destIndex] = r;
      finalPixels[destIndex + 1] = g;
      finalPixels[destIndex + 2] = b;
      finalPixels[destIndex + 3] = a;
    }
  }

  return finalPixels;
};
