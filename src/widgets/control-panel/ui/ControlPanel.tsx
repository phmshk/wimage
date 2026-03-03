import { useMetrics, useImageActions, useImageStatus } from "@/entities/image";
import { cn, formatTime } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { FilterControl } from "./FilterControl";
import { FILTERS_META } from "@/shared/config";
import { FilterInfo } from "./FilterInfo";
import { useImageBitmap } from "@/entities/image/model/store";
import { EngineSelector } from "@/features/change-engine";
import { Separator } from "@/shared/ui/components/ui/separator";
import { useEngine } from "@/entities/editor";

export const ControlPanel = () => {
  const { applyFilter, resetToOriginal } = useImageActions();
  const lastMetrics = useMetrics();
  const status = useImageStatus();
  const hasImage = !!useImageBitmap();

  const isBusy = status === "processing";
  const isDisabled = isBusy || !hasImage;

  const engine = useEngine();

  const radiusUiDefaults = FILTERS_META["gaussian-blur"].ui?.radius ?? {
    min: 1,
    max: 10,
    step: 1,
  };

  const [blurRadius, setBlurRadius] = useState([
    FILTERS_META["gaussian-blur"].defaultOptions?.radius ?? 3,
  ]);
  const [medianRadius, setMedianRadius] = useState([
    FILTERS_META.median.defaultOptions?.radius ?? 2,
  ]);
  const [kuwaharaRadius, setKuwaharaRadius] = useState([
    FILTERS_META.kuwahara.defaultOptions?.radius ?? 6,
  ]);
  const [bilateralRadius, setBilateralRadius] = useState([
    FILTERS_META.bilateral.defaultOptions?.radius ?? 2,
  ]);

  return (
    <div className="relative flex flex-col gap-6 pb-10">
      {!hasImage && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 backdrop-blur-[2px]">
          <span className="rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md">
            Upload image to enable filters
          </span>
        </div>
      )}
      {/* metrics */}
      {lastMetrics && (
        <div className="rounded-md p-3 text-xs animate-in fade-in slide-in-from-bottom-2 border bg-border">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-muted-foreground">
              Total Time:
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {formatTime(lastMetrics.totalTime)}
            </span>
            <span className="font-medium text-muted-foreground">
              Raw Compute Time:
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              {formatTime(lastMetrics.computeTime)}
            </span>
          </div>
        </div>
      )}

      <Separator />

      <div
        className={cn(
          "flex flex-col gap-6 transition-all duration-300",
          !hasImage && "opacity-40 grayscale pointer-events-none"
        )}
      >
        <EngineSelector />
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Basic Adjustments
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {/* Grayscale */}
            <div className="flex flex-col gap-1">
              <Button
                disabled={isDisabled}
                variant="outline"
                onClick={() => applyFilter("grayscale", engine)}
                size="sm"
                className="text-xs w-full"
              >
                Gray
              </Button>
              <div className="flex justify-center">
                <FilterInfo text={FILTERS_META.grayscale.description} />
              </div>
            </div>

            {/* Invert */}
            <div className="flex flex-col gap-1">
              <Button
                disabled={isDisabled}
                variant="outline"
                onClick={() => applyFilter("inversion", engine)}
                size="sm"
                className="text-xs w-full"
              >
                Invert
              </Button>
              <div className="flex justify-center">
                <FilterInfo text={FILTERS_META.inversion.description} />
              </div>
            </div>

            {/* Sepia */}
            <div className="flex flex-col gap-1">
              <Button
                disabled={isDisabled}
                variant="outline"
                onClick={() => applyFilter("sepia", engine)}
                size="sm"
                className="text-xs w-full"
              >
                Sepia
              </Button>
              <div className="flex justify-center">
                <FilterInfo text={FILTERS_META.sepia.description} />
              </div>
            </div>
          </div>
        </div>

        {/* Convolution Filters */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Convolution
          </h4>

          {/* Gaussian Blur */}
          <FilterControl
            label={FILTERS_META["gaussian-blur"].label}
            description={FILTERS_META["gaussian-blur"].description}
            value={blurRadius}
            onValueChange={setBlurRadius}
            min={radiusUiDefaults.min}
            max={radiusUiDefaults.max}
            step={radiusUiDefaults.step}
            onApply={() =>
              applyFilter("gaussian-blur", engine, { radius: blurRadius[0] })
            }
            isDisabled={isDisabled}
          />

          {/* Sharpen */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium">Sharpen</span>
              <FilterInfo text={FILTERS_META.sharpen.description} />
            </div>
            <Button
              disabled={isDisabled}
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={() => applyFilter("sharpen", engine)}
            >
              <Play className="mr-1.5 h-3 w-3" /> Apply
            </Button>
          </div>

          {/* Sobel */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium">Sobel Detection</span>
              <FilterInfo text={FILTERS_META.sobel.description} />
            </div>
            <Button
              disabled={isDisabled}
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={() => applyFilter("sobel", engine)}
            >
              <Play className="mr-1.5 h-3 w-3" /> Apply
            </Button>
          </div>
        </div>

        {/* Heavy Filters */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Non-Linear / Heavy
          </h4>

          {/* Median */}
          <FilterControl
            label={FILTERS_META.median.label}
            description={FILTERS_META.median.description}
            value={medianRadius}
            onValueChange={setMedianRadius}
            min={radiusUiDefaults.min}
            max={radiusUiDefaults.max}
            step={radiusUiDefaults.step}
            onApply={() =>
              applyFilter("median", engine, { radius: medianRadius[0] })
            }
            isDisabled={isDisabled}
          />

          {/* Kuwahara */}
          <FilterControl
            label={FILTERS_META.kuwahara.label}
            description={FILTERS_META.kuwahara.description}
            value={kuwaharaRadius}
            onValueChange={setKuwaharaRadius}
            min={radiusUiDefaults.min}
            max={radiusUiDefaults.max}
            step={radiusUiDefaults.step}
            onApply={() =>
              applyFilter("kuwahara", engine, { radius: kuwaharaRadius[0] })
            }
            isDisabled={isDisabled}
          />

          {/* Bilateral */}
          <FilterControl
            label={FILTERS_META.bilateral.label}
            description={FILTERS_META.bilateral.description}
            value={bilateralRadius}
            onValueChange={setBilateralRadius}
            min={radiusUiDefaults.min}
            max={radiusUiDefaults.max}
            step={radiusUiDefaults.step}
            onApply={() =>
              applyFilter("bilateral", engine, { radius: bilateralRadius[0] })
            }
            isDisabled={isDisabled}
          />
        </div>

        <Separator />

        <Button
          variant="destructive"
          className="w-full"
          onClick={resetToOriginal}
          disabled={isDisabled}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Original
        </Button>
      </div>
    </div>
  );
};
