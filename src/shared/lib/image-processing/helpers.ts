/** Finds the position  of a pixel in an image data array.
 * @param x - horizontal coordinate of the pixel
 * @param y - vertical coordinate of the pixel
 * @param width - total width of the image in pixels
 * @param height - total height of the image in pixels
 * @returns starting position in the array
 */
export function getPixelIndex(
  x: number,
  y: number,
  width: number,
  height: number
): number {
  const clampedX = Math.max(0, Math.min(x, width - 1));
  const clampedY = Math.max(0, Math.min(y, height - 1));
  return (clampedY * width + clampedX) * 4;
}
