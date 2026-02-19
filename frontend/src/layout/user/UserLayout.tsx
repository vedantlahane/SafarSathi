import { useState, useEffect } from "react";
import {
  Home as HomeIcon,
  Map as MapIcon,
  User,
  Settings as SettingsIcon,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hapticFeedback } from "@/lib/store";
import { useSession } from "@/lib/session";
import Home from "@/pages/user/home/Home";
import Map from "@/pages/user/map/Map";
import Identity from "@/pages/user/ID/Identity";
import Settings from "@/pages/user/settings/Settings";
import SOS from "@/components/user/SOS";

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
  // gap in the middle for SOS button
  { value: "identity", label: "ID", icon: User, component: Identity },
  { value: "settings", label: "Settings", icon: SettingsIcon, component: Settings },
];

const VALID_TABS = NAV_ITEMS.map((item) => item.value);
const DEFAULT_TAB: TabValue = "home";

function getInitialTab(): TabValue {
  const hash = window.location.hash.replace("#/", "");
  return VALID_TABS.includes(hash as TabValue)
    ? (hash as TabValue)
    : DEFAULT_TAB;
}

// ─── Layout Component ──────────────────────────────────
const UserLayout = () => {
  const session = useSession();
  const [sosOpen, setSosOpen] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = `#/${DEFAULT_TAB}`;
    }
  }, []);

  const handleTabChange = (value: string) => {
    window.location.hash = `#/${value}`;
  };

  const handleSOSTrigger = () => {
    hapticFeedback("heavy");
    setSosOpen(true);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tabs
        defaultValue={getInitialTab()}
        onValueChange={handleTabChange}
        className="fixed inset-0 flex flex-col bg-background"
      >
        {/* ── Status Bar Safe Area ── */}
        <div className="safe-area-top bg-primary" />

        {/* ── Page Content ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 no-scrollbar">
          {NAV_ITEMS.map(({ value, component: Page }) => (
            <TabsContent
              key={value}
              value={value}
              forceMount
              className={cn(
                "mt-0 min-h-full",
                "data-[state=inactive]:hidden",
              )}
            >
              <Page />
            </TabsContent>
          ))}
        </div>

        {/* ── Bottom Navigation with Central SOS ── */}
        <nav className="fixed inset-x-0 bottom-0 z-50 safe-area-bottom">
          {/* SOS Button — Floating above the nav bar */}
          <div className="flex justify-center -mb-7 relative z-10">
            <button
              onClick={handleSOSTrigger}
              className={cn(
                "group relative flex h-16 w-16 items-center justify-center",
                "rounded-full bg-destructive text-destructive-foreground",
                "shadow-lg shadow-destructive/30",
                "active:scale-90 transition-all duration-150",
                "ring-4 ring-background",
                // Pulse animation for attention
                "before:absolute before:inset-0 before:rounded-full",
                "before:bg-destructive/20 before:animate-ping",
              )}
              aria-label="Emergency SOS"
            >
              <Siren className="h-7 w-7 relative z-10" />
            </button>
          </div>

          {/* Navigation Bar */}
          <Card className="mx-3 mb-3 rounded-2xl border-border/50 shadow-lg">
            <TabsList className="flex w-full items-center justify-around bg-transparent h-auto px-2 py-1">
              {/* First two tabs */}
              {NAV_ITEMS.slice(0, 2).map((item) => (
                <NavTab key={item.value} item={item} />
              ))}

              {/* SOS spacer — keeps tabs evenly distributed */}
              <div className="w-16" aria-hidden />

              {/* Last two tabs */}
              {NAV_ITEMS.slice(2).map((item) => (
                <NavTab key={item.value} item={item} />
              ))}
            </TabsList>
          </Card>
        </nav>

        {/* ── SOS Dialog (Global) ── */}
        <SOSDialog
          open={sosOpen}
          onOpenChange={setSosOpen}
          touristId={session?.touristId || ""}
        />
      </Tabs>
    </TooltipProvider>
  );
};

// ─── Nav Tab Button ────────────────────────────────────
function NavTab({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TabsTrigger
          value={item.value}
          className={cn(
            "relative flex flex-col items-center gap-0.5",
            "rounded-xl px-4 py-2 min-w-[56px]",
            "transition-all duration-200",
            "bg-transparent shadow-none border-none",
            // Inactive
            "text-muted-foreground",
            "active:scale-90",
            // Active
            "data-[state=active]:bg-primary/10",
            "data-[state=active]:text-primary",
            "data-[state=active]:shadow-none",
          )}
          onClick={() => hapticFeedback("light")}
        >
          <Icon className={cn(
            "h-5 w-5 transition-transform duration-200",
            "group-data-[state=active]:scale-110",
          )} />
          <span className="text-[10px] font-semibold">{item.label}</span>

          {/* Active indicator */}
          <span
            className={cn(
              "absolute -bottom-0.5 left-1/2 -translate-x-1/2",
              "h-0.5 w-4 rounded-full bg-primary",
              "transition-transform duration-200",
              "scale-x-0",
            )}
            style={{
              // CSS trick: use the parent's data attribute
              transform: "var(--active-scale, scaleX(0))",
            }}
          />
        </TabsTrigger>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Global SOS Dialog ─────────────────────────────────
function SOSDialog({
  open,
  onOpenChange,
  touristId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  touristId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-[92vw] p-0 overflow-hidden gap-0">
        {/* Red header */}
        <div className="bg-destructive p-6 text-destructive-foreground text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/20 mx-auto mb-3">
            <Siren className="h-8 w-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive-foreground text-center">
              Emergency SOS
            </DialogTitle>
            <DialogDescription className="text-destructive-foreground/80 text-center">
              This will alert authorities and share your exact location
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* SOS Component — your existing component handles the logic */}
        <div className="p-6">
          <SOS
            touristId={touristId}
            // onSuccess={() => {
            //   // Keep dialog open to show confirmation
            // }}
          />
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-12"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserLayout;