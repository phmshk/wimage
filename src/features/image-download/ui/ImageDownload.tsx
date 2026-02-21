import { ChevronDown, Download } from "lucide-react";
import { downloadImage } from "../model/helpers";
import { Button } from "@/shared/ui/components/ui/button";
import { useImageInfo, useImageStatus } from "@/entities/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/components/ui/dropdown-menu";

export const ImageDownload = () => {
  const info = useImageInfo();
  const status = useImageStatus();

  const handleDownload = (mimeType: string) => {
    if (!info) return;

    const canvas = document.getElementById("result") as HTMLCanvasElement;

    if (canvas) {
      downloadImage(canvas, info.filename, mimeType);
    }
  };

  const isDisabled =
    status === "no_img" || status === "processing" || status === "error";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={isDisabled}
        >
          <span className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Download Result
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem onClick={() => handleDownload("image/png")}>
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("image/jpeg")}>
          Download as JPEG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("image/webp")}>
          Download as WEBP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
