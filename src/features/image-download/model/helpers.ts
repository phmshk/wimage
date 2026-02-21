import { notify } from "@/shared/lib/notifications";

export const downloadImage = (
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType: string = "image/png",
  quality: number = 1
) => {
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        notify.error(
          "Something gone wrong.",
          "Unfortunately it is not possible to download the image.",
          5000
        );
        return;
      }

      const actualType = blob.type;

      let finalExtension = ".png";
      if (actualType === "image/jpeg") {
        finalExtension = ".jpg";
      } else if (actualType === "image/webp") {
        finalExtension = ".webp";
      }

      const cleanName = fileName.replace(/\.[^/.]+$/, "");
      const finalFileName = `${cleanName}_processed${finalExtension}`;

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
