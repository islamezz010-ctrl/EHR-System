"use client";

import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  label: string;
  icon: LucideIcon;
};

type SidebarNavGroupProps = {
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  items: SidebarNavItem[];
  expanded: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onExpandSidebar: () => void;
  activeTab: string;
  onSelectTab: (label: string) => void;
  activeTabLabels: Set<string>;
};

export function SidebarNavGroup({
  label,
  icon: GroupIcon,
  iconClassName,
  items,
  expanded,
  onToggle,
  isCollapsed,
  onExpandSidebar,
  activeTab,
  onSelectTab,
  activeTabLabels,
}: SidebarNavGroupProps) {
  const isGroupActive = activeTabLabels.has(activeTab);

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => {
          if (isCollapsed) {
            onExpandSidebar();
            return;
          }
          onToggle();
        }}
        title={isCollapsed ? label : undefined}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-md px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 cursor-pointer",
          isGroupActive && "text-gray-950 dark:text-gray-100",
          isCollapsed && "lg:px-0 lg:justify-center",
        )}
      >
        <GroupIcon
          className={cn("size-4 shrink-0", iconClassName ?? "text-primary")}
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate transition-all duration-300",
            isCollapsed ? "lg:hidden opacity-0 w-0" : "opacity-100",
          )}
        >
          {label}
        </span>
        {!isCollapsed ? (
          expanded ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          )
        ) : null}
      </button>

      {expanded && !isCollapsed ? (
        <div className="mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 ml-5 pl-2">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectTab(item.label)}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 cursor-pointer",
                activeTab === item.label &&
                  "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-100",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {isCollapsed ? (
        <div className="mt-1 space-y-0.5">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectTab(item.label)}
              title={item.label}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-md text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-950 dark:hover:text-gray-100 cursor-pointer",
                activeTab === item.label &&
                  "bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-100",
              )}
            >
              <item.icon className="size-4 shrink-0" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
