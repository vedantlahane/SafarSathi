import { memo, useState } from "react";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import { NAVIGATE_TAB_EVENT, type NavigateTabDetail, type NotificationView } from "../types";
import { NotificationSheet } from "./notification-sheet";

interface HomeHeaderProps {
  alertCount: number;
  notifications: NotificationView[];
  onReadNotification: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

function HomeHeaderInner({
  alertCount,
  notifications,
  onReadNotification,
  onMarkAllNotificationsRead,
}: HomeHeaderProps) {
  const session = useSession();
  const [open, setOpen] = useState(false);

  const initials = session?.name
    ? session.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "GT";

  return (
    <header className="flex items-center justify-between" id="home-header">
      <div className="flex items-center gap-3">
        <Avatar
          className="h-11 w-11 border-2 transition-colors duration-2000"
          style={{ borderColor: "var(--theme-primary)" }}
        >
          {/* Avatar image — add back when session includes an avatar URL */}
          <AvatarFallback
            className="font-bold text-sm text-white"
            style={{
              backgroundColor: "color-mix(in oklch, var(--theme-primary) 85%, black)",
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground leading-none">
            Welcome back,
          </p>
          <h1 className="text-base font-bold leading-tight mt-0.5">
            {session?.name ?? "Guest"}
          </h1>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full"
        onClick={() => setOpen(true)}
        aria-label={
          alertCount > 0
            ? `${alertCount} unread notification${alertCount > 1 ? "s" : ""}`
            : "No new notifications"
        }
      >
        <Bell className="h-5 w-5" />
        {alertCount > 0 && (
          <>
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] font-bold"
            >
              {alertCount > 99 ? "99+" : alertCount}
            </Badge>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-40" />
          </>
        )}
      </Button>

      <NotificationSheet
        open={open}
        onOpenChange={setOpen}
        notifications={notifications}
        onRead={onReadNotification}
        onMarkAllRead={onMarkAllNotificationsRead}
        onNavigate={(tab) => {
          window.dispatchEvent(
            new CustomEvent<NavigateTabDetail>(NAVIGATE_TAB_EVENT, {
              detail: { tab },
            })
          );
        }}
      />
    </header>
  );
}

export const HomeHeader = memo(HomeHeaderInner);