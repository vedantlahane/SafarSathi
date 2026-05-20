import { Outlet, useLocation, useNavigate } from "react-router";

import { ThemeProvider } from "@/lib/theme/theme-provider";
import { GradientMeshBackground } from "@/lib/theme/gradient-mesh";
import { SOSProvider } from "@/components/sos/sos-provider";
import { SOSBall } from "@/components/sos/sos-ball";
import { StatusBar } from "./components/status-bar";
import { BottomNav } from "./components/bottom-nav";
import Onboarding from "@/pages/user/onboarding/Onboarding";
import { useEffect } from "react";
import { NAVIGATE_TAB_EVENT, type NavigateTabDetail } from "@/pages/user/home/types";
import { VALID_TABS, type TabValue } from "./types";

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for programmatic tab navigation (from Quick Actions, etc.)
  useEffect(() => {
    const handler = (e: Event) => {
      const { tab } = (e as CustomEvent<NavigateTabDetail>).detail;
      if (VALID_TABS.includes(tab as TabValue)) {
        navigate(`/${tab}`);
      }
    };
    window.addEventListener(NAVIGATE_TAB_EVENT, handler);
    return () => window.removeEventListener(NAVIGATE_TAB_EVENT, handler);
  }, [navigate]);

  return (
    <ThemeProvider>
      <SOSProvider>
        <GradientMeshBackground />

        <div className="fixed inset-0 flex flex-col">
          <StatusBar />

          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 no-scrollbar relative z-10">
            <div className="min-h-full">
              <Outlet />
            </div>
          </div>

          <BottomNav currentPath={location.pathname} onNavigate={(path) => navigate(path)} />
        </div>

        <SOSBall />
        <Onboarding />
      </SOSProvider>
    </ThemeProvider>
  );
};

export default UserLayout;