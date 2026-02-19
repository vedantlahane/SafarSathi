import { memo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SAFETY_TIPS } from "../types";

function DailyTipInner() {
    const [tipIndex] = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length));

    return (
        <GlassCard level={3} className="flex items-start gap-3 p-4" id="daily-tip">
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                    backgroundColor: "color-mix(in oklch, var(--theme-primary) 15%, transparent)",
                }}
            >
                <Lightbulb className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
            </div>
            <div>
                <p className="text-xs font-bold" style={{ color: "var(--theme-primary)" }}>
                    Tip of the Day
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {SAFETY_TIPS[tipIndex]}
                </p>
            </div>
        </GlassCard>
    );
}

export const DailyTip = memo(DailyTipInner);
