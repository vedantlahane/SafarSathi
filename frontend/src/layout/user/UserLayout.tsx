import { useState, useEffect } from "react";
import {
  Home as HomeIcon,
  Map as MapIcon,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import Home from "@/pages/user/home/Home";
import Map from "@/pages/user/map/Map";
import Identity from "@/pages/user/ID/Identity";
import Settings from "@/pages/user/settings/Settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabValue = "home" | "map" | "identity" | "settings";

const NAV_ITEMS: { value: TabValue; label: string; icon: any }[] = [
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "map", label: "Map", icon: MapIcon },
  { value: "identity", label: "ID", icon: User },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

const UserLayout = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("home");

  useEffect(() => {
    const hash = window.location.hash.replace("#/", "");
    if (["home", "map", "identity", "settings"].includes(hash)) {
      setActiveTab(hash as TabValue);
    }
  }, []);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        setActiveTab(v as TabValue);
        try {
          window.location.hash = `#/${v}`;
        } catch (_) {}
      }}
      className="fixed inset-0 flex flex-col bg-slate-50"
    >
      {/* Status Bar */}
      <div className="safe-area-top bg-primary" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 no-scrollbar">
        <div className="transition-page min-h-full">
          <TabsContent value="home" className="mt-0">
            <Home />
          </TabsContent>
          <TabsContent value="map" className="mt-0">
            <Map />
          </TabsContent>
          <TabsContent value="identity" className="mt-0">
            <Identity />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <Settings />
          </TabsContent>
        </div>
      </main>

      {/* Bottom Navigation */}
      <TabsList className="fixed inset-x-0 bottom-0 mx-3 mb-3 h-auto rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl justify-around px-1 py-1.5 safe-area-bottom">
        {NAV_ITEMS.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="flex flex-col gap-1 rounded-xl px-5 py-2.5 data-[state=active]:text-primary data-[state=active]:bg-primary/10"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default UserLayout;
