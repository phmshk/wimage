import { ImageUpload } from "@/features/image-upload";
import { ControlPanel } from "@/widgets/control-panel";
import { ImageProcessingProgress } from "@/widgets/progress-visualizer";
import { CanvasArea } from "@/widgets/workarea";

function App() {
  return (
    <main className="flex min-h-screen w-full flex-col lg:h-screen lg:flex-row lg:overflow-hidden ">
      <div className="grid grid-cols-1 lg:grid-cols-4 w-full h-full p-4 gap-4">
        <div className="lg:col-span-3 rounded-xl flex items-center justify-center overflow-auto min-h-100">
          <div className="max-w-full max-h-full p-4">
            <CanvasArea />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
          <ImageProcessingProgress />
          <div className="p-4 rounded-xl ">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider">
              Image Upload
            </h3>
            <ImageUpload />
          </div>

          <div className="p-4 rounded-xl flex-1">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider">
              Filters
            </h3>
            <ControlPanel />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
