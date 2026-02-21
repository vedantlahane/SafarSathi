import { memo } from "react";
import { TabsList } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { NavTab } from "./nav-tab";
import { NAV_ITEMS } from "../types";

function BottomNavInner() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 safe-area-bottom"
      aria-label="Main navigation"
    >
      <GlassCard level={1} className="mx-3 mb-3 rounded-2xl">
        <TabsList className="flex w-full items-center justify-around bg-transparent h-auto px-2 py-1">
          {NAV_ITEMS.map((item) => (
            <NavTab key={item.value} item={item} />
          ))}
        </TabsList>
      </GlassCard>
    </nav>
  );
}

export const BottomNav = memo(BottomNavInner);