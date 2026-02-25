import { memo, type ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";

interface SettingsGroupProps {
    heading: string;
    children: ReactNode;
}

/** Section wrapper with uppercase heading */
function SettingsGroupInner({ heading, children }: SettingsGroupProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-4">
                {heading}
            </h3>
            <GlassCard level={2} className="overflow-hidden border-border/50">
                {children}
            </GlassCard>
        </div>
    );
}

export const SettingsGroup = memo(SettingsGroupInner);
