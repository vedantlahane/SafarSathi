import { memo, type ReactNode } from "react";

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
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {children}
            </div>
        </div>
    );
}

export const SettingsGroup = memo(SettingsGroupInner);
