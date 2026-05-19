"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "sidebar" | "ghost";
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border transition-colors motion-safe:active:scale-[0.98]",
        variant === "sidebar" &&
          "border-white/15 bg-white/5 text-sidebar-foreground hover:bg-white/10",
        variant === "ghost" &&
          "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "default" &&
          "border-border/60 bg-card text-foreground shadow-sm hover:bg-muted",
        className,
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="size-[18px]" aria-hidden />
      ) : (
        <Moon className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}
