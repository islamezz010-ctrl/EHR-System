"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  avatar?: string;
  initials?: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showAvatars?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className,
  dropdownClassName,
  disabled = false,
  showSearch = false,
  searchPlaceholder = "Search...",
  showAvatars = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Reset search when dropdown closes/opens
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full text-foreground", className)}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-input/60 bg-background/50 px-3.5 py-2 text-left text-sm shadow-xs outline-hidden transition-all duration-200 cursor-pointer hover:border-primary/50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "border-primary/50 ring-[3px] ring-primary/20",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {showAvatars && selectedOption && (
            <>
              {selectedOption.avatar ? (
                <img
                  src={selectedOption.avatar}
                  alt={selectedOption.label}
                  className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary dark:bg-primary/20">
                  {selectedOption.initials || getInitials(selectedOption.label)}
                </span>
              )}
            </>
          )}
          <span className={cn("truncate font-medium", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border/60 bg-background/80 shadow-2xl shadow-black/10 ring-1 ring-black/[0.03] backdrop-blur-xl dark:border-border/40 dark:bg-background/70 dark:shadow-black/30 dark:ring-white/[0.04]",
            dropdownClassName
          )}
          style={{
            animation: "dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "top"
          }}
        >
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {showSearch && (
            <div className="relative border-b border-border/50 p-2">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg bg-muted/40 pl-8 pr-3 text-xs outline-hidden border border-transparent focus:border-border focus:bg-muted/10 transition-all duration-150"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <ul className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-all duration-150 cursor-pointer",
                        isSelected
                          ? "bg-primary/10 text-primary dark:bg-primary/15"
                          : "text-foreground hover:bg-muted/70 dark:hover:bg-muted/40 hover:translate-x-0.5",
                      )}
                    >
                      {showAvatars && (
                        <>
                          {opt.avatar ? (
                            <img
                              src={opt.avatar}
                              alt={opt.label}
                              className="size-7 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                            />
                          ) : (
                            <span
                              className={cn(
                                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-150",
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:bg-primary/20",
                              )}
                            >
                              {opt.initials || getInitials(opt.label)}
                            </span>
                          )}
                        </>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{opt.label}</p>
                        {opt.sublabel && (
                          <p className="truncate text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
                            {opt.sublabel}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No items found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
