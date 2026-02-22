import type { FilterProcessFn } from "../types";

export const applyGrayscale: FilterProcessFn = (pixels) => {
  const length = pixels.length;
  for (let i = 0; i < length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    /*  BT.601 FORMULA
     *  BT.601 defines the standard for converting RGB to Y′CbCr color space in standard-definition television.
     *  The core formula for luma (Y′) is:
     *  Y′ = 0.299R + 0.587G + 0.114B
     */
    // BT.601 Fixed-point formula: (R*77 + G*150 + B*29) / 256
    const gray = (r * 77 + g * 150 + b * 29) >> 8;

    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }

  return pixels;
};
