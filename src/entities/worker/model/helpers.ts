import { PX_SIZE } from "./constants";

/**
 * Extracts a specific chunk from an image data array
 * including an additional padding around the edges
 * @param startX - X coordinate of the top-left corner of the main chunk
 * @param startY - Y coordinate of the top-left corner of the main chunk
 * @param originalWidth -  width of the source image in pixels
 * @param originalHeight - height of the source image in pixels
 * @param originalData - raw RGBA image data (Uint8ClampedArray)
 * @param chunkWidth - width of the chunk (default: 256)
 * @param chunkHeight - height of the chunk (default: 256)
 * @param padding - number of extra pixels to include on each side (default: 2) !!!!!! if filter has radius in options it MUST be used as padding
 * @param destBuffer - optinal param for wasm to write directly in this buffer without new allocations
 * * @returns new Uint8ClampedArray containing the padded chunk
 */
export const getChunkWithPadding = (
  startX: number,
  startY: number,
  originalWidth: number,
  originalHeight: number,
  originalData: Uint8ClampedArray,
  chunkWidth: number,
  chunkHeight: number,
  padding: number,
  destBuffer?: Uint8Array | Uint8ClampedArray
): Uint8Array | Uint8ClampedArray => {
  // calculate dimensions of the new chunk including the padding
  const paddedWidth = chunkWidth + padding * 2;
  const paddedHeight = chunkHeight + padding * 2;
  // use destination buffe of allocate memory for the new chunk
  const chunkData =
    destBuffer || new Uint8ClampedArray(paddedWidth * paddedHeight * PX_SIZE);

  // iterate through every row of the padded chunk
  for (let y = 0; y < paddedHeight; y++) {
    // map current row in the chunk to the row in the original image
    const originalY = startY - padding + y;

    // if calculated Y is outside the original image => skip this row
    if (originalY < 0 || originalY >= originalHeight) continue;

    // calculate where to start reading X in the original image
    let currentStartX = startX - padding;
    let currentReadWidth = paddedWidth;

    // destOffset is the shift inside the new chunk
    // usually 0 unless we are at the left edge of the image
    let destOffset = 0;
    // left edge check
    // if currentStartX is negative => we are off the left edge

    if (currentStartX < 0) {
      destOffset = Math.abs(currentStartX);
      currentReadWidth -= destOffset;
      currentStartX = 0;
    }

    // right edge check
    // calculate how many pixels exist from current X to the right edge of the image
    const remainingWidth = originalWidth - currentStartX;
    const actualWidthToRead = Math.min(currentReadWidth, remainingWidth);

    // if there is no width left to read skip
    if (actualWidthToRead <= 0) continue;

    const srcStartIndex = (originalY * originalWidth + currentStartX) * PX_SIZE;
    const destStartIndex = (y * paddedWidth + destOffset) * PX_SIZE;
    const rowBytes = actualWidthToRead * PX_SIZE;

    chunkData.set(
      originalData.subarray(srcStartIndex, srcStartIndex + rowBytes),
      destStartIndex
    );
  }

  return chunkData;
};
/**
 * takes raw buffer with padding and crops it to the original chunk dimensions
 * @param sourceBuffer - buffer with data
 * @param chunkWidth - width of the final chunk without padding
 * @param chunkHeight - height of the final chunk without padding
 * @param padding - size of the margin to be removed from all sides
 * @returns new Uint8ClampedArray of the exact chunk dimensions
 * */
export const extractAndCropChunk = (
  sourceBuffer: Uint8Array | Uint8ClampedArray,
  chunkWidth: number,
  chunkHeight: number,
  padding: number
): Uint8ClampedArray => {
  const paddedWidth = chunkWidth + padding * 2;
  const cleanResult = new Uint8ClampedArray(chunkWidth * chunkHeight * PX_SIZE);

  for (let y = 0; y < chunkHeight; y++) {
    const srcIndex = ((y + padding) * paddedWidth + padding) * PX_SIZE;
    const destIndex = y * chunkWidth * PX_SIZE;
    const rowBytes = chunkWidth * PX_SIZE;

    cleanResult.set(
      sourceBuffer.subarray(srcIndex, srcIndex + rowBytes),
      destIndex
    );
  }

  return cleanResult;
};

//NOTE: function from previous version. intentionally left here.

/**
 * Processes a padded image chunk using a filter function and crops
 * the result back to the original chunk dimensions.
 * @param paddedChunk - input data array including padding
 * @param filterFn - callback function that applies the image filter
 * @param options - options nedded for callback function
 * @param chunkWidth - width of the final chunk without padding
 * @param chunkHeight - height of the final chunk without padding
 * @param padding - size of the margin to be removed from all sides
 * @returns new Uint8ClampedArray of the exact chunk dimensions
 */
// export const applyFilterAndCrop = (
//   paddedChunk: Uint8ClampedArray,
//   filterFn: FilterProcessFn,
//   chunkWidth: number,
//   chunkHeight: number,
//   padding: number,
//   options?: FilterOptions
// ): Uint8ClampedArray => {
//   const paddedWidth = chunkWidth + padding * 2;
//   const paddedHeight = chunkHeight + padding * 2;
//   const filteredPadded = filterFn(
//     paddedChunk,
//     paddedWidth,
//     paddedHeight,
//     options
//   );
//
//   const cleanResult = new Uint8ClampedArray(chunkWidth * chunkHeight * PX_SIZE);
//
//   for (let y = 0; y < chunkHeight; y++) {
//     const srcIndex = ((y + padding) * paddedWidth + padding) * PX_SIZE;
//     const destIndex = y * chunkWidth * PX_SIZE;
//     const rowBytes = chunkWidth * PX_SIZE;
//
//     cleanResult.set(
//       filteredPadded.subarray(srcIndex, srcIndex + rowBytes),
//       destIndex
//     );
//   }
//
//   return cleanResult;
// };

export const buildGaussianKernel = (radius: number): Float32Array => {
  const sigma = radius / 3;
  const size = 2 * radius + 1;
  const kernel = new Float32Array(size);
  let sum = 0;

  for (let i = -radius; i <= radius; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel[i + radius] = val;
    sum += val;
  }

  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  return kernel;
};
