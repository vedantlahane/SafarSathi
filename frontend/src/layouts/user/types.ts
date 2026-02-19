import type { ComponentType } from "react";
import { Home as HomeIcon, Map as MapIcon, User, Settings as SettingsIcon } from "lucide-react";

export type TabValue = "home" | "map" | "identity" | "settings";

export interface NavItem {
    value: TabValue;
    label: string;
    icon: ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
    { value: "home", label: "Home", icon: HomeIcon },
    { value: "map", label: "Map", icon: MapIcon },
    { value: "identity", label: "ID", icon: User },
    { value: "settings", label: "Settings", icon: SettingsIcon },
];

export const VALID_TABS = NAV_ITEMS.map((item) => item.value);
export const DEFAULT_TAB: TabValue = "home";
