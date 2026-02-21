import { useImageActions, useImageStatus } from "@/entities/image";
import { notify } from "@/shared/lib/notifications";
import { Button } from "@/shared/ui/components/ui/button";
import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";

export const ImageUpload = () => {
  const { setImage } = useImageActions();
  const status = useImageStatus();

  const validateImage = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      notify.error("Only images allowed");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      // 100MB
      notify.error("Max 100MB");
      return false;
    }
    return true;
  };

  const isDisabled = status === "loading" || status === "processing";

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateImage(file)) return;

    const filename = file.name.replace(/\.[^/.]+$/, "");

    try {
      const [bitmapUI, bitmapWorker] = await Promise.all([
        createImageBitmap(file),
        createImageBitmap(file),
      ]);

      setImage({
        bitmap: bitmapUI,
        workerBitmap: bitmapWorker,
        width: bitmapUI.width,
        height: bitmapUI.height,
        filename,
      });

      notify.success("Image loaded successfully");
    } catch (err) {
      notify.error(`Failed to load: ${(err as Error).message}`);
    }
  };

  return (
    <>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="default"
        className="w-full"
        disabled={isDisabled}
        asChild
      >
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </label>
      </Button>
    </>
  );
};
