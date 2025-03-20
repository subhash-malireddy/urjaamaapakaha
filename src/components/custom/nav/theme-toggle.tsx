"use client";

import { Moon, Sun } from "lucide-react";
// import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  //   const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      // onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      onClick={() => console.log("setting theme")}
      aria-label="Toggle theme"
    >
      <Sun className="text-accent-foreground h-5 w-5 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      <Moon className="text-accent-foreground absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
