export const downloadImage = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fileName: string = "processed-image.png"
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) return;

  const imageData = new ImageData(
    data as unknown as ImageDataArray,
    width,
    height
  );
  context.putImageData(imageData, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }, "image/png");
};
