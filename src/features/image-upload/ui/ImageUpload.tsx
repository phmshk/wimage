import { useImageActions } from "@/entities/image";
import { Button } from "@/shared/ui/components/ui/button";
import type { ChangeEvent } from "react";

export const ImageUpload = () => {
  const { setImage } = useImageActions();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(img, 0, 0);
      const imgData = context.getImageData(0, 0, img.width, img.height);
      if (!imgData) return;

      setImage(imgData.data, img.width, img.height);

      URL.revokeObjectURL(img.src);
    };
  };

  return (
    <div className="flex gap-2 items-center">
      <label htmlFor="upload" className="cursor-pointer">
        <Button variant="outline" asChild>
          <span>Upload Image</span>
        </Button>
      </label>
      <input
        id="upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};
