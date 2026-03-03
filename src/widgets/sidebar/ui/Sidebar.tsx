import { ImageDownload } from "@/features/image-download";
import { ImageUpload } from "@/features/image-upload";
import { Separator } from "@/shared/ui/components/ui/separator";
import { ControlPanel } from "@/widgets/control-panel";
import { ImageProcessingProgress } from "@/widgets/progress-visualizer";

export const SidebarContent = () => (
  <>
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Image Editor</h1>
        <p className="text-sm text-muted-foreground">
          Adjust filters and export
        </p>
      </div>
    </div>

    <ImageProcessingProgress />

    <div className="flex flex-col gap-6">
      <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="text-sm font-medium leading-none">Actions</h3>
        <div className="flex flex-col gap-2">
          <ImageUpload />
          <ImageDownload />
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-4">
        <h3 className="text-sm font-medium leading-none">Filters</h3>
        <ControlPanel />
      </div>
    </div>
  </>
);
