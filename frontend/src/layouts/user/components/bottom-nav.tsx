import { memo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NavTab } from "./nav-tab";
import { NAV_ITEMS } from "../types";

function BottomNavInner({ currentPath, onNavigate }: { currentPath: string, onNavigate: (path: string) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-3 z-40 safe-area-bottom pointer-events-none px-4"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-sm pointer-events-auto">
        <GlassCard level={1} className="rounded-[28px] p-2">
          <div className="flex w-full items-center justify-between bg-transparent h-[56px] px-1 py-0">
            {NAV_ITEMS.map((item) => (
              <NavTab 
                key={item.value} 
                item={item} 
                isActive={currentPath.includes(item.value)} 
                onClick={() => onNavigate(`/${item.value}`)} 
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </nav>
  );
}

export const BottomNav = memo(BottomNavInner);