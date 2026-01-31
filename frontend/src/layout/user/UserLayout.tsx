import {
  Home as HomeIcon,
  Map as MapIcon,
  User,
  Settings as SettingsIcon,
} from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import Home from "@/pages/home/Home";
import Map from "@/pages/Map";
import Identity from "@/pages/Identity";
import Settings from "@/pages/Settings"
import Header from "./Header";

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
    <div className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden">
        <Header/>
        <Tabs defaultValue="home" className="flex flex-1 flex-col">
          {/* Mobile app bar */}
          <div className="md:hidden px-4 pt-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">SafarSathi</div>
                <div className="text-[14px] font-semibold text-slate-900">Tourist Safety</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-500">Live</span>
              </div>
            </div>
          </div>
          {/* Unified header/nav on desktop */}
          <header className="hidden items-center justify-between px-6 py-3 md:flex">
            <div className="text-sm font-semibold tracking-tight">
              Safar Sathi
            </div>
            <NavBar className="bg-card text-[12px] shadow-sm" />
          </header>

          {/* Content */}
          <TabsContent
            value="home"
            className="flex h-full flex-col overflow-hidden pb-24 pt-2 md:pb-6"
          >
            <div className="flex-1 overflow-y-auto">
              <Home />
            </div>
          </TabsContent>
          <TabsContent value="map" className="flex h-full flex-col px-3 pb-24 pt-2 md:pb-6">
            <Map />
          </TabsContent>
          <TabsContent value="identity" className="h-full overflow-auto px-3 pb-24 pt-2 md:pb-6">
            <Identity />
          </TabsContent>
          <TabsContent value="settings" className="h-full overflow-auto px-3 pb-24 pt-2 md:pb-6">
            <Settings />
          </TabsContent>

          {/* Mobile bottom nav reuses same items */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent md:hidden" />
          <div className="md:hidden fixed inset-x-3 bottom-4 z-30 rounded-full bg-white/90 px-2 py-1 shadow-xl backdrop-blur">
            <NavBar className="flex w-full justify-between bg-transparent" />
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileLayout;
