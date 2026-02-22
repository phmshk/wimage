import type { FilterProcessFn } from "../types";

let cachedRadius = -1;
let cachedKernel: Uint32Array;

export const applyGaussianBlur: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 3;
  if (radius < 1) return pixels;

  const kernelSize = 2 * radius + 1;
  // caching
  if (radius !== cachedRadius) {
    // 1. Cernel generation (1D)

    cachedKernel = new Uint32Array(kernelSize);
    const floatKernel = new Float32Array(kernelSize);
    const sigma = radius / 3;
    let kernelSum = 0;

    // fill with gaussian
    for (let i = 0; i < kernelSize; i++) {
      const x = i - radius;
      const g = Math.exp(-(x * x) / (2 * sigma * sigma));
      floatKernel[i] = g;
      kernelSum += g;
    }

    // normalization
    for (let i = 0; i < kernelSize; i++) {
      cachedKernel[i] = Math.round((floatKernel[i] / kernelSum) * 65536);
    }
    cachedRadius = radius;
  }

  const kernel = cachedKernel;

  // buffers
  const tempPixels = new Uint8ClampedArray(pixels.length);
  const finalPixels = new Uint8ClampedArray(pixels.length);

  // 2. horizontal (Source -> Temp)
  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let k = 0; k < kernelSize; k++) {
        // Inline clamp по X
        let px = x + k - radius;
        if (px < 0) px = 0;
        else if (px >= width) px = width - 1;

        const offset = (rowBase + px) << 2;
        const weight = kernel[k];

        r += pixels[offset] * weight;
        g += pixels[offset + 1] * weight;
        b += pixels[offset + 2] * weight;
        a += pixels[offset + 3] * weight;
      }

      const dest = (rowBase + x) << 2;
      tempPixels[dest] = r >>> 16;
      tempPixels[dest + 1] = g >>> 16;
      tempPixels[dest + 2] = b >>> 16;
      tempPixels[dest + 3] = a >>> 16;
    }
  }

  // 3. vertical (Temp -> Final)
  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let k = 0; k < kernelSize; k++) {
        // Inline clamp по Y
        let py = y + k - radius;
        if (py < 0) py = 0;
        else if (py >= height) py = height - 1;

        const offset = (py * width + x) << 2;
        const weight = kernel[k];

        r += tempPixels[offset] * weight;
        g += tempPixels[offset + 1] * weight;
        b += tempPixels[offset + 2] * weight;
        a += tempPixels[offset + 3] * weight;
      }

      const dest = (rowBase + x) << 2;
      finalPixels[dest] = r >>> 16;
      finalPixels[dest + 1] = g >>> 16;
      finalPixels[dest + 2] = b >>> 16;
      finalPixels[dest + 3] = a >>> 16;
    }
  }

  return finalPixels;
};
