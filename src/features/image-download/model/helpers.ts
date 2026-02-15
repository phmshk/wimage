export const downloadImage = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  fileName: string,
  mimeType: string = "image/png",
  quality: number = 1
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

  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      const actualType = blob.type;
      console.log(actualType);

      let finalExtension = "";
      if (actualType === "image/jpeg") {
        finalExtension = ".jpg";
      } else if (actualType === "image/webp") {
        finalExtension = ".webp";
      } else {
        finalExtension = ".png";
      }

      const cleanName = fileName.replace(/\.[^/.]+$/, "");
      const finalFileName = `${cleanName}${finalExtension}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = finalFileName;
      link.click();

      URL.revokeObjectURL(url);
    },
    mimeType,
    quality
  );
};
