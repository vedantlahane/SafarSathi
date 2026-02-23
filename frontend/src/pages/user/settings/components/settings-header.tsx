import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/store";

interface SettingsHeaderProps {
    name?: string;
    email?: string;
    onEdit: () => void;
}

function SettingsHeaderInner({ name, email, onEdit }: SettingsHeaderProps) {
    const initial = name?.charAt(0).toUpperCase() || "T";

    return (
        <div className="flex items-center gap-4 p-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="text-xl font-semibold">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold truncate">{name || "Tourist"}</p>
                <p className="text-sm text-muted-foreground truncate">{email || ""}</p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="gap-1 shrink-0"
                onClick={() => { hapticFeedback("light"); onEdit(); }}
                aria-label="Edit profile"
            >
                Edit
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

export const SettingsHeader = memo(SettingsHeaderInner);
