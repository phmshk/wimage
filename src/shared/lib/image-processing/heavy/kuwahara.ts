import type { FilterProcessFn } from "../types";

export const applyKuwahara: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 6;
  const output = new Uint8ClampedArray(pixels.length);

  const currentStats = new Float32Array(4);

  const evalRegion = (x1: number, y1: number, x2: number, y2: number) => {
    let rSum = 0,
      gSum = 0,
      bSum = 0;
    let rSqSum = 0,
      gSqSum = 0,
      bSqSum = 0;
    let count = 0;

    for (let y = y1; y <= y2; y++) {
      // inline clamp by Y
      let py = y;
      if (py < 0) py = 0;
      else if (py >= height) py = height - 1;
      const rowBase = py * width;

      for (let x = x1; x <= x2; x++) {
        // inline clamp by X
        let px = x;
        if (px < 0) px = 0;
        else if (px >= width) px = width - 1;

        const idx = (rowBase + px) << 2; // << 2 = * 4

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

    const variance =
      rSqSum / count -
      rMean * rMean +
      (gSqSum / count - gMean * gMean) +
      (bSqSum / count - bMean * bMean);

    currentStats[0] = variance;
    currentStats[1] = rMean;
    currentStats[2] = gMean;
    currentStats[3] = bMean;
  };

  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      // top-left
      evalRegion(x - radius, y - radius, x, y);
      let minVar = currentStats[0];
      let bestR = currentStats[1];
      let bestG = currentStats[2];
      let bestB = currentStats[3];

      // top-right
      evalRegion(x, y - radius, x + radius, y);
      if (currentStats[0] < minVar) {
        minVar = currentStats[0];
        bestR = currentStats[1];
        bestG = currentStats[2];
        bestB = currentStats[3];
      }

      // bottom-left
      evalRegion(x - radius, y, x, y + radius);
      if (currentStats[0] < minVar) {
        minVar = currentStats[0];
        bestR = currentStats[1];
        bestG = currentStats[2];
        bestB = currentStats[3];
      }

      // bottom-right
      evalRegion(x, y, x + radius, y + radius);
      if (currentStats[0] < minVar) {
        bestR = currentStats[1];
        bestG = currentStats[2];
        bestB = currentStats[3];
      }

      const dest = (rowBase + x) << 2;
      output[dest] = bestR;
      output[dest + 1] = bestG;
      output[dest + 2] = bestB;
      output[dest + 3] = pixels[dest + 3];
    }
  }

  return output;
};
