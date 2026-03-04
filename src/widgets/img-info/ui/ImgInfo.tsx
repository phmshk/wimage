import { useImageInfo } from "@/entities/image";
import { formatBytes } from "@/shared/lib/utils";
import { Separator } from "@/shared/ui/components/ui/separator";
import { ImageIcon, Ruler, Grid2X2, HardDrive } from "lucide-react";

export const ImgInfo = () => {
  const imageInfo = useImageInfo();

  if (!imageInfo) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <ImageIcon className="h-4 w-4 text-primary/70" aria-hidden="true" />
        <span className="truncate max-w-52">
          {imageInfo.filename || "Target Image"}
        </span>
      </div>

      <Separator orientation="vertical" />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          <span>
            {imageInfo.width} &times; {imageInfo.height} px
          </span>
        </div>

        <div className="flex items-center gap-1.5" title="Total Megapixels">
          <Grid2X2 className="h-4 w-4" aria-hidden="true" />
          <span>
            {((imageInfo.width * imageInfo.height) / 1_000_000).toFixed(2)} MP
          </span>
        </div>

        <div
          className="flex items-center gap-1.5"
          title={`${imageInfo.size.toLocaleString()} bytes`}
        >
          <HardDrive
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span>{formatBytes(imageInfo.size)}</span>
        </div>
      </div>
    </div>
  );
};
