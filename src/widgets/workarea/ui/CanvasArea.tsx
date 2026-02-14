import { useCurrData, useImageInfo, useImageStore } from "@/entities/image";
import { cn } from "@/shared/lib/utils";
import { ImageIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export const CanvasArea = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentData = useCurrData();
  const imgInfo = useImageInfo();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentData || !imgInfo) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const imageData = new ImageData(
      currentData as unknown as ImageDataArray,
      imgInfo.width,
      imgInfo.height
    );

    context.putImageData(imageData, 0, 0);
  }, [currentData, imgInfo]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const unsub = useImageStore.subscribe(
      (state) => state.lastChunk,
      (chunk) => {
        if (chunk) {
          const imgData = new ImageData(
            chunk.data as unknown as ImageDataArray,
            chunk.width,
            chunk.height
          );
          context.putImageData(imgData, chunk.x, chunk.y);
        }
      }
    );

    return () => unsub();
  }, [canvasRef.current]);

  if (!imgInfo) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-muted-foreground">
        <div className="rounded-full bg-background p-4 shadow-sm">
          <ImageIcon className="h-8 w-8 opacity-50" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">No image loaded</h3>
          <p className="text-sm text-muted-foreground">
            Upload an image from the sidebar to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-background shadow-sm">
      <canvas
        ref={canvasRef}
        width={imgInfo.width}
        height={imgInfo.height}
        className={cn(
          "max-h-full max-w-full object-contain",
          "animate-in fade-in zoom-in-95 duration-300"
        )}
      />
    </div>
  );
};
