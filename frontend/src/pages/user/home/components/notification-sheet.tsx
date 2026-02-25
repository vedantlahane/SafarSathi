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
import { cn } from "@/lib/utils";
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
      <SheetContent
        side="bottom"
        className={cn(
          "h-[75vh] rounded-[32px] border border-white/20 dark:border-white/10",
          "bg-white/60 dark:bg-slate-950/60 backdrop-blur-[40px] backdrop-saturate-[200%]",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_24px_48px_rgba(0,0,0,0.2)]",
          "dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_24px_48px_rgba(0,0,0,0.6)]"
        )}
      >
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
                  <GlassCard
                    level={2}
                    key={item.id}
                    className="w-full text-left active:scale-[0.98] transition-all duration-300 p-0"
                  >
                    <button
                      className="w-full h-full px-3 py-3"
                      onClick={() => {
                        onRead(item.id);
                        onNavigate(item.sourceTab);
                        onOpenChange(false);
                      }}
                      aria-label={`Open ${item.title} notification`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 rounded-xl bg-primary/10 dark:bg-primary/20 p-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                          <Icon className="h-[18px] w-[18px] text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[15px] font-semibold tracking-tight">{item.title}</p>
                            <span className="text-[11px] font-medium text-muted-foreground bg-slate-100/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">{item.time}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-600 dark:text-slate-300">
                            {item.message}
                          </p>
                        </div>
                        {!item.read && (
                          <div className="mt-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          </div>
                        )}
                      </div>
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
