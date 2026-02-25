import { useMemo, useState } from "react";
import { Bell, CheckCheck, Info, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { NotificationView } from "../types";

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationView[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: "home" | "map" | "identity" | "settings") => void;
}

function typeIcon(type: NotificationView["type"]) {
  if (type === "alert") return ShieldAlert;
  if (type === "score_change") return TrendingUp;
  if (type === "tip") return Sparkles;
  return Info;
}

export function NotificationSheet({
  open,
  onOpenChange,
  notifications,
  onRead,
  onMarkAllRead,
  onNavigate,
}: NotificationSheetProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = useMemo(
    () => notifications.filter((n) => (filter === "unread" ? !n.read : true)),
    [notifications, filter]
  );

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[72vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </SheetTitle>
          <SheetDescription>
            Alerts, score changes, and system updates.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                className="h-8 rounded-full"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === "unread" ? "default" : "outline"}
                className="h-8 rounded-full"
                onClick={() => setFilter("unread")}
              >
                Unread ({unread})
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={onMarkAllRead}
              disabled={!unread}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filtered.length === 0 ? (
            <GlassCard level={3} className="rounded-2xl p-4 text-center text-sm text-muted-foreground">
              No notifications in this view.
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const Icon = typeIcon(item.type);
                return (
                  <button
                    key={item.id}
                    className="w-full rounded-2xl border border-border/60 bg-muted/20 px-3 py-3 text-left active:scale-[0.99]"
                    onClick={() => {
                      onRead(item.id);
                      onNavigate(item.sourceTab);
                      onOpenChange(false);
                    }}
                    aria-label={`Open ${item.title} notification`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground">{item.time}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.message}
                        </p>
                      </div>
                      {!item.read && <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
