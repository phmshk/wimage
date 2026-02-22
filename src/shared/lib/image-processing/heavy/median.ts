import type { FilterProcessFn } from "../types";

const counts = new Int32Array(256);

let cachedSize = -1;
let rArr: Uint8Array;
let gArr: Uint8Array;
let bArr: Uint8Array;

function findMedian(arr: Uint8Array, size: number, mid: number): number {
  counts.fill(0);
  for (let i = 0; i < size; i++) {
    counts[arr[i]]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += counts[i];
    if (sum > mid) return i;
  }
  return 0;
}

export const applyMedian: FilterProcessFn = (
  pixels,
  width,
  height,
  options
) => {
  const radius = options?.radius || 2;
  if (radius < 1) return pixels;

  const size = (2 * radius + 1) ** 2;
  const mid = Math.floor(size / 2);

  if (size !== cachedSize) {
    rArr = new Uint8Array(size);
    gArr = new Uint8Array(size);
    bArr = new Uint8Array(size);
    cachedSize = size;
  }

  const output = new Uint8ClampedArray(pixels.length);

  for (let y = 0; y < height; y++) {
    const rowBase = y * width;

    for (let x = 0; x < width; x++) {
      let count = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        let py = y + ky;
        if (py < 0) py = 0;
        else if (py >= height) py = height - 1;
        const pRowBase = py * width;

        for (let kx = -radius; kx <= radius; kx++) {
          let px = x + kx;
          if (px < 0) px = 0;
          else if (px >= width) px = width - 1;

          const idx = (pRowBase + px) << 2;

          rArr[count] = pixels[idx];
          gArr[count] = pixels[idx + 1];
          bArr[count] = pixels[idx + 2];
          count++;
        }
      }

      const dest = (rowBase + x) << 2;

      output[dest] = findMedian(rArr, size, mid);
      output[dest + 1] = findMedian(gArr, size, mid);
      output[dest + 2] = findMedian(bArr, size, mid);
      output[dest + 3] = pixels[dest + 3];
    }
  }

  return output;
};
