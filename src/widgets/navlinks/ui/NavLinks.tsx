import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";

interface NavLinksProps {
  onClick?: () => void;
}

export const NavLinks = (props: NavLinksProps) => {
  const { onClick } = props;
  return (
    <>
      <Link
        to="/"
        onClick={onClick}
        activeProps={{
          className: "bg-secondary text-foreground shadow-sm",
        }}
        className={cn(
          "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-all hover:text-foreground",
          "[&.active]:pointer-events-none"
        )}
      >
        Editor
      </Link>
      <Link
        to="/benchmark"
        onClick={onClick}
        activeProps={{
          className: "bg-secondary text-foreground shadow-sm",
        }}
        className={cn(
          "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-all hover:text-foreground",
          "[&.active]:pointer-events-none"
        )}
      >
        Benchmarking
      </Link>
    </>
  );
};
