export interface FilterOptions {
  radius?: number;
}

export type FilterProcessFn = (
  pixelsArray: Uint8ClampedArray,
  width: number,
  height: number,
  options?: FilterOptions
) => Uint8ClampedArray;
