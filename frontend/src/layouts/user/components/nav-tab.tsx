import { memo } from "react";
import { cn } from "@/lib/utils";
import { TabsTrigger } from "@/components/ui/tabs";
import { hapticFeedback } from "@/lib/store";
import type { NavItem } from "../types";

interface NavTabProps {
  item: NavItem;
}

function NavTabInner({ item }: NavTabProps) {
  const Icon = item.icon;

  return (
    <TabsTrigger
      value={item.value}
      className={cn(
        "group relative flex flex-1 flex-col items-center justify-center p-0",
        "h-full rounded-[24px]",
        "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-transparent shadow-none border-none",
        "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
        "active:scale-[0.88]",
        "data-[state=active]:bg-transparent data-[state=active]:text-primary",
        
      )}
      onClick={() => hapticFeedback("light")}
      aria-label={item.label}
    >
      <div className={cn(
        "relative flex w-14 h-12 flex-col items-center justify-center overflow-hidden rounded-[18px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",

        "group-data-[state=active]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_8px_16px_-4px_var(--theme-glow)]",
        "dark:group-data-[state=active]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_8px_16px_-4px_var(--theme-glow)]"
      )}>
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-data-[state=active]:scale-110",
            "group-data-[state=active]:drop-shadow-[0_2px_4px_var(--theme-glow)]"
          )}
        />
      </div>
    </TabsTrigger>
  );
}

export const NavTab = memo(NavTabInner);