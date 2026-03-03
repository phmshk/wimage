import { Header } from "@/widgets/header";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  ),
});
