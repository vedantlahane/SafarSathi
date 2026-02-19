import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { GradientMeshBackground } from "@/lib/theme/gradient-mesh";
import { SOSProvider } from "@/components/sos/sos-provider";
import { SOSBall } from "@/components/sos/sos-ball";
import { StatusBar } from "./components/status-bar";
import { BottomNav } from "./components/bottom-nav";
import { VALID_TABS, DEFAULT_TAB, type TabValue } from "./types";

import Home from "@/pages/user/home/Home";
import Map from "@/pages/user/map/Map";
import Identity from "@/pages/user/ID/Identity";
import Settings from "@/pages/user/settings/Settings";

const PAGES: Record<TabValue, React.ComponentType> = {
    home: Home,
    map: Map,
    identity: Identity,
    settings: Settings,
};

function getInitialTab(): TabValue {
    const hash = window.location.hash.replace("#/", "");
    return VALID_TABS.includes(hash as TabValue)
        ? (hash as TabValue)
        : DEFAULT_TAB;
}

const UserLayout = () => {
    useEffect(() => {
        if (!window.location.hash) {
            window.location.hash = `#/${DEFAULT_TAB}`;
        }
    }, []);

    const handleTabChange = (value: string) => {
        window.location.hash = `#/${value}`;
    };

    return (
        <ThemeProvider>
            <SOSProvider>
                {/* Animated gradient mesh behind everything */}
                <GradientMeshBackground />

                <Tabs
                    defaultValue={getInitialTab()}
                    onValueChange={handleTabChange}
                    className="fixed inset-0 flex flex-col"
                >
                    {/* Top safe area */}
                    <StatusBar />

                    {/* Page content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 no-scrollbar relative z-10">
                        {(Object.entries(PAGES) as [TabValue, React.ComponentType][]).map(
                            ([value, Page]) => (
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
                            ),
                        )}
                    </div>

                    {/* Bottom navigation */}
                    <BottomNav />
                </Tabs>

                {/* SOS ball — floating above everything, outside the tab system */}
                <SOSBall />
            </SOSProvider>
        </ThemeProvider>
    );
};

export default UserLayout;
