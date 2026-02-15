import { Button } from "@/shared/ui/components/ui/button";
import { Slider } from "@/shared/ui/components/ui/slider";
import { FilterInfo } from "./FilterInfo";

interface FilterControlProps {
  label: string;
  value: number[];
  onValueChange: (val: number[]) => void;
  min: number;
  max: number;
  step?: number;
  onApply: () => void;
  isDisabled: boolean;
  description?: string;
}

export const FilterControl = (props: FilterControlProps) => {
  const {
    label,
    value,
    onValueChange,
    min,
    max,
    step = 1,
    onApply,
    isDisabled,
    description,
  } = props;
  return (
    <div className="space-y-3 rounded-lg border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {description && <FilterInfo text={description} />}
        </div>
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
