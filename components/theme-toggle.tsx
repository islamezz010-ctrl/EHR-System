"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  collapsed?: boolean;
};

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = resolvedTheme ?? theme ?? "light";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center gap-3 rounded-md px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer",
            collapsed && "lg:px-0 lg:justify-center",
          )}
          title="Theme"
        >
          {current === "dark" ? (
            <Moon className="size-4 shrink-0 text-primary" />
          ) : (
            <Sun className="size-4 shrink-0 text-amber-500" />
          )}
          <span
            className={cn(
              "transition-all duration-300",
              collapsed ? "lg:hidden opacity-0 w-0" : "opacity-100",
            )}
          >
            Theme
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-auto p-1.5"
      >
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={current === "light" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setTheme("light")}
            title="Light mode"
            aria-label="Light mode"
          >
            <Sun className="size-4" />
          </Button>
          <Button
            type="button"
            variant={current === "dark" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setTheme("dark")}
            title="Dark mode"
            aria-label="Dark mode"
          >
            <Moon className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
