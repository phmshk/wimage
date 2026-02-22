import { NavLinks } from "@/widgets/navlinks";

export const DesktopNav = () => {
  return (
    <nav className="hidden md:flex items-center gap-1">
      <NavLinks />
    </nav>
  );
};
