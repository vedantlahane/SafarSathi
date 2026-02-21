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
        "group relative flex flex-col items-center gap-0.5",
        "rounded-xl px-4 py-2 min-w-[56px]",
        "transition-all duration-200",
        "bg-transparent shadow-none border-none",
        "text-muted-foreground",
        "active:scale-90",
        "data-[state=active]:bg-transparent",
        "data-[state=active]:shadow-none"
      )}
      onClick={() => hapticFeedback("light")}
      aria-label={item.label}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-all duration-200",
          "group-data-[state=active]:scale-110"
        )}
      />
      <span
        className={cn(
          "text-[10px] font-semibold transition-colors duration-200",
          "group-data-[state=active]:font-bold"
        )}
      >
        {item.label}
      </span>

      {/* Active indicator dot — uses group-data selector to read parent state */}
      <span
        className={cn(
          "absolute -bottom-0.5 left-1/2 -translate-x-1/2",
          "h-1 w-1 rounded-full",
          "transition-all duration-200",
          "scale-0 opacity-0",
          "group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100"
        )}
        style={{ backgroundColor: "var(--theme-primary)" }}
        aria-hidden="true"
      />
    </TabsTrigger>
  );
}

export const NavTab = memo(NavTabInner);