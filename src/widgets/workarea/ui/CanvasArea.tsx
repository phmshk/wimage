import {
  useCurrData,
  useImageInfo,
  useImageStore,
  useIsModified,
  useOriginalData,
} from "@/entities/image";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { Eye, EyeOff, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { drawToCanvas } from "../model/helpers";

export const CanvasArea = () => {
  const processedRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<HTMLCanvasElement>(null);

  const currentData = useCurrData();
  const originalData = useOriginalData();
  const imgInfo = useImageInfo();

  const [showOriginal, setShowOriginal] = useState(false);
  const isModified = useIsModified();

  // processed canvas
  useEffect(() => {
    if (processedRef.current && imgInfo && currentData) {
      drawToCanvas(
        processedRef.current,
        currentData,
        imgInfo.width,
        imgInfo.height
      );
    }
  }, [currentData, imgInfo]);

  // original canvas
  useEffect(() => {
    if (originalRef.current && imgInfo && originalData) {
      drawToCanvas(
        originalRef.current,
        originalData,
        imgInfo.width,
        imgInfo.height
      );
    }
  }, [originalData, imgInfo]);

  // chunks handling
  useEffect(() => {
    const unsub = useImageStore.subscribe(
      (state) => state.lastChunk,
      (chunk) => {
        if (chunk && processedRef.current) {
          drawToCanvas(
            processedRef.current,
            chunk.data,
            chunk.width,
            chunk.height,
            chunk.x,
            chunk.y
          );
        }
      }
    );
    return () => unsub();
  }, [imgInfo]);

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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-background/50 backdrop-blur-sm shadow-sm md:p-4">
      {isModified && (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-md transition-transform active:scale-95 touch-none",
              showOriginal &&
                "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onPointerDown={() => setShowOriginal(true)}
            onPointerUp={() => setShowOriginal(false)}
            onPointerLeave={() => setShowOriginal(false)}
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
        className="relative h-full w-full max-h-full max-w-full"
        style={{ aspectRatio: `${imgInfo.width} / ${imgInfo.height}` }}
      >
        {/* original */}
        <canvas
          ref={originalRef}
          className="absolute inset-0 h-full w-full object-contain"
          width={imgInfo.width}
          height={imgInfo.height}
        />

        {/* processed */}
        <canvas
          ref={processedRef}
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-in-out",
            showOriginal ? "opacity-0" : "opacity-100"
          )}
          width={imgInfo.width}
          height={imgInfo.height}
        />

        <div className="absolute top-4 left-4 z-40 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          {!isModified || showOriginal ? "ORIGINAL" : "FILTER"}
        </div>
      </div>
    </div>
  );
};
