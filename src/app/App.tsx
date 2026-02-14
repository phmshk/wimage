import { ImageDownload } from "@/features/image-download";
import { ImageUpload } from "@/features/image-upload";
import { Separator } from "@/shared/ui/components/ui/separator";
import { ControlPanel } from "@/widgets/control-panel";
import { ImageProcessingProgress } from "@/widgets/progress-visualizer";
import { CanvasArea } from "@/widgets/workarea";

function App() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* Main Canvas Area */}
      <section className="relative flex min-h-[50vh] flex-1 flex-col items-center justify-center overflow-hidden bg-muted/30 p-4 lg:min-h-full">
        <CanvasArea />
      </section>

      {/* Sidebar Controls */}
      <aside className="flex w-full flex-col gap-6 border-t bg-background p-6 lg:w-80 lg:min-w-80 lg:border-l lg:border-t-0 lg:overflow-y-auto">
        {/* Header / Title */}
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Image Editor</h1>
          <p className="text-sm text-muted-foreground">
            Adjust filters and export
          </p>
        </div>

        <ImageProcessingProgress />

        <div className="flex flex-col gap-6">
          {/* Actions Section */}
          <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              <ImageUpload />
              <ImageDownload />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Filters Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none">Filters</h3>
            <ControlPanel />
          </div>
        </div>
      </aside>
    </main>
  );
}

export default App;
