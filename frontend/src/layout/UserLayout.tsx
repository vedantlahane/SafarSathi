import { Home as HomeIcon, Map as MapIcon, User, Settings as SettingsIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import Home from "@/pages/Home";
import Map from "@/pages/Map";
import Identity from "@/pages/Identity";
import Settings from "@/pages/Settings";

const NAV_ITEMS = [
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "map", label: "Map", icon: MapIcon },
  { value: "identity", label: "ID", icon: User },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

const NavBar = ({ className }: { className?: string }) => (
  <TabsList className={className ?? ""}>
    {NAV_ITEMS.map((item) => (
      <TabsTrigger
        key={item.value}
        value={item.value}
        className="flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] md:px-3 md:py-2 md:text-[12px]"
      >
        <item.icon className="h-4 w-4" />
        <span className="leading-none">{item.label}</span>
      </TabsTrigger>
    ))}
  </TabsList>
);

const MobileLayout = () => {
  return (
    <div className="h-screen w-full bg-background text-[13px]">
      <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden">
        <Tabs defaultValue="home" className="flex flex-1 flex-col">
          {/* Unified header/nav on desktop */}
          <header className="hidden items-center justify-between px-6 py-3 md:flex">
            <div className="text-sm font-semibold tracking-tight">Safar Sathi</div>
            <NavBar className="bg-card text-[12px] shadow-sm" />
          </header>

          {/* Content */}
          <div className="flex-1 overflow-hidden px-3 pb-16 pt-2 md:pb-6">
            <TabsContent value="home" className="flex h-full flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <Home />
              </div>
            </TabsContent>
            <TabsContent value="map" className="flex h-full flex-col">
              <Map />
            </TabsContent>
            <TabsContent value="identity" className="h-full overflow-auto">
              <Identity />
            </TabsContent>
            <TabsContent value="settings" className="h-full overflow-auto">
              <Settings />
            </TabsContent>
          </div>

          {/* Mobile bottom nav reuses same items */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-background via-background/80 to-transparent md:hidden" />
          <div className="md:hidden fixed inset-x-3 bottom-3 z-30 rounded-full bg-card/95 px-2 py-1 shadow-lg backdrop-blur">
            <NavBar className="flex w-full justify-between bg-transparent" />
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileLayout;
