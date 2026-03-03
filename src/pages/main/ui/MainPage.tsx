import { Button } from "@/shared/ui/components/ui/button";
import {
  SheetTrigger,
  SheetContent,
  SheetTitle,
  Sheet,
  SheetDescription,
} from "@/shared/ui/components/ui/sheet";
import { SidebarContent } from "@/widgets/sidebar";
import { CanvasArea } from "@/widgets/workarea";
import { SlidersHorizontal } from "lucide-react";

export const MainPage = () => {
  return (
    <div className="flex h-full w-full flex-col lg:flex-row overflow-hidden">
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-muted/30 p-4">
        <CanvasArea />

        {/* Floating Action Button for Mobile Controls */}
        <div className="absolute bottom-6 right-6 z-40 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <SlidersHorizontal className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-87 p-0">
              <SheetTitle className="sr-only">Editor Controls</SheetTitle>
              <SheetDescription className="sr-only">
                Use this sidebar to upload or download pictures and apply
                filters to them.
              </SheetDescription>
              <div className="h-full overflow-y-auto p-6">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <aside className="hidden lg:flex w-80 min-w-80 flex-col gap-6 border-l bg-background p-6 overflow-y-auto select-none">
        <SidebarContent />
      </aside>
    </div>
  );
};
