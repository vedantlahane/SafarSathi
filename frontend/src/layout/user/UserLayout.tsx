import { useState, useEffect } from "react";
import {
  Home as HomeIcon,
  Map as MapIcon,
  User,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Home from "@/pages/home/Home";
import Map from "@/pages/Map";
import Identity from "@/pages/Identity";
import Settings from "@/pages/Settings";
import { useSession } from "@/lib/session";

type TabValue = "home" | "map" | "identity" | "settings";

const NAV_ITEMS: { value: TabValue; label: string; icon: typeof HomeIcon }[] = [
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "map", label: "Map", icon: MapIcon },
  { value: "identity", label: "ID", icon: User },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

const MobileLayout = () => {
  const [activeTab, setActiveTab] = useState<TabValue>("home");
  const session = useSession();

  useEffect(() => {
    const hash = window.location.hash.replace("#/", "");
    if (["home", "map", "identity", "settings"].includes(hash)) {
      setActiveTab(hash as TabValue);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "map":
        return <Map />;
      case "identity":
        return <Identity />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50">
      {/* Status Bar */}
      <div className="safe-area-top bg-primary" />
      
      {/* App Header */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/50">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">SafarSathi</h1>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">
                {session?.name ? `Hi, ${session.name.split(' ')[0]}` : 'Tourist Safety'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 no-scrollbar">
        <div className="transition-page min-h-full">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 safe-area-bottom">
        <div className="mx-3 mb-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl shadow-slate-300/30">
          <div className="flex items-center justify-around px-1 py-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    setActiveTab(item.value);
                    window.location.hash = `#/${item.value}`;
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-xl px-5 py-2.5 transition-all duration-200 touch-action",
                    isActive
                      ? "text-primary"
                      : "text-slate-400 hover:text-slate-600 active:scale-95"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-primary/10 rounded-xl" />
                  )}
                  <item.icon className={cn(
                    "relative h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "relative text-[10px] font-semibold transition-all",
                    isActive ? "text-primary" : "text-slate-500"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
