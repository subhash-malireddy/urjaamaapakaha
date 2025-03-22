"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // istanbul ignore next - we simply check if a mock is called onClick
  const handleClick = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle theme"
      className="fixed right-8 bottom-[4.5rem] z-50 rounded-full opacity-60 shadow-md transition-opacity duration-200 hover:opacity-100 md:bottom-4"
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-transform duration-200 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-transform duration-200 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
