import { memo } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import type { ThemeMode } from "@/lib/theme/theme-context";

function ThemeSelectorInner() {
    const { themeMode, setThemeMode } = useThemeColors();

    return (
        <div className="space-y-3 px-4">
            <ToggleGroup
                type="single"
                value={themeMode}
                onValueChange={(v) => { if (v) setThemeMode(v as ThemeMode); }}
                className="w-full"
            >
                <ToggleGroupItem value="light" className="flex-1 gap-2" aria-label="Light mode">
                    <Sun className="h-4 w-4" />
                    Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" className="flex-1 gap-2" aria-label="Dark mode">
                    <Moon className="h-4 w-4" />
                    Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="auto" className="flex-1 gap-2" aria-label="Auto mode">
                    <Monitor className="h-4 w-4" />
                    Auto
                </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
                Switches automatically at 6 PM (dark) and 6 AM (light)
            </p>
        </div>
    );
}

export const ThemeSelector = memo(ThemeSelectorInner);
