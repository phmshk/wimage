import { ChevronDown, Download } from "lucide-react";
import { downloadImage } from "../model/helpers";
import { Button } from "@/shared/ui/components/ui/button";
import { useCurrData, useImageInfo, useImageStatus } from "@/entities/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/components/ui/dropdown-menu";

export const ImageDownload = () => {
  const info = useImageInfo();
  const currData = useCurrData();
  const status = useImageStatus();

  const handleDownload = (ext: string, mimeType: string) => {
    if (currData && info) {
      const finalName = `${info.filename}_processed.${ext}`;

      downloadImage(currData, info.width, info.height, finalName, mimeType);
    }
  };
  const isDisabled = status === "processing" || !currData;

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
        <DropdownMenuItem onClick={() => handleDownload("png", "image/png")}>
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("jpg", "image/jpeg")}>
          Download as JPEG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("webp", "image/webp")}>
          Download as WEBP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
