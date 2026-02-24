import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { GradientMeshBackground } from "@/lib/theme/gradient-mesh";
import { SOSProvider } from "@/components/sos/sos-provider";
import { SOSBall } from "@/components/sos/sos-ball";
import { StatusBar } from "./components/status-bar";
import { BottomNav } from "./components/bottom-nav";
import { VALID_TABS, DEFAULT_TAB, type TabValue } from "./types";
import {
  NAVIGATE_TAB_EVENT,
  type NavigateTabDetail,
} from "@/pages/user/home/types";

import Home from "@/pages/user/home/Home";
import Map from "@/pages/user/map/Map";
import Identity from "@/pages/user/ID/Identity";
import Settings from "@/pages/user/settings/Settings";
import Onboarding from "@/pages/user/onboarding/Onboarding";

const PAGES: Record<TabValue, React.ComponentType> = {
  home: Home,
  map: Map,
  identity: Identity,
  settings: Settings,
};

function parseTabFromHash(): TabValue {
  const hash = window.location.hash.replace("#/", "");
  return VALID_TABS.includes(hash as TabValue)
    ? (hash as TabValue)
    : DEFAULT_TAB;
}

const UserLayout = () => {
  const [activeTab, setActiveTab] = useState<TabValue>(parseTabFromHash);

  // Sync hash → state (browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(parseTabFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Set initial hash if empty
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = `#/${DEFAULT_TAB}`;
    }
  }, []);

  // Listen for programmatic tab navigation (from Quick Actions, etc.)
  useEffect(() => {
    const handler = (e: Event) => {
      const { tab } = (e as CustomEvent<NavigateTabDetail>).detail;
      if (VALID_TABS.includes(tab as TabValue)) {
        setActiveTab(tab as TabValue);
        window.location.hash = `#/${tab}`;
      }
    };
    window.addEventListener(NAVIGATE_TAB_EVENT, handler);
    return () => window.removeEventListener(NAVIGATE_TAB_EVENT, handler);
  }, []);

  // Tab change from bottom nav
  const handleTabChange = useCallback((value: string) => {
    const tab = value as TabValue;
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  }, []);

  return (
    <ThemeProvider>
      <SOSProvider>
        <GradientMeshBackground />

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="fixed inset-0 flex flex-col"
        >
          <StatusBar />

          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 no-scrollbar relative z-10">
            {(Object.entries(PAGES) as [TabValue, React.ComponentType][]).map(
              ([value, Page]) => (
                <TabsContent
                  key={value}
                  value={value}
                  forceMount
                  className={cn(
                    "mt-0 min-h-full",
                    "data-[state=inactive]:hidden"
                  )}
                >
                  <Page />
                </TabsContent>
              )
            )}
          </div>

          <BottomNav />
        </Tabs>

        <SOSBall />
        <Onboarding />
      </SOSProvider>
    </ThemeProvider>
  );
};

export default UserLayout;