import { useImageActions } from "@/entities/image";
import { Button } from "@/shared/ui/components/ui/button";

export const StopFilter = () => {
  const { cancelProcessing } = useImageActions();
  return (
    <Button variant="destructive" onClick={cancelProcessing}>
      Stop applying filter
    </Button>
  );
};
