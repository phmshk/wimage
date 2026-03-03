import { Button } from "@/shared/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/components/ui/sheet";
import { NavLinks } from "@/widgets/navlinks";
import { Menu } from "lucide-react";
import { useState } from "react";

export const MobileNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="md:hidden">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 pt-12">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Choose page to navigate to
          </SheetDescription>
          <nav className="flex flex-col gap-2">
            <NavLinks onClick={() => setIsMenuOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
