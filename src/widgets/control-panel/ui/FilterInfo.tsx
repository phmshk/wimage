import { Button } from "@/shared/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/components/ui/popover";
import { CircleHelp } from "lucide-react";

interface FilterInfoProps {
  text: string;
}

export const FilterInfo = ({ text }: FilterInfoProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Filter info">
          <CircleHelp />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-50 p-3 text-xs text-center">
        {text}
      </PopoverContent>
    </Popover>
  );
};
