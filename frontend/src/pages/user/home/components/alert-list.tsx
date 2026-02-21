import { memo } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlertListItem } from "./alert-list-item";
import { EmptyStates } from "./empty-states";
import type { AlertView } from "../types";

interface AlertListProps {
  alerts: AlertView[];
  loading: boolean;
  hasSession: boolean;
}

const VISIBLE_COUNT = 3;

function AlertListInner({ alerts, loading, hasSession }: AlertListProps) {
  const visibleAlerts = alerts.slice(0, VISIBLE_COUNT);
  const hasMore = alerts.length > VISIBLE_COUNT;

  return (
    <section className="space-y-2" aria-label="Recent alerts">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Recent Alerts</h2>
        {hasMore && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                aria-label={`View all ${alerts.length} alerts`}
              >
                View All
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 px-1 text-[9px] font-bold"
                >
                  {alerts.length}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
              <SheetHeader className="pb-3">
                <SheetTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  All Alerts
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {alerts.length}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              <div
                className="space-y-0 overflow-y-auto flex-1"
                role="list"
                aria-label="Complete alert history"
              >
                {alerts.map((a, i) => (
                  <div key={a.id}>
                    <AlertListItem alert={a} />
                    {i < alerts.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Content */}
      {!hasSession ? (
        <EmptyStates variant="not-signed-in" />
      ) : loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : alerts.length === 0 ? (
        <EmptyStates variant="all-clear" />
      ) : (
        <div role="list" aria-label="Recent alerts list">
          {visibleAlerts.map((a, i) => (
            <div key={a.id}>
              <AlertListItem alert={a} />
              {i < visibleAlerts.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const AlertList = memo(AlertListInner);