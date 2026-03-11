import { memo } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import type { ThemeMode } from "@/lib/theme/theme-context";

function ThemeSelectorInner() {
    const { themeMode, setThemeMode } = useThemeColors();

    const modes = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "auto", icon: Monitor, label: "Auto" },
    ] as const;

    return (
        <div className="space-y-4 px-4">
            <div className="flex w-full items-center p-1.5 rounded-[24px] bg-slate-900/5 dark:bg-slate-100/5 backdrop-blur-xl border border-black/5 dark:border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                {modes.map(({ id, icon: Icon, label }) => {
                    const isActive = themeMode === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setThemeMode(id as ThemeMode)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-sm font-semibold transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                isActive
                                    ? "bg-white/90 dark:bg-slate-800/90 text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/10"
                                    : "text-muted-foreground hover:text-foreground active:scale-[0.95]"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 transition-all duration-400", isActive && "scale-110 drop-shadow-[0_2px_4px_var(--theme-glow)]")} />
                            {label}
                        </button>
                    );
                })}
            </div>
            <p className="text-center text-xs text-muted-foreground font-medium">
                Switches automatically at 6 PM (dark) and 6 AM (light)
            </p>
        </div>
    );
}

export const ThemeSelector = memo(ThemeSelectorInner);
