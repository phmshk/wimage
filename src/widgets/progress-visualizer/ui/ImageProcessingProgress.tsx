import {
  useImageStatus,
  useProcessingProgress,
} from "@/entities/image/model/store";
import { Progress } from "@/shared/ui/components/ui/progress";
import { Loader } from "lucide-react";

export const ImageProcessingProgress = () => {
  const progress = useProcessingProgress();
  const status = useImageStatus();

  if (status !== "processing") return null;

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-1">
        {status === "processing" && (
          <div className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground/80">
              Applying filter...
            </span>
          </div>
        )}

        <span className="text-sm tabular-nums font-semibold text-primary">
          {progress}%
        </span>
      </div>

      <Progress
        value={progress}
        className="h-2.5 w-full bg-secondary overflow-hidden"
      />
    </div>
  );
};
