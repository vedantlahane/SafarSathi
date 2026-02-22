// src/pages/user/map/components/route-info-panel.tsx
import { memo } from "react";
import {
  Shield,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistance } from "../types";
import type { RouteInfo } from "../types";

interface RouteInfoPanelProps {
  routeInfo: RouteInfo;
  visible: boolean;
}

function RouteInfoPanelInner({ routeInfo, visible }: RouteInfoPanelProps) {
  if (!visible || routeInfo.routes.length === 0 || routeInfo.loading)
    return null;

  return (
    <div className="absolute top-[120px] left-4 right-4 z-[999]">
      <Card className="shadow-lg border-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg overflow-hidden">
        <CardContent className="p-3 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Route Comparison
          </p>
          <div className="space-y-1.5">
            {routeInfo.routes.map((route) => (
              <div
                key={route.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-xs",
                  route.isSafest &&
                    "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800",
                  route.isFastest &&
                    !route.isSafest &&
                    "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800",
                  !route.isSafest &&
                    !route.isFastest &&
                    "bg-muted/30 border border-transparent"
                )}
              >
                {route.isSafest && (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                )}
                {route.isFastest && !route.isSafest && (
                  <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                )}
                {!route.isSafest && !route.isFastest && (
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}

                <span className="font-medium min-w-0 truncate">
                  {route.isSafest
                    ? "Safest"
                    : route.isFastest
                      ? "Fastest"
                      : "Alternative"}
                </span>

                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[9px] h-4 px-1.5",
                      route.safetyScore >= 80 &&
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                      route.safetyScore >= 50 &&
                        route.safetyScore < 80 &&
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                      route.safetyScore < 50 &&
                        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    )}
                  >
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    {route.safetyScore}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatDistance(route.distanceMeters)}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(route.durationSeconds / 60)}m
                  </span>
                  {route.intersections.high > 0 && (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const RouteInfoPanel = memo(RouteInfoPanelInner);