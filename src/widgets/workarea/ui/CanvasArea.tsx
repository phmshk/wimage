import { useImageInfo, useIsModified } from "@/entities/image";
import { useImageBitmap, useImageStatus } from "@/entities/image/model/store";
import { workerHost } from "@/entities/worker/WorkerHost";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { Eye, EyeOff, ImageIcon, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const CanvasArea = () => {
  const processedRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<HTMLCanvasElement>(null);

  const offscreenTransferred = useRef<HTMLCanvasElement | null>(null);

  const imgInfo = useImageInfo();
  const bitmap = useImageBitmap();
  const isModified = useIsModified();
  const status = useImageStatus();

  const [showOriginal, setShowOriginal] = useState(false);

  //original
  useEffect(() => {
    if (bitmap && originalRef.current && imgInfo) {
      const ctx = originalRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, imgInfo.width, imgInfo.height);
        ctx.drawImage(bitmap, 0, 0);
      }
    }
  }, [bitmap, imgInfo]);

  // processed
  useEffect(() => {
    if (
      processedRef.current &&
      processedRef.current !== offscreenTransferred.current
    ) {
      try {
        const offscreen = processedRef.current.transferControlToOffscreen();
        workerHost.initOffscreen(offscreen);

        offscreenTransferred.current = processedRef.current;
      } catch (e) {
        console.error("Failed to transfer canvas control:", e);
      }
    }
  }, [imgInfo]);

  const isProcessing = status === "processing";

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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-background/50 backdrop-blur-sm shadow-sm md:p-4 select-none">
      <div
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/40 text-foreground backdrop-blur-md transition-opacity duration-300 ${
          isProcessing
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {isProcessing && (
          <>
            <LoaderCircle className="h-12 w-12 animate-spin text-primary-foreground" />
            <p className="mt-4 text-lg font-medium tracking-wide animate-pulse">
              Processing...
            </p>
          </>
        )}
      </div>
      {isModified && !isProcessing && (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2 animate-in fade-in duration-300 pointer-events-none">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-md transition-transform active:scale-95 select-none touch-none pointer-events-auto",
              showOriginal &&
                "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            style={{ WebkitTouchCallout: "none" }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setShowOriginal(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              e.currentTarget.releasePointerCapture(e.pointerId);
              setShowOriginal(false);
            }}
            onPointerLeave={() => setShowOriginal(false)}
            onContextMenu={(e) => e.preventDefault()}
            title="Hold to see original"
          >
            {showOriginal ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      <div
        className="relative h-full w-full select-none touch-none flex items-center justify-center"
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* original */}
        <canvas
          ref={originalRef}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none"
          width={imgInfo.width}
          height={imgInfo.height}
        />

        {/* processed */}
        <canvas
          id="result"
          ref={processedRef}
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-in-out pointer-events-none",
            isModified && showOriginal ? "opacity-0" : "opacity-100"
          )}
          width={imgInfo.width}
          height={imgInfo.height}
        />

        <div className="absolute top-4 left-4 z-40 rounded bg-background/60 px-2 py-1 text-xs font-bold text-foreground backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-none select-none">
          {!isModified || showOriginal ? "ORIGINAL" : "FILTER"}
        </div>
      </div>
    </div>
  );
};
