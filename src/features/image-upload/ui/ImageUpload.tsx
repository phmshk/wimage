import { useImageActions, useImageStatus } from "@/entities/image";
import { notify } from "@/shared/lib/notifications";
import { Button } from "@/shared/ui/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { normalizeImageFile, validateImage } from "../model/helpers";
import { useBenchmarkActions } from "@/entities/benchmark";

export const ImageUpload = () => {
  const { setImage } = useImageActions();
  const status = useImageStatus();
  const [isUploading, setIsUploading] = useState(false);
  const { setResults, setStatus: setBenchmarkStatus } = useBenchmarkActions();

  const isDisabled = status === "loading" || status === "processing";

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }
    try {
      setIsUploading(true);

      const {
        blob,
        filename: safeFilename,
        size,
      } = await normalizeImageFile(file);

      const cleanFilename = safeFilename.replace(/\.[^/.]+$/, "");

      const [bitmapUI, bitmapWorker] = await Promise.all([
        createImageBitmap(blob),
        createImageBitmap(blob),
      ]);

      setImage({
        bitmap: bitmapUI,
        workerBitmap: bitmapWorker,
        width: bitmapUI.width,
        height: bitmapUI.height,
        filename: cleanFilename,
        size,
      });
      setResults([]);
      setBenchmarkStatus("idle");

      notify.success("Image loaded successfully");
    } catch (err) {
      notify.error(`Failed to load: ${(err as Error).message}`);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        id="image-upload"
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="default"
        className="w-full"
        disabled={isDisabled}
        asChild
      >
        <label htmlFor="image-upload" className="cursor-pointer font-medium">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </label>
      </Button>
    </>
  );
};
