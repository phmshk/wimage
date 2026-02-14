import { Download } from "lucide-react";
import { downloadImage } from "../model/helpers";
import { Button } from "@/shared/ui/components/ui/button";
import { useCurrData, useImageInfo, useImageStatus } from "@/entities/image";

export const ImageDownload = () => {
  const info = useImageInfo();
  const currData = useCurrData();
  const status = useImageStatus();

  const handleDownload = () => {
    if (currData && info) {
      downloadImage(currData, info.width, info.height);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={status === "processing" || !currData}
      onClick={handleDownload}
    >
      <Download className="mr-2 h-4 w-4" />
      Download Result
    </Button>
  );
};
