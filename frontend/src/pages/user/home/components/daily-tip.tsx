import { memo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SAFETY_TIPS } from "../types";

function DailyTipInner() {
  const [tipIndex] = useState(() =>
    Math.floor(Math.random() * SAFETY_TIPS.length)
  );

  return (
    <GlassCard level={3} className="flex items-start gap-3 p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-2000"
        style={{
          backgroundColor:
            "color-mix(in oklch, var(--theme-primary) 12%, transparent)",
        }}
      >
        <Lightbulb
          className="h-5 w-5 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
      </div>
      <div className="space-y-0.5 pt-0.5">
        <p
          className="text-xs font-bold uppercase tracking-wide transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        >
          Tip of the Day
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {SAFETY_TIPS[tipIndex]}
        </p>
      </div>
    </GlassCard>
  );
}

export const DailyTip = memo(DailyTipInner);