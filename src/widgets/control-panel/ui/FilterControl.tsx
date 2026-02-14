import { Button } from "@/shared/ui/components/ui/button";
import { Slider } from "@/shared/ui/components/ui/slider";

interface FilterControlProps {
  label: string;
  value: number[];
  onValueChange: (val: number[]) => void;
  min: number;
  max: number;
  step?: number;
  onApply: () => void;
  isDisabled: boolean;
}

export const FilterControl = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  onApply,
  isDisabled,
}: FilterControlProps) => {
  return (
    <div className="space-y-3 rounded-lg border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        <span className="w-8 text-right font-mono text-xs text-muted-foreground">
          {value[0]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Slider
          value={value}
          onValueChange={onValueChange}
          max={max}
          min={min}
          step={step}
          disabled={isDisabled}
          className="flex-1"
        />
        <Button
          onClick={onApply}
          disabled={isDisabled}
          size="sm"
          variant="secondary"
          className="h-7 px-3 text-xs"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
