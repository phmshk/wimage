export const drawToCanvas = (
  canvas: HTMLCanvasElement,
  data: Uint8ClampedArray | null,
  width: number,
  height: number,
  x: number = 0,
  y: number = 0
) => {
  if (!data || !canvas) return;
  const context = canvas.getContext("2d", {
    desynchronized: true,
  });
  if (!context) return;

  const imageData = new ImageData(
    data as unknown as ImageDataArray,
    width,
    height
  );
  context.putImageData(imageData, x, y);
};
