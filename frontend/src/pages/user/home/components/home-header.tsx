import { memo } from "react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

interface HomeHeaderProps {
    alertCount: number;
}

function HomeHeaderInner({ alertCount }: HomeHeaderProps) {
    const session = useSession();

    return (
        <header className="flex items-center justify-between" id="home-header">
            <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2" style={{ borderColor: "var(--theme-primary)" }}>
                    <AvatarFallback
                        className="font-bold text-sm"
                        style={{
                            backgroundColor: "var(--theme-primary)",
                            color: "var(--theme-primary-foreground)",
                            opacity: 0.15,
                        }}
                    >
                        {session?.name?.slice(0, 2).toUpperCase() ?? "GT"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs text-muted-foreground">Welcome back,</p>
                    <h1 className="text-base font-bold leading-tight">
                        {session?.name ?? "Guest"}
                    </h1>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full"
                aria-label={`Notifications${alertCount > 0 ? ` — ${alertCount} new` : ""}`}
                id="notification-bell"
            >
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px]"
                    >
                        {alertCount}
                    </Badge>
                )}
            </Button>
        </header>
    );
}

export const HomeHeader = memo(HomeHeaderInner);
