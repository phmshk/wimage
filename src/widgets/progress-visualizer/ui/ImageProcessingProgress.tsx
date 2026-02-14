import {
  useImageStatus,
  useProcessingProgress,
} from "@/entities/image/model/store";
import { Progress } from "@/shared/ui/components/ui/progress";
import { Loader2 } from "lucide-react";

export const ImageProcessingProgress = () => {
  const progress = useProcessingProgress();
  const status = useImageStatus();

  if (status !== "processing") return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing...</span>
        </div>
        <span className="font-mono font-medium text-foreground">
          {progress}%
        </span>
      </div>

      <Progress value={progress} className="h-2 w-full" />
    </div>
  );
};
