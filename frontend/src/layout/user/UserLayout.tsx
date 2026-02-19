import { useEffect } from "react";
import {
  Home as HomeIcon,
  Map as MapIcon,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import Home from "@/pages/user/home/Home";
import Map from "@/pages/user/map/Map";
import Identity from "@/pages/user/ID/Identity";
import Settings from "@/pages/user/settings/Settings";

// ─── Types ─────────────────────────────────────────────
type TabValue = "home" | "map" | "identity" | "settings";

interface NavItem {
  value: TabValue;
  label: string;
  icon: typeof HomeIcon;
  component: React.ComponentType;
}

// ─── Constants ─────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { value: "home", label: "Home", icon: HomeIcon, component: Home },
  { value: "map", label: "Map", icon: MapIcon, component: Map },
  { value: "identity", label: "ID", icon: User, component: Identity },
  { value: "settings", label: "Settings", icon: SettingsIcon, component: Settings },
];

const VALID_TABS = NAV_ITEMS.map((item) => item.value);

const DEFAULT_TAB: TabValue = "home";

// ─── Helpers ───────────────────────────────────────────
function getInitialTab(): TabValue {
  const hash = window.location.hash.replace("#/", "");
  return VALID_TABS.includes(hash as TabValue)
    ? (hash as TabValue)
    : DEFAULT_TAB;
}

// ─── Component ─────────────────────────────────────────
const UserLayout = () => {
  // Sync hash on mount
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = `#/${DEFAULT_TAB}`;
    }
  }, []);

  const handleTabChange = (value: string) => {
    window.location.hash = `#/${value}`;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tabs
        defaultValue={getInitialTab()}
        onValueChange={handleTabChange}
        className="fixed inset-0 flex flex-col bg-slate-50"
      >
        {/* ── Status Bar ─────────────────────────────── */}
        <div className="safe-area-top bg-primary" />

        {/* ── Page Content ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 no-scrollbar">
          {NAV_ITEMS.map(({ value, component: Page }) => (
            <TabsContent
              key={value}
              value={value}
              forceMount      // keeps DOM alive so scroll position is preserved
              className={cn(
                "mt-0 min-h-full transition-opacity duration-200",
                "data-[state=inactive]:hidden"
                // swap with below if you want fade instead of unmount:
                // "data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none"
              )}
            >
              <Page />
            </TabsContent>
          ))}
        </div>

        {/* ── Bottom Navigation ──────────────────────── */}
        <nav className="fixed inset-x-0 bottom-0 z-50 safe-area-bottom">
          <Card className="mx-3 mb-3 rounded-2xl bg-white/90 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-300/30">
            <TabsList className="flex w-full items-center justify-around bg-transparent px-1 py-1.5 h-auto">
              {NAV_ITEMS.map((item) => (
                <NavTrigger key={item.value} item={item} />
              ))}
            </TabsList>
          </Card>
        </nav>
      </Tabs>
    </TooltipProvider>
  );
};

// ─── Nav Trigger (extracted for clarity) ───────────────
interface NavTriggerProps {
  item: NavItem;
}

const NavTrigger = ({ item }: NavTriggerProps) => {
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TabsTrigger
          value={item.value}
          className={cn(
            // reset default shadcn trigger styles
            "relative flex flex-col items-center gap-1",
            "rounded-xl px-5 py-2.5",
            "transition-all duration-200",
            "bg-transparent shadow-none border-none",
            // inactive
            "text-slate-400 hover:text-slate-600 active:scale-95",
            // active  (shadcn sets data-[state=active])
            "data-[state=active]:bg-primary/10",
            "data-[state=active]:text-primary",
            "data-[state=active]:shadow-none"
          )}
        >
          {/* Icon */}
          <Icon
            className={cn(
              "relative h-5 w-5 transition-transform duration-200",
              // scale handled via group or data attr
            )}
            // CSS can't easily animate scale with data attrs,
            // so we use a small trick below
          />

          {/* Label */}
          <span
            className={cn(
              "relative text-[10px] font-semibold transition-colors",
            )}
          >
            {item.label}
          </span>

          {/* Active indicator dot */}
          <span
            className={cn(
              "absolute -bottom-0.5 left-1/2 -translate-x-1/2",
              "h-1 w-6 rounded-full bg-primary",
              "transition-transform duration-200 origin-center",
              "scale-x-0",
              // only show when active
              "group-data-[state=active]:scale-x-100"
            )}
          />
        </TabsTrigger>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
};

export default UserLayout;