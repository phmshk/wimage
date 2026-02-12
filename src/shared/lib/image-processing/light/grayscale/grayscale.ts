import type { FilterProcessFn } from "../../types";

export const applyGrayscale: FilterProcessFn = (pixels) => {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    /*  BT.601 FORMULA
     *  BT.601 defines the standard for converting RGB to Y′CbCr color space in standard-definition television.
     *  The core formula for luma (Y′) is:
     *  Y′ = 0.299R + 0.587G + 0.114B
     */
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }

  return pixels;
};
