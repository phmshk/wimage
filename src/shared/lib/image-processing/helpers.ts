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
