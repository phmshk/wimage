import { MainPage } from "@/pages/main";
import { ThemeProvider } from "./providers/theme-provider";
import { Toaster } from "@/shared/ui/components/ui/sonner";

function App() {
  return (
    <>
      <ThemeProvider />
      <main className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:flex-row lg:overflow-hidden">
        <MainPage />
        <Toaster />
      </main>
    </>
  );
}

export default App;
