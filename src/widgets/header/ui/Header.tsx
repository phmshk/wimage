import { ThemeToggle } from "@/features/theme-toggle";
import { MobileNav } from "./MobileNav";
import { DesktopNav } from "./DesktopNav";

export const Header = () => {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <MobileNav />
        <DesktopNav />
      </div>

      <div className="flex items-center gap-2">
        {/* <a */}
        {/*   href="https://github.com/phmshk" */}
        {/*   target="_blank" */}
        {/*   rel="noreferrer" */}
        {/*   className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" */}
        {/*   aria-label="GitHub Repository" */}
        {/* > */}
        {/*   <span className="text-xs">Authhor</span> */}
        {/* </a> */}

        <ThemeToggle />
      </div>
    </header>
  );
};
