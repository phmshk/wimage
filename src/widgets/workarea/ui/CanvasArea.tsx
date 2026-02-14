import { useCurrData, useImageInfo, useImageStore } from "@/entities/image";
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

  if (!imgInfo) return <div className="text-gray-400">No image loaded</div>;
  return (
    <div className="relative w-full h-150 bg-gray-100 flex items-center justify-center overflow-hidden border rounded-lg">
      <canvas
        ref={canvasRef}
        width={imgInfo.width}
        height={imgInfo.height}
        className="max-w-full max-h-full object-contain shadow-lg"
      />
    </div>
  );
};
