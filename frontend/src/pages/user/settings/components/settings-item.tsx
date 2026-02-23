import { memo } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
    icon: LucideIcon;
    iconBg?: string;
    iconColor?: string;
    label: string;
    description?: string;
    /** For switch variant */
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
    /** For navigate variant */
    value?: string;
    onClick?: () => void;
    /** "switch" | "navigate" | "static" */
    type?: "switch" | "navigate" | "static";
    disabled?: boolean;
}

/** Reusable settings row — supports Switch, Navigate (ChevronRight), and Static value variants */
function SettingsItemInner({
    icon: Icon, iconBg = "bg-primary/10", iconColor = "text-primary",
    label, description, checked, onCheckedChange, value, onClick, type = "switch", disabled,
}: SettingsItemProps) {
    const Wrapper = type === "navigate" ? "button" : "div";
    const wrapperProps = type === "navigate" ? { onClick, className: "w-full text-left" } : {};

    return (
        <Wrapper {...wrapperProps}>
            <div className={cn("flex items-center justify-between py-4 px-4", disabled && "opacity-50")}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", iconBg)}>
                        <Icon className={cn("h-5 w-5", iconColor)} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium">{label}</p>
                        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
                    </div>
                </div>

                {type === "switch" && onCheckedChange && (
                    <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={label} />
                )}
                {type === "navigate" && (
                    <div className="flex items-center gap-2 shrink-0">
                        {value && <span className="text-sm text-muted-foreground">{value}</span>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                )}
                {type === "static" && value && (
                    <span className="text-sm text-muted-foreground shrink-0">{value}</span>
                )}
            </div>
        </Wrapper>
    );
}

export const SettingsItem = memo(SettingsItemInner);
