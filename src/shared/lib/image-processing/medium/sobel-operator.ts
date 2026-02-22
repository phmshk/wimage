import type { FilterProcessFn } from "../types";

export const applySobel: FilterProcessFn = (pixels, width, height) => {
  const output = new Uint8ClampedArray(pixels.length);
  const rowBytes = width * 4;

  for (let i = 3; i < output.length; i += 4) {
    output[i] = 255;
  }

  for (let y = 1; y < height - 1; y++) {
    let idx = (y * width + 1) * 4;
    for (let x = 1; x < width - 1; x++, idx += 4) {
      for (let c = 0; c < 3; c++) {
        // 8 pixels around central
        const tl = pixels[idx - rowBytes - 4 + c];
        const tc = pixels[idx - rowBytes + c];
        const tr = pixels[idx - rowBytes + 4 + c];
        const l = pixels[idx - 4 + c];
        const r = pixels[idx + 4 + c];
        const bl = pixels[idx + rowBytes - 4 + c];
        const bc = pixels[idx + rowBytes + c];
        const br = pixels[idx + rowBytes + 4 + c];

        // X:
        // -1  0  1
        // -2  0  2
        // -1  0  1
        const gx = -tl + tr - (l << 1) + (r << 1) - bl + br;

        //  Y:
        // -1 -2 -1
        //  0  0  0
        //  1  2  1
        const gy = -tl - (tc << 1) - tr + bl + (bc << 1) + br;

        // magnitude: |gx| + |gy|
        const gxAbs = gx < 0 ? -gx : gx;
        const gyAbs = gy < 0 ? -gy : gy;
        const mag = gxAbs + gyAbs;

        // clamp
        output[idx + c] = mag > 255 ? 255 : mag;
      }
    }
  }

  return output;
};
