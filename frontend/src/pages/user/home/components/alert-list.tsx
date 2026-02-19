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

function AlertListInner({ alerts, loading, hasSession }: AlertListProps) {
    return (
        <section className="space-y-2" id="alert-list" aria-label="Recent alerts">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Recent Alerts</h2>
                {alerts.length > 0 && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                                View All
                                <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[9px]">
                                    {alerts.length}
                                </Badge>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" /> All Alerts
                                </SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-1 overflow-y-auto">
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
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            ) : alerts.length === 0 ? (
                <EmptyStates variant="all-clear" />
            ) : (
                <div>
                    {alerts.slice(0, 3).map((a, i) => (
                        <div key={a.id}>
                            <AlertListItem alert={a} />
                            {i < Math.min(alerts.length, 3) - 1 && <Separator />}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export const AlertList = memo(AlertListInner);
