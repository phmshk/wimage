import { useCurrData, useImageInfo, useImageStatus } from "@/entities/image";
import { useEffect, useRef } from "react";

export const CanvasArea = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentData = useCurrData();
  const imgInfo = useImageInfo();
  const status = useImageStatus();

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

  if (!imgInfo) return <div className="text-gray-400">No image loaded</div>;
  return (
    <div className="relative w-full h-150 bg-gray-100 flex items-center justify-center overflow-hidden border rounded-lg">
      {status === "processing" && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <span className="text-white font-bold animate-pulse">
            Processing...
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={imgInfo.width}
        height={imgInfo.height}
        className="max-w-full max-h-full object-contain shadow-lg"
      />
    </div>
  );
};
