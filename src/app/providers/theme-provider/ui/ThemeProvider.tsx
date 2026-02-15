import { useTheme } from "@/entities/theme";
import { useEffect } from "react";

export const ThemeProvider = () => {
  const theme = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const applySystem = () => {
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      };

      applySystem();

      mediaQuery.addEventListener("change", applySystem);

      return () => mediaQuery.removeEventListener("change", applySystem);
    }

    root.classList.add(theme);
  }, [theme]);

  return null;
};
