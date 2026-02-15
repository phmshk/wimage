import { MainPage } from "@/pages/main";
import { ThemeProvider } from "./providers/theme-provider";
import { ToastProvider } from "./providers/toast-provider";

function App() {
  return (
    <>
      <ThemeProvider />
      <main className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:flex-row lg:overflow-hidden">
        <MainPage />
        <ToastProvider />
      </main>
    </>
  );
}

export default App;
