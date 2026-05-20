import { memo } from "react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import type { NavItem } from "../types";

interface NavTabProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavTabInner({ item, isActive, onClick }: NavTabProps) {
  const Icon = item.icon;

  return (
    <button
      data-active={isActive ? "true" : undefined}
      className={cn(
        "group relative flex flex-1 flex-col items-center justify-center p-0",
        "h-full rounded-[24px]",
        "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-transparent shadow-none border-none",
        "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
        "active:scale-[0.88]",
        "data-[active=true]:bg-transparent data-[active=true]:text-primary"
      )}
      onClick={() => {
        hapticFeedback("light");
        onClick();
      }}
      aria-label={item.label}
    >
      <div className={cn(
        "relative flex w-14 h-12 flex-col items-center justify-center overflow-hidden rounded-[18px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "group-data-[active=true]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_8px_16px_-4px_var(--theme-glow)]",
        "dark:group-data-[active=true]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_8px_16px_-4px_var(--theme-glow)]"
      )}>
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-data-[active=true]:scale-110",
            "group-data-[active=true]:drop-shadow-[0_2px_4px_var(--theme-glow)]"
          )}
        />
      </div>
    </button>
  );
}

export const NavTab = memo(NavTabInner);